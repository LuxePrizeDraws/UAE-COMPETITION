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
const TERMS_PREF_KEY = 'uae_competition_terms_accepted';

export default function EntryModal({ competition, onClose }: EntryModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [prizeOption, setPrizeOption] = useState<'cash' | 'physical'>('cash');
  const [termsAccepted, setTermsAccepted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(TERMS_PREF_KEY) === 'true';
  });
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
            <div className="confirmation-icon">🎉</div>
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
              ✅ Good luck! The draw will be conducted live and fairly. Results will be announced when the draw threshold is reached.
            </p>
            <button className="btn-confirm-close" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
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
                onChange={(e) => {
                  const checked = e.target.checked;
                  setTermsAccepted(checked);
                  if (typeof window !== 'undefined') {
                    window.localStorage.setItem(TERMS_PREF_KEY, checked ? 'true' : 'false');
                  }
                }}
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
              {loading
                ? '⏳ Processing...'
                : `${quantity === 1 ? 'ONE-CLICK ENTER' : 'ENTER NOW'} — £${totalCost.toLocaleString()}`}
            </button>

            <p className="entry-modal__disclaimer">
              🔒 Secure entry · 40% house margin transparent · Fair live draw guaranteed
            </p>
          </>
        )}
      </div>
    </div>
  );
}
