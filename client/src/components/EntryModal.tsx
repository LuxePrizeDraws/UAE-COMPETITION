<<<<<<< HEAD
import { useEffect, useState } from 'react';
=======
import { useState } from 'react';
import { useButtonSound } from '../hooks/useButtonSound';
>>>>>>> origin/main
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
  mode?: 'demo' | 'stripe';
  checkoutUrl?: string;
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
const defaultPostalEntryInfo = {
  available: true,
  summary: 'Free postal entry is supported for eligible participants.',
  steps: [
    'Review the official competition terms and postal-entry rules before sending your entry.',
    'Send one postal entry per envelope with your full name, contact details, competition title, and preferred prize option.',
    'Make sure your postal entry arrives before the published draw cutoff and meets the age and eligibility requirements.',
  ],
  note: 'Postal entry address will be published in the official terms before go-live.',
  addressConfigured: false,
  addressLines: [] as string[],
  supportEmail: null as string | null,
};

interface PostalEntryInfo {
  available: boolean;
  summary: string;
  steps: string[];
  note: string;
  addressConfigured: boolean;
  addressLines: string[];
  supportEmail: string | null;
}

export default function EntryModal({ competition, onClose }: EntryModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [prizeOption, setPrizeOption] = useState<'cash' | 'physical'>('cash');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EntryResult | null>(null);
<<<<<<< HEAD
  const [postalEntryInfo, setPostalEntryInfo] = useState<PostalEntryInfo>(defaultPostalEntryInfo);
  const [postalEntryLoading, setPostalEntryLoading] = useState(true);
=======
  const playSound = useButtonSound();
>>>>>>> origin/main

  const totalCost = quantity * competition.entryPrice;
  const remaining = competition.totalEntries - competition.soldEntries;

  useEffect(() => {
    let cancelled = false;

    setPostalEntryLoading(true);
    fetch(`${API_URL}/api/competitions/${competition.id}/postal-entry`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Postal entry information is unavailable.');
        }
        return res.json();
      })
      .then((data: PostalEntryInfo) => {
        if (!cancelled) {
          setPostalEntryInfo(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPostalEntryInfo(defaultPostalEntryInfo);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPostalEntryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [competition.id]);

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
      } else if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
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
            <button className="btn-confirm-close btn-interactive" onMouseDown={playSound} onClick={onClose}>Close</button>
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
                    className={`prize-option btn-interactive ${prizeOption === 'physical' ? 'prize-option--active' : ''}`}
                    onMouseDown={playSound}
                    onClick={() => setPrizeOption('physical')}
                  >
                    🏆 Physical Prize
                  </button>
                  <button
                    className={`prize-option btn-interactive ${prizeOption === 'cash' ? 'prize-option--active' : ''}`}
                    onMouseDown={playSound}
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
                  className="qty-btn btn-interactive"
                  onMouseDown={playSound}
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
                  className="qty-btn btn-interactive"
                  onMouseDown={playSound}
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 1000}
                >+</button>
              </div>
              <div className="qty-presets">
                {[1, 5, 10, 25, 50].map((n) => (
                  <button key={n} className={`qty-preset btn-interactive ${quantity === n ? 'qty-preset--active' : ''}`} onMouseDown={playSound} onClick={() => setQuantity(n)}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="entry-modal__cost">
              <span>Total Cost</span>
              <strong>£{totalCost.toLocaleString()}</strong>
            </div>

            <div className="entry-modal__postal">
              <div className="entry-modal__postal-header">
                <h3>📮 Free Postal Entry</h3>
                <span>£0 entry route</span>
              </div>
              <p className="entry-modal__postal-summary">
                {postalEntryLoading ? 'Loading postal entry instructions...' : postalEntryInfo.summary}
              </p>
              <ul className="entry-modal__postal-steps">
                {postalEntryInfo.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
              {postalEntryInfo.addressConfigured && postalEntryInfo.addressLines.length > 0 ? (
                <address className="entry-modal__postal-address">
                  {postalEntryInfo.addressLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </address>
              ) : (
                <p className="entry-modal__postal-note">{postalEntryInfo.note}</p>
              )}
              {postalEntryInfo.supportEmail && (
                <p className="entry-modal__postal-contact">
                  Need the latest postal-entry wording?{' '}
                  <a href={`mailto:${postalEntryInfo.supportEmail}`}>{postalEntryInfo.supportEmail}</a>
                </p>
              )}
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
              className="entry-modal__submit btn-interactive"
              onClick={handleSubmit}
              onMouseDown={playSound}
              disabled={loading || competition.status === 'coming-soon'}
            >
              {loading ? '⏳ Processing...' : `ENTER NOW — £${totalCost.toLocaleString()}`}
            </button>

            <p className="entry-modal__disclaimer">
              🔒 Secure entry{competition.status !== 'coming-soon' ? ' · Stripe checkout when configured' : ''} · 40% house margin transparent · Fair live draw guaranteed
            </p>
          </>
        )}
      </div>
    </div>
  );
}
