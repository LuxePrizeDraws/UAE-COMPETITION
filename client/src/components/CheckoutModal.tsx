import { useState, useEffect } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import './CheckoutModal.css';

const API_URL = import.meta.env.VITE_API_URL || '';

interface CheckoutModalProps {
  competitionId: number;
  competitionTitle: string;
  entryPrice: number;
  currency: string;
  quantity: number;
  onClose: () => void;
}

type Step = 'challenge' | 'payment' | 'success' | 'error';
type PaymentMethod = 'paypal' | 'apple' | 'google';

interface Challenge {
  token: string;
  question: string;
}

interface EntryResult {
  competitionTitle: string;
  quantity: number;
  totalCost: number;
  currency: string;
  entryNumbers: string[];
  paypalOrderId: string;
}

export default function CheckoutModal({
  competitionId,
  competitionTitle,
  entryPrice,
  currency,
  quantity,
  onClose,
}: CheckoutModalProps) {
  const [step, setStep] = useState<Step>('challenge');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [challengeError, setChallengeError] = useState('');
  const [challengeVerified, setChallengeVerified] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paypal');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [result, setResult] = useState<EntryResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [{ isPending }] = usePayPalScriptReducer();

  const totalCost = quantity * entryPrice;

  // Load compliance challenge on mount
  useEffect(() => {
    fetch(`${API_URL}/api/challenge`)
      .then(r => r.json())
      .then((data: Challenge) => setChallenge(data))
      .catch(() => setChallengeError('Could not load challenge. Please refresh.'));
  }, []);

  function handleChallengeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!challenge) return;
    if (!challengeAnswer.trim()) {
      setChallengeError('Please enter your answer.');
      return;
    }
    setChallengeError('');
    setChallengeVerified(true);
    setStep('payment');
  }

  async function handlePayPalApprove(data: { orderID: string }) {
    if (!challenge || !termsAccepted) return;
    try {
      const res = await fetch(`${API_URL}/api/competitions/${competitionId}/enter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity,
          termsAccepted: true,
          prizeOption: 'cash',
          challengeToken: challenge.token,
          challengeAnswer,
          paypalOrderId: data.orderID,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || 'Entry failed. Please contact support.');
        setStep('error');
        return;
      }
      setResult(json);
      setStep('success');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStep('error');
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="modal-step-label">
              {step === 'challenge' && 'Step 1 of 2 – Skill Question'}
              {step === 'payment' && 'Step 2 of 2 – Payment'}
              {step === 'success' && '🎉 Entry Confirmed'}
              {step === 'error' && '⚠️ Error'}
            </span>
            <h2 className="modal-title">{competitionTitle}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Step 1: Compliance Challenge ── */}
        {step === 'challenge' && (
          <div className="modal-body">
            <div className="compliance-notice">
              <p className="compliance-title">🇬🇧 UK Compliance Requirement</p>
              <p className="compliance-text">
                To comply with UK competition law, all entrants must correctly answer a
                skill question before their entry is processed. This is required by law
                and prevents classification as a lottery.
              </p>
            </div>

            {!challenge ? (
              <p className="loading-text">Loading question…</p>
            ) : (
              <form onSubmit={handleChallengeSubmit} className="challenge-form">
                <div className="challenge-question">
                  <p className="question-label">Answer the following to enter:</p>
                  <p className="question-text">{challenge.question}</p>
                </div>
                <div className="form-field">
                  <input
                    type="text"
                    className="challenge-input"
                    placeholder="Your answer"
                    value={challengeAnswer}
                    onChange={e => setChallengeAnswer(e.target.value)}
                    autoFocus
                  />
                  {challengeError && <p className="field-error">{challengeError}</p>}
                </div>
                <div className="order-summary">
                  <span>{quantity} × £{entryPrice} ticket{quantity > 1 ? 's' : ''}</span>
                  <span className="summary-total">£{totalCost.toFixed(2)}</span>
                </div>
                <button type="submit" className="btn-primary" disabled={!challengeAnswer.trim()}>
                  Confirm Answer & Continue →
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Step 2: Payment ── */}
        {step === 'payment' && challengeVerified && (
          <div className="modal-body">
            <div className="order-summary">
              <span>{quantity} × £{entryPrice} ticket{quantity > 1 ? 's' : ''}</span>
              <span className="summary-total">£{totalCost.toFixed(2)}</span>
            </div>

            {/* Payment method selector */}
            <p className="payment-label">Select payment method:</p>
            <div className="payment-methods">
              <label className={`payment-option ${paymentMethod === 'apple' ? 'payment-option--active' : ''} payment-option--unavailable`} title="Apple Pay – coming soon">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="apple"
                  disabled
                />
                <span className="payment-name payment-name--apple">Apple Pay</span>
              </label>

              <label className={`payment-option ${paymentMethod === 'google' ? 'payment-option--active' : ''} payment-option--unavailable`} title="Google Pay – coming soon">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="google"
                  disabled
                />
                <span className="payment-name payment-name--google">Google Pay</span>
              </label>

              <label className={`payment-option ${paymentMethod === 'paypal' ? 'payment-option--active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')}
                />
                <span className="payment-name payment-name--paypal">
                  <img
                    src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png"
                    alt="PayPal"
                    className="payment-logo"
                  />
                </span>
              </label>
            </div>

            {/* Terms */}
            <label className="terms-check">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
              />
              <span>I accept the <a href="#" className="terms-link-inline">Terms & Conditions</a> and confirm I am 18+</span>
            </label>

            {/* PayPal Buttons */}
            {paymentMethod === 'paypal' && (
              <div className="paypal-wrap">
                {isPending && <p className="loading-text">Loading PayPal…</p>}
                {!termsAccepted && (
                  <p className="field-error">Please accept the terms to continue.</p>
                )}
                {termsAccepted && (
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
                    disabled={!termsAccepted}
                    createOrder={(_data, actions) =>
                      actions.order.create({
                        intent: 'CAPTURE',
                        purchase_units: [
                          {
                            description: `${quantity}x entry – ${competitionTitle}`,
                            amount: {
                              currency_code: currency === 'GBP' ? 'GBP' : 'USD',
                              value: totalCost.toFixed(2),
                            },
                          },
                        ],
                      })
                    }
                    onApprove={handlePayPalApprove}
                    onError={() => {
                      setErrorMsg('PayPal encountered an error. Please try again.');
                      setStep('error');
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Success ── */}
        {step === 'success' && result && (
          <div className="modal-body success-body">
            <div className="success-icon">🏆</div>
            <h3 className="success-title">You're in the draw!</h3>
            <p className="success-sub">{result.competitionTitle}</p>
            <div className="entry-numbers">
              <p className="entry-numbers-label">Your Entry Number{result.entryNumbers.length > 1 ? 's' : ''}:</p>
              {result.entryNumbers.map((n: string) => (
                <span key={n} className="entry-number">{n}</span>
              ))}
            </div>
            <div className="success-summary">
              <span>{result.quantity} ticket{result.quantity > 1 ? 's' : ''}</span>
              <span className="summary-total">£{result.totalCost.toFixed(2)} paid via PayPal</span>
            </div>
            <p className="success-footer">A confirmation email will be sent to your PayPal address. Good luck! 🍀</p>
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        )}

        {/* ── Error ── */}
        {step === 'error' && (
          <div className="modal-body error-body">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Something went wrong</h3>
            <p className="error-msg">{errorMsg}</p>
            <div className="error-actions">
              <button className="btn-secondary" onClick={() => {
                // Reset to challenge step and fetch a fresh challenge token
                setStep('challenge');
                setChallengeVerified(false);
                setChallengeAnswer('');
                setErrorMsg('');
                setChallenge(null);
                fetch(`${API_URL}/api/challenge`)
                  .then(r => r.json())
                  .then((data: Challenge) => setChallenge(data))
                  .catch(() => setChallengeError('Could not load challenge. Please refresh.'));
              }}>
                Try Again
              </button>
              <button className="btn-primary" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
