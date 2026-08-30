import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

interface CheckoutModalProps {
  competitionId: number;
  competitionTitle: string;
  entryPrice: number;
  currency: string;
  quantity: number;
  onClose: () => void;
}

const CheckoutModal = ({
  competitionId,
  competitionTitle,
  entryPrice,
  currency,
  quantity,
  onClose,
}: CheckoutModalProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!STRIPE_KEY) {
      setError('Payment is not configured. Please contact support.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiBase}/api/payment/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionId, quantity, userEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout');

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      const stripe = stripePromise ? await stripePromise : null;
      if (!stripe) throw new Error('Stripe not loaded');
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (stripeError) throw new Error(stripeError.message);
    } catch (err: any) {
      setError(err.message || 'Payment error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = (quantity * entryPrice).toFixed(2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Complete Your Entry</h2>
        <p className="modal-competition-title">{competitionTitle}</p>
        <div className="modal-summary">
          <span>{quantity} ticket{quantity > 1 ? 's' : ''} × {currency} {entryPrice}</span>
          <strong>{currency} {totalCost}</strong>
        </div>
        <label className="modal-label">
          Email address
          <input
            type="email"
            className="modal-input"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>
        {error && <p className="modal-error">{error}</p>}
        <button
          className="btn-checkout"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? 'Redirecting to payment…' : `Pay ${currency} ${totalCost} securely`}
        </button>
        <p className="modal-secure-note">🔒 Powered by Stripe – PCI compliant &amp; secure</p>
      </div>
    </div>
  );
};

export default CheckoutModal;
