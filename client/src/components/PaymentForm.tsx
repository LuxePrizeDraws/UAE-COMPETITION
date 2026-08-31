import { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import './PaymentForm.css';

interface Competition {
  id: number;
  title: string;
  entryPrice: number;
  currency: string;
  status: string;
}

interface PaymentFormProps {
  competition: Competition;
  quantity: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (message: string) => void;
}

function CheckoutForm({ competition, quantity, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      const msg = error.message ?? 'Payment failed. Please try again.';
      setErrorMsg(msg);
      onError(msg);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }

    setLoading(false);
  };

  const totalAmount = (competition.entryPrice * quantity).toFixed(2);

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="payment-summary">
        <h3>Order Summary</h3>
        <p><strong>{competition.title}</strong></p>
        <p>{quantity} {quantity === 1 ? 'entry' : 'entries'} × {competition.currency} {competition.entryPrice.toFixed(2)}</p>
        <p className="total">Total: <strong>{competition.currency} {totalAmount}</strong></p>
      </div>

      <PaymentElement />

      {errorMsg && <p className="payment-error">{errorMsg}</p>}

      <button type="submit" disabled={!stripe || loading} className="pay-button">
        {loading ? 'Processing…' : `Pay ${competition.currency} ${totalAmount}`}
      </button>
    </form>
  );
}

export default function PaymentForm({ competition, quantity, onSuccess, onError }: PaymentFormProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
    if (!publishableKey) {
      const msg = 'Stripe is not configured. Please contact support.';
      setInitError(msg);
      onError(msg);
      return;
    }
    setStripePromise(loadStripe(publishableKey));

    const init = async () => {
      try {
        const res = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            competitionId: competition.id,
            quantity,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to initialise payment.');

        setClientSecret(data.clientSecret);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to initialise payment.';
        setInitError(msg);
        onError(msg);
      }
    };

    init();
  }, [competition.id, quantity]);

  if (initError) {
    return <p className="payment-error">{initError}</p>;
  }

  if (!stripePromise || !clientSecret) {
    return <p className="payment-loading">Initialising secure payment…</p>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm
        competition={competition}
        quantity={quantity}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
