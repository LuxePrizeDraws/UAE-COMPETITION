import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { CardCvcElement, CardExpiryElement, CardNumberElement, Elements, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { cardShadow, formatCurrency, getNextSunday8PmUtc, pageContainerStyle, pageShellStyle, palette, useCountdown } from '../lib/luxury';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QDemoPlatform12345678901234567890123456789012345678901234567890',
);

interface PaymentIntentResponse {
  clientSecret: string;
  amount: number;
  currency: string;
  quantity: number;
  entryNumbers: string[];
}

interface EntryPackage {
  quantity: number;
  price: number;
  label?: string;
  badgeColor?: string;
  odds: string;
}

const packages: EntryPackage[] = [
  { quantity: 1, price: 5, odds: '1 in 5,000' },
  { quantity: 5, price: 25, label: 'POPULAR', badgeColor: palette.urgent, odds: '1 in 1,000' },
  { quantity: 10, price: 50, label: 'BEST VALUE', badgeColor: palette.hot, odds: '1 in 500' },
  { quantity: 20, price: 100, label: 'VIP', badgeColor: palette.gold, odds: '1 in 250' },
];

const stripeElementOptions = {
  style: {
    base: {
      color: '#ffffff',
      fontSize: '16px',
      '::placeholder': {
        color: '#737373',
      },
      iconColor: '#D4AF37',
    },
  },
};

interface CheckoutFormProps {
  selectedPackage: EntryPackage;
  onSuccess: (result: PaymentIntentResponse) => void;
}

function StripeField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label style={{ display: 'grid', gap: 8, color: palette.textSoft }}>
      <span>{label}</span>
      <div
        style={{
          background: '#0f0f0f',
          border: '1px solid rgba(212,175,55,0.16)',
          borderRadius: 8,
          color: palette.text,
          padding: '0.95rem 1rem',
        }}
      >
        {children}
      </div>
    </label>
  );
}

function CheckoutForm({ selectedPackage, onSuccess }: CheckoutFormProps) {
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '' });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (form.name.trim().length < 2 || !form.email.includes('@')) {
      setError('Please complete the secure contact fields to continue.');
      return;
    }

    if (!elements) {
      setError('Secure card fields are still loading. Please try again.');
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch(`${API_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: selectedPackage.quantity }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Payment setup failed.');
      }

      const data: PaymentIntentResponse = await response.json();
      onSuccess(data);
    } catch {
      setError('Unable to reach the payment server. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)', border: '1px solid rgba(212,175,55,0.22)', borderRadius: 12, padding: '1.5rem', boxShadow: cardShadow }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ color: palette.goldBright, marginBottom: 4 }}>Stripe payment form area</h2>
          <div style={{ color: palette.muted }}>Demo mode with secure Stripe Elements card fields</div>
        </div>
        <div style={{ color: palette.success, fontWeight: 800 }}>🔒 Demo checkout live</div>
      </div>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <label style={{ display: 'grid', gap: 8, color: palette.textSoft }}>
          <span>Cardholder name</span>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            style={{ background: '#0f0f0f', border: '1px solid rgba(212,175,55,0.16)', borderRadius: 8, color: palette.text, padding: '0.95rem 1rem' }}
          />
        </label>
        <label style={{ display: 'grid', gap: 8, color: palette.textSoft }}>
          <span>Email address</span>
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            style={{ background: '#0f0f0f', border: '1px solid rgba(212,175,55,0.16)', borderRadius: 8, color: palette.text, padding: '0.95rem 1rem' }}
          />
        </label>
        <StripeField label="Card number">
          <CardNumberElement options={stripeElementOptions} />
        </StripeField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <StripeField label="Expiry">
            <CardExpiryElement options={stripeElementOptions} />
          </StripeField>
          <StripeField label="CVV">
            <CardCvcElement options={stripeElementOptions} />
          </StripeField>
        </div>
      </div>
      {error && <div style={{ marginTop: '1rem', padding: '0.9rem 1rem', borderRadius: 12, background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)', color: '#fca5a5' }}>{error}</div>}
      <button type="submit" disabled={processing} style={{ width: '100%', marginTop: '1.25rem', padding: '1rem', borderRadius: 8, background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)', color: '#0a0a0a', fontWeight: 900, fontSize: '1rem', boxShadow: cardShadow }}>
        {processing ? 'Processing…' : `PAY NOW — ${formatCurrency(selectedPackage.price)}`}
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem', marginTop: '1rem' }}>
        {['🔒 256-bit SSL', '💳 PCI DSS Level 1', '✅ Instant Confirmation', '📧 Receipt by Email'].map((badge) => (
          <div key={badge} style={{ background: '#111111', borderRadius: 10, border: '1px solid rgba(212,175,55,0.12)', padding: '0.75rem', color: palette.textSoft, textAlign: 'center' }}>{badge}</div>
        ))}
      </div>
    </form>
  );
}

export default function PayPage() {
  const [selectedQty, setSelectedQty] = useState(5);
  const [hoveredQty, setHoveredQty] = useState<number | null>(null);
  const [viewers, setViewers] = useState(127);
  const [confirmation, setConfirmation] = useState<PaymentIntentResponse | null>(null);
  const nextDrawTarget = useMemo(() => getNextSunday8PmUtc(), []);
  const countdown = useCountdown(nextDrawTarget);
  const selectedPackage = packages.find((item) => item.quantity === selectedQty) ?? packages[0];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setViewers(110 + Math.floor(Math.random() * 35));
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);
  return (
    <div style={pageShellStyle}>
      <div style={pageContainerStyle}>
        <div style={{ overflow: 'hidden', borderRadius: 12, border: '1px solid rgba(212,175,55,0.2)', background: '#111111', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', minWidth: 'max-content', animation: 'luxuryMarquee 18s linear infinite', padding: '0.9rem 0' }}>
            {['🔥 James T. just bought 5 entries', '💎 Anonymous bought 20 entries', '⚡ 847 entries bought in last hour', '🏆 VIP checkout confirmed seconds ago', '🔒 Stripe-powered demo checkout ready', '🔥 James T. just bought 5 entries', '💎 Anonymous bought 20 entries', '⚡ 847 entries bought in last hour'].map((item, index) => (
              <div key={`${item}-${index}`} style={{ whiteSpace: 'nowrap', padding: '0 1.5rem', color: palette.textSoft, fontWeight: 700 }}>{item}</div>
            ))}
          </div>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0.5rem 1rem', borderRadius: 999, border: '1px solid rgba(220,38,38,0.6)', background: 'rgba(220,38,38,0.12)', color: palette.text, fontWeight: 800, animation: 'luxuryFlash 1.2s infinite', marginBottom: '1rem' }}>
            🔥 NEXT DRAW: SUNDAY 8PM — PRIZE POOL £47,230
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', color: palette.goldBright, marginBottom: '0.5rem' }}>⚡ INSTANT ENTRY — PAY TO WIN</h1>
          <p style={{ color: palette.muted, fontSize: '1.05rem' }}>Fast-track your place in the live draw and get entry numbers instantly.</p>
          <div style={{ marginTop: '1rem', color: palette.hot, fontWeight: 800 }}>⏰ {viewers} people viewing this page right now · Draw closes in {countdown.shortLabel}</div>
        </header>

        {confirmation ? (
          <section style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.14) 0%, rgba(17,17,17,1) 100%)', border: '1px solid rgba(22,163,74,0.4)', borderRadius: 12, padding: '2rem', boxShadow: cardShadow }}>
            <h2 style={{ color: palette.goldBright, fontSize: '2rem', marginBottom: '0.5rem' }}>✅ Payment Confirmed</h2>
            <p style={{ color: palette.textSoft, marginBottom: '1.5rem' }}>Your demo payment intent is ready and your paid draw entries have been issued.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#111111', borderRadius: 12, padding: '1rem', border: '1px solid rgba(212,175,55,0.16)' }}><div style={{ color: palette.muted, fontSize: 12 }}>Package</div><strong>{confirmation.quantity} entries</strong></div>
              <div style={{ background: '#111111', borderRadius: 12, padding: '1rem', border: '1px solid rgba(212,175,55,0.16)' }}><div style={{ color: palette.muted, fontSize: 12 }}>Amount</div><strong>{formatCurrency(confirmation.amount / 100)}</strong></div>
              <div style={{ background: '#111111', borderRadius: 12, padding: '1rem', border: '1px solid rgba(212,175,55,0.16)' }}><div style={{ color: palette.muted, fontSize: 12 }}>Currency</div><strong>{confirmation.currency.toUpperCase()}</strong></div>
              <div style={{ background: '#111111', borderRadius: 12, padding: '1rem', border: '1px solid rgba(212,175,55,0.16)' }}><div style={{ color: palette.muted, fontSize: 12 }}>Draw</div><strong>Sunday 8PM UTC</strong></div>
            </div>
            <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 12, padding: '1rem' }}>
              <div style={{ fontWeight: 800, color: palette.gold, marginBottom: '0.8rem' }}>Your Entry Numbers</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {confirmation.entryNumbers.map((entry) => (
                  <span key={entry} style={{ padding: '0.45rem 0.75rem', borderRadius: 999, background: '#111111', border: '1px solid rgba(212,175,55,0.24)', fontFamily: 'monospace', color: palette.goldBright }}>{entry}</span>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <>
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {packages.map((entryPackage) => {
                const isSelected = entryPackage.quantity === selectedQty;
                const isHovered = hoveredQty === entryPackage.quantity;
                const isVip = entryPackage.quantity === 20;

                return (
                  <button
                    key={entryPackage.quantity}
                    type="button"
                    onClick={() => setSelectedQty(entryPackage.quantity)}
                    onMouseEnter={() => setHoveredQty(entryPackage.quantity)}
                    onMouseLeave={() => setHoveredQty(null)}
                    style={{
                      textAlign: 'left',
                      padding: '1.25rem',
                      borderRadius: 12,
                      background: isSelected ? 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(17,17,17,1) 100%)' : '#111111',
                      border: `1px solid ${isSelected || isVip ? palette.gold : 'rgba(212,175,55,0.12)'}`,
                      boxShadow: isSelected || isHovered ? '0 8px 40px rgba(212,175,55,0.35)' : cardShadow,
                      transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0)',
                      transition: 'all 0.25s ease',
                      animation: isVip ? 'luxuryGlow 1.8s infinite' : undefined,
                    }}
                  >
                    {entryPackage.label && (
                      <div style={{ display: 'inline-flex', padding: '0.3rem 0.65rem', borderRadius: 999, background: entryPackage.badgeColor, color: '#ffffff', fontSize: 12, fontWeight: 800, marginBottom: '0.8rem' }}>
                        {entryPackage.label}
                      </div>
                    )}
                    <div style={{ color: palette.goldBright, fontSize: '2rem', fontWeight: 900 }}>{entryPackage.quantity}</div>
                    <div style={{ color: palette.textSoft, marginBottom: 10 }}>entries</div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 10 }}>{formatCurrency(entryPackage.price)}</div>
                    <div style={{ color: palette.success, fontWeight: 700 }}>YOUR ODDS: {entryPackage.odds}</div>
                  </button>
                );
              })}
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(300px, 0.8fr)', gap: '1.5rem' }}>
              <Elements stripe={stripePromise}>
                <CheckoutForm selectedPackage={selectedPackage} onSuccess={setConfirmation} />
              </Elements>

              <aside style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(17,17,17,1) 100%)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 12, padding: '1.5rem', boxShadow: cardShadow }}>
                <div style={{ color: palette.goldBright, fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.4rem' }}>{selectedPackage.quantity} entries selected</div>
                <div style={{ color: palette.textSoft, marginBottom: '1rem' }}>Locked for the live Sunday 8PM UTC draw.</div>
                <div style={{ display: 'grid', gap: '0.9rem' }}>
                  <div><div style={{ color: palette.muted, fontSize: 12 }}>Package total</div><strong>{formatCurrency(selectedPackage.price)}</strong></div>
                  <div><div style={{ color: palette.muted, fontSize: 12 }}>Best quoted odds</div><strong>{selectedPackage.odds}</strong></div>
                  <div><div style={{ color: palette.muted, fontSize: 12 }}>Prize pool</div><strong>£47,230</strong></div>
                  <div><div style={{ color: palette.muted, fontSize: 12 }}>Draw closes</div><strong>{countdown.label}</strong></div>
                </div>
              </aside>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
