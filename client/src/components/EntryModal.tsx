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

interface EntryResult {
  success: boolean;
  message: string;
  competitionId: number;
  competitionTitle: string;
  quantity: number;
  totalCost: number;
  currency: string;
  prizeOption: string;
  entryNumbers: string[];
  drawReadyPercent: number;
  endsIn: string;
}

interface EntryModalProps {
  competition: Competition;
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EntryModal({ competition, onClose }: EntryModalProps) {
  const [entryType, setEntryType] = useState<'digital' | 'postal'>('digital');
  const [quantity, setQuantity] = useState(1);
  const [prizeOption, setPrizeOption] = useState<'cash' | 'physical'>('cash');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EntryResult | null>(null);

  const totalCost = quantity * competition.entryPrice;
  const remaining = competition.totalEntries - competition.soldEntries;

  const handleQuantityChange = (val: number) => {
    const clamped = Math.max(1, Math.min(1000, Math.round(val) || 1));
    setQuantity(clamped);
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      setError('Please accept the terms and conditions to enter.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/competitions/${competition.id}/enter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, termsAccepted, prizeOption }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setResult(data);
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

        {result ? (
          <div className="entry-confirmation">
            <div className="confirmation-icon">✨</div>
            <h2 className="confirmation-title">Entry Confirmed!</h2>
            <p className="confirmation-sub">
              You have entered <strong>{result.competitionTitle}</strong>
            </p>

            <div className="confirmation-grid">
              <div><span>Tickets</span><strong>{result.quantity}</strong></div>
              <div><span>Total Cost</span><strong>£{result.totalCost.toLocaleString()}</strong></div>
              <div><span>Prize Option</span><strong>{result.prizeOption === 'cash' ? '💰 Cash' : '🏆 Physical Prize'}</strong></div>
              <div><span>Draw Closes</span><strong>{result.endsIn}</strong></div>
            </div>

            <div className="confirmation-tickets">
              <p className="tickets-label">Your Entry Numbers:</p>
              <div className="tickets-list">
                {result.entryNumbers.map((num) => (
                  <span key={num} className="ticket-num">{num}</span>
                ))}
              </div>
            </div>

            <p className="confirmation-note">
              🛡️ Your prize is ring-fenced and guaranteed. The draw will be conducted live and fairly. Good luck!
            </p>
            <button className="btn-confirm-close" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="entry-modal__header">
              <span className="entry-modal__badge">{competition.prizeType}</span>
              <span className="entry-modal__guarantee">🛡️ Ring-Fenced Prize</span>
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

            {/* Entry Type Tabs */}
            <div className="entry-tabs">
              <button
                className={`entry-tab${entryType === 'digital' ? ' entry-tab--active' : ''}`}
                onClick={() => setEntryType('digital')}
              >
                💳 Digital Entry<br /><small>Pay by card</small>
              </button>
              <button
                className={`entry-tab${entryType === 'postal' ? ' entry-tab--active' : ''}`}
                onClick={() => setEntryType('postal')}
              >
                📮 Free Postal Entry<br /><small>Same odds · No cost</small>
              </button>
            </div>

            {entryType === 'postal' ? (
              <div className="postal-info">
                <h4>Free Postal Entry</h4>
                <span className="postal-equal-odds">✓ Equal Odds to Digital Entries</span>
                <p>
                  You can enter this competition completely free by post. Your entry will be placed
                  into the same draw as digital entrants — <strong>identical odds, no disadvantage</strong>.
                </p>
                <p>
                  Write your name, address, and the competition name on a piece of paper and send to:
                </p>
                <div className="postal-address">
                  <strong>Postal Entry Address</strong>
                  LuxePrize Competitions<br />
                  PO Box 12345<br />
                  London, EC1A 1BB<br />
                  United Kingdom
                </div>
                <p style={{ marginTop: '1rem', fontSize: '0.82rem' }}>
                  One free entry per envelope. Multiple competition entries must be sent separately.
                  No purchase necessary. Full terms apply.
                </p>
              </div>
            ) : (
              <>
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
                      aria-label="Decrease quantity"
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
                      aria-label="Increase quantity"
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
                  onClick={handleSubmit}
                  disabled={loading || competition.status === 'coming-soon'}
                >
                  {loading ? '⏳ Processing…' : `Enter Now — £${totalCost.toLocaleString()}`}
                </button>

                <p className="stripe-note">🔒 Secure payment powered by Stripe</p>

                <p className="entry-modal__disclaimer">
                  🛡️ Ring-fenced prize guaranteed · 40% house margin transparent · Fair live draw
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

