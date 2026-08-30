import { useState, type ChangeEvent, type FormEvent } from 'react';
import './CompetitionCard.css';

interface Competition {
  id: number;
  title: string;
  description: string;
  prizeType: string;
  prizeAmount: number;
  prizeDetails: {
    currency: string;
    description: string;
    includes?: string[];
  };
  entryPrice: number;
  totalEntries: number;
  soldEntries: number;
  endsIn: string;
  tags: string[];
  profitMargin: string;
  expectedWinners: number;
}

interface CompetitionCardProps {
  competition: Competition;
}

const CompetitionCard = ({ competition }: CompetitionCardProps) => {
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [quantity, setQuantity] = useState(1);
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'paypal'>('stripe');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showFreeEntry, setShowFreeEntry] = useState(false);
  const [freeEntryStatusMessage, setFreeEntryStatusMessage] = useState('');
  const [freeEntryDetails, setFreeEntryDetails] = useState({
    fullName: '',
    email: '',
    postalAddress: '',
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const progressPercent = (competition.soldEntries / competition.totalEntries) * 100;
  const totalCost = quantity * competition.entryPrice;
  const formattedEntryPrice = competition.entryPrice.toFixed(2);
  const formattedTotalCost = totalCost.toFixed(2);
  const remainingEntries = competition.totalEntries - competition.soldEntries;
  const odds = ((1 / remainingEntries) * 100).toFixed(6);

  const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value > 0 && value <= 100) {
      setQuantity(value);
    }
  };

  const handleEnterNow = async () => {
    if (!termsAccepted) {
      window.alert('Please accept the terms and no-purchase route declaration first.');
      return;
    }

    const confirmed = window.confirm(`Buy ${quantity} ticket${quantity > 1 ? 's' : ''} for £${formattedTotalCost}?`);
    if (!confirmed) return;

    setIsProcessingPayment(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/competitions/${competition.id}/checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity,
          termsAccepted: true,
          prizeOption: 'cash',
          paymentProvider,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.checkoutUrl) {
        throw new Error(payload.error || payload.details || 'Unable to start checkout');
      }

      setShowCelebration(true);
      window.setTimeout(() => {
        window.location.href = payload.checkoutUrl;
      }, 350);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start checkout';
      window.alert(message);
    } finally {
      setIsProcessingPayment(false);
      window.setTimeout(() => setShowCelebration(false), 1800);
    }
  };

  const handleFreeEntrySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFreeEntryStatusMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/competitions/${competition.id}/free-entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...freeEntryDetails,
          termsAccepted: true,
          declarationAccepted: true,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to submit free entry');
      }
      setFreeEntryStatusMessage(`Free entry submitted. Reference: ${payload.reference}`);
      setFreeEntryDetails({ fullName: '', email: '', postalAddress: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit free entry';
      setFreeEntryStatusMessage(message);
    }
  };

  return (
    <div className="competition-card">
      <div className="card-header">
        <span className="card-badge">{competition.prizeType}</span>
      </div>

      <div className="card-content">
        <div className="prize-section">
          <p className="prize-label">WIN</p>
          <h3 className="prize-amount">
            {competition.prizeAmount.toLocaleString()} {competition.prizeDetails.currency}
          </h3>
          <p className="prize-description">{competition.description}</p>
          {competition.prizeDetails.includes && (
            <div className="prize-includes">
              {competition.prizeDetails.includes.map((item, idx) => (
                <span key={idx} className="include-item">✓ {item}</span>
              ))}
            </div>
          )}
        </div>

        <div className="prize-image-placeholder">
          <div className="image-placeholder">💎</div>
        </div>
      </div>

      <div className="card-stats">
        <div className="stat">
          <span className="stat-label">TICKET PRICE</span>
          <span className="stat-value">£{formattedEntryPrice}</span>
          <span className="stat-sublabel">PER ENTRY</span>
        </div>
        <div className="stat">
          <span className="stat-label">ODDS (Each Entry)</span>
          <span className="stat-value">1 in {remainingEntries.toLocaleString()}</span>
          <span className="stat-sublabel">{odds}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">ENTRIES AVAILABLE</span>
          <span className="stat-value">{remainingEntries.toLocaleString()}</span>
          <span className="stat-sublabel">of {competition.totalEntries.toLocaleString()}</span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span>Entries Sold</span>
          <span>{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <div className="progress-detail">
          {competition.soldEntries.toLocaleString()} / {competition.totalEntries.toLocaleString()} sold
        </div>
      </div>

      <div className="transparency-section">
        <h4>💡 Transparent Structure</h4>
        <p className="transparency-text">{competition.profitMargin}</p>
        <p className="transparency-text">Expected Winners: {competition.expectedWinners}</p>
      </div>

      <div className="card-tags">
        {competition.tags.map((tag, idx) => (
          <span key={idx} className="tag">✓ {tag}</span>
        ))}
      </div>

      <div className="entry-controls">
        <div className="quantity-selector">
          <label>Number of Tickets:</label>
          <input
            type="number"
            min="1"
            max="100"
            value={quantity}
            onChange={handleQuantityChange}
            className="quantity-input"
          />
        </div>
        <div className="cost-display">
          <span className="cost-label">Total Cost:</span>
          <span className="cost-amount">£{formattedTotalCost}</span>
        </div>
      </div>

      <label className="terms-check">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
        />
        <span>
          I accept terms and acknowledge a free no-purchase entry route is available.
        </span>
      </label>

      <div className="payment-provider">
        <label htmlFor={`provider-${competition.id}`}>Payment Method</label>
        <select
          id={`provider-${competition.id}`}
          value={paymentProvider}
          onChange={(e) => setPaymentProvider(e.target.value === 'paypal' ? 'paypal' : 'stripe')}
        >
          <option value="stripe">Stripe (Card)</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>

      <button className="btn-enter-now" onClick={handleEnterNow} disabled={isProcessingPayment}>
        {isProcessingPayment ? 'STARTING CHECKOUT...' : `PAY WITH ${paymentProvider.toUpperCase()} - £${formattedTotalCost}`}
      </button>

      <div className="compliance-note">
        No purchase necessary route: submit a free postal-style entry request below for manual validation.
      </div>
      <button
        type="button"
        className="btn-free-entry"
        onClick={() => setShowFreeEntry((current) => !current)}
      >
        {showFreeEntry ? 'HIDE FREE ENTRY FORM' : 'USE FREE ENTRY ROUTE'}
      </button>

      {showFreeEntry && (
        <form className="free-entry-form" onSubmit={handleFreeEntrySubmit}>
          <input
            type="text"
            placeholder="Full name"
            required
            value={freeEntryDetails.fullName}
            onChange={(e) => setFreeEntryDetails((current) => ({ ...current, fullName: e.target.value }))}
          />
          <input
            type="email"
            placeholder="Email address"
            required
            value={freeEntryDetails.email}
            onChange={(e) => setFreeEntryDetails((current) => ({ ...current, email: e.target.value }))}
          />
          <textarea
            placeholder="Postal address"
            required
            value={freeEntryDetails.postalAddress}
            onChange={(e) => setFreeEntryDetails((current) => ({ ...current, postalAddress: e.target.value }))}
          />
          <button type="submit" className="btn-free-entry-submit">SUBMIT FREE ENTRY</button>
          {freeEntryStatusMessage && <p className="free-entry-status">{freeEntryStatusMessage}</p>}
        </form>
      )}

      {showCelebration && (
        <div className="ticket-confetti" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => (
            <span key={index} className="confetti-piece">🎉</span>
          ))}
        </div>
      )}

      <div className="terms-link">
        <a href="#">View Full Terms & Conditions</a>
      </div>
    </div>
  );
};

export default CompetitionCard;
