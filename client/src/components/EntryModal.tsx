import { useState } from 'react';
import './EntryModal.css';

interface Competition {
  id: number;
  title: string;
  prizeType: string;
  prizeAmount: number;
  currency: string;
  cashAlternative: boolean;
  cashAlternativeAmount: number;
  entryPrice: number;
  totalEntries: number;
  soldEntries: number;
  endsIn: string;
  status: string;
  prizeIncludes?: string[];
}

interface CheckoutResult {
  success: boolean;
  checkoutUrl: string;
  competitionId: number;
  competitionTitle: string;
  quantity: number;
  totalCost: number;
  currency: string;
  prizeOption: string;
}

interface EntryModalProps {
  competition: Competition;
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EntryModal({ competition, onClose }: EntryModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [prizeOption, setPrizeOption] = useState<'cash' | 'physical'>('cash');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCost = quantity * competition.entryPrice;
  const remaining = competition.totalEntries - competition.soldEntries;

  const handleQuantityChange = (val: number) => {
    const clamped = Math.max(1, Math.min(1000, Math.round(val) || 1));
    setQuantity(clamped);
  };

  const handleCheckout = async () => {
    if (!termsAccepted) {
      setError('Please accept the terms and conditions to enter.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/shopify/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: competition.id,
          quantity,
          prizeOption,
          termsAccepted,
        }),
      });
      const data = (await res.json()) as CheckoutResult & { error?: string };
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        // Redirect to Shopify checkout (or demo confirmation page)
        window.location.href = data.checkoutUrl;
      }
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="entry-overlay" onClick={onClose}>
      <div className="entry-modal" onClick={(e) => e.stopPropagation()}>
        <button className="entry-modal__close" onClick={onClose} aria-label="Close">✕</button>

        <div className="entry-modal__header">
          <span className="entry-modal__badge">{competition.prizeType}</span>
          <h2 className="entry-modal__title">{competition.title}</h2>
          <p className="entry-modal__prize">
            £{competition.prizeAmount.toLocaleString()} {competition.currency}
            {competition.cashAlternative && (
              <span className="entry-modal__cash-note"> · Cash alternative available</span>
            )}
          </p>
        </div>

        {competition.prizeIncludes && (
          <ul className="entry-modal__includes">
            {competition.prizeIncludes.map((item, i) => (
              <li key={i}>✓ {item}</li>
            ))}
          </ul>
        )}

        <div className="entry-modal__stats">
          <div>
            <span>Entry Price</span>
            <strong>£{competition.entryPrice}</strong>
          </div>
          <div>
            <span>Remaining</span>
            <strong>{remaining.toLocaleString()}</strong>
          </div>
          <div>
            <span>Closes In</span>
            <strong>{competition.endsIn}</strong>
          </div>
        </div>

        {competition.cashAlternative && (
          <div className="entry-modal__prize-toggle">
            <p className="toggle-label">Choose your prize option:</p>
            <div className="prize-options">
              <button
                className={`prize-option ${prizeOption === 'physical' ? 'prize-option--active' : ''}`}
                onClick={() => setPrizeOption('physical')}
              >
                🏆 Physical Prize
              </button>
              <button
                className={`prize-option ${prizeOption === 'cash' ? 'prize-option--active' : ''}`}
                onClick={() => setPrizeOption('cash')}
              >
                💰 Cash (£{competition.cashAlternativeAmount.toLocaleString()})
              </button>
            </div>
          </div>
        )}

        <div className="entry-modal__quantity">
          <label htmlFor="qty-input">Number of Tickets:</label>
          <div className="qty-controls">
            <button
              className="qty-btn"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >−</button>
            <input
              id="qty-input"
              type="number"
              min="1"
              max="1000"
              value={quantity}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              className="qty-input"
            />
            <button
              className="qty-btn"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= 1000}
            >+</button>
          </div>
          <div className="qty-presets">
            {[1, 5, 10, 25, 50].map((n) => (
              <button key={n} className={`qty-preset ${quantity === n ? 'qty-preset--active' : ''}`} onClick={() => setQuantity(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="entry-modal__cost">
          <span>Total Cost</span>
          <strong>£{totalCost.toLocaleString()}</strong>
        </div>

        <label className="entry-modal__terms">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <span>
            I am 18+ and accept the{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>Terms &amp; Conditions</a>.
            I understand this is a prize competition and the draw is conducted fairly and transparently.
          </span>
        </label>

        {error && <p className="entry-modal__error">⚠ {error}</p>}

        <button
          className="entry-modal__submit"
          onClick={handleCheckout}
          disabled={loading || competition.status === 'coming-soon'}
        >
          {loading
            ? '⏳ Preparing Checkout...'
            : competition.status === 'coming-soon'
            ? '⏳ COMING SOON'
            : `🛒 CHECKOUT — £${totalCost.toLocaleString()}`}
        </button>

        <p className="entry-modal__disclaimer">
          🔒 Secure checkout via Shopify · 40% house margin transparent · Fair live draw guaranteed
        </p>
      </div>
    </div>
  );
}
