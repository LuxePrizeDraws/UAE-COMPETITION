import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Competition } from '../types';

const Checkout = () => {
  const [params] = useSearchParams();
  const { user, token, refreshProfile } = useAuth();
  const competitionId = params.get('competition');
  const quantity = Math.max(1, Number(params.get('quantity')) || 1);

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    fullName: user?.name ?? '',
    email: user?.email ?? '',
    city: 'Dubai',
    country: 'United Arab Emirates',
    cardholderName: user?.name ?? '',
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/30',
    cvc: '123',
  });

  useEffect(() => {
    const loadCompetition = async () => {
      try {
        const response = await fetch(`/api/competitions/${competitionId}`);
        if (!response.ok) {
          throw new Error('Competition not found');
        }
        setCompetition(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load checkout');
      } finally {
        setLoading(false);
      }
    };

    if (!competitionId) {
      setError('Competition is missing from the checkout request.');
      setLoading(false);
      return;
    }

    loadCompetition().catch(() => setError('Unable to load checkout'));
  }, [competitionId]);

  const total = useMemo(() => (competition ? competition.entryPrice * quantity : 0), [competition, quantity]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!competition || !token) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const paymentResponse = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionId: competition.id, quantity, amount: total }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Unable to initialise secure payment');
      }

      const paymentData = await paymentResponse.json();

      const entryResponse = await fetch(`/api/competitions/${competition.id}/enter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ quantity, paymentIntentId: paymentData.paymentIntentId }),
      });

      const entryData = await entryResponse.json();
      if (!entryResponse.ok) {
        throw new Error(entryData.error || 'Unable to confirm your entry');
      }

      await refreshProfile();
      setSuccess(`Success! ${entryData.quantity} entries secured. Payment reference: ${paymentData.paymentIntentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete checkout');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container page-header"><div className="notice">Preparing your secure checkout…</div></div>;
  }

  if (!competition) {
    return (
      <div className="container checkout-page">
        <div className="error-banner">{error || 'Competition not found'}</div>
        <Link className="btn" to="/">
          Return home
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="page-header">
          <p className="section-eyebrow">Secure checkout</p>
          <h1 className="section-heading">Complete your entry for {competition.shortTitle}</h1>
          <p className="section-copy">Premium payment capture flow with Stripe-ready fields and server-side intent creation.</p>
        </div>

        <div className="checkout-grid">
          <form className="checkout-card" onSubmit={handleSubmit}>
            {error && <div className="error-banner">{error}</div>}
            {success && <div className="success-banner">{success}</div>}

            <div className="form-grid two-column">
              <label>
                <span>Full name</span>
                <input value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} required />
              </label>
              <label>
                <span>Email</span>
                <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
              </label>
              <label>
                <span>City</span>
                <input value={form.city} onChange={(e) => handleChange('city', e.target.value)} required />
              </label>
              <label>
                <span>Country</span>
                <input value={form.country} onChange={(e) => handleChange('country', e.target.value)} required />
              </label>
            </div>

            <div className="summary-card payment-panel">
              <h3>Stripe-ready payment fields</h3>
              <div className="form-grid">
                <label>
                  <span>Cardholder name</span>
                  <input value={form.cardholderName} onChange={(e) => handleChange('cardholderName', e.target.value)} required />
                </label>
                <label>
                  <span>Card number</span>
                  <input value={form.cardNumber} onChange={(e) => handleChange('cardNumber', e.target.value)} required />
                </label>
                <div className="form-grid two-column">
                  <label>
                    <span>Expiry</span>
                    <input value={form.expiry} onChange={(e) => handleChange('expiry', e.target.value)} required />
                  </label>
                  <label>
                    <span>CVC</span>
                    <input value={form.cvc} onChange={(e) => handleChange('cvc', e.target.value)} required />
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Processing secure order…' : `Pay ${total.toLocaleString()} AED & Confirm Entries`}
            </button>
          </form>

          <aside className="summary-card">
            <h3>Order summary</h3>
            <div className="order-line"><span>Competition</span><strong>{competition.shortTitle}</strong></div>
            <div className="order-line"><span>Entries</span><strong>{quantity}</strong></div>
            <div className="order-line"><span>Price per entry</span><strong>{competition.entryPrice} AED</strong></div>
            <div className="order-line total"><span>Total</span><strong>{total.toLocaleString()} AED</strong></div>
            <div className="notice">
              Logged in as {user?.email}. After payment intent creation, the platform reserves your entries and updates your dashboard instantly.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
