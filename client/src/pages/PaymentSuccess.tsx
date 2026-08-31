import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './PaymentSuccess.css';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentIntentId) return;
    fetch(`/api/payments/transaction/${paymentIntentId}`)
      .then(r => r.json())
      .then(data => setStatus(data.status ?? null))
      .catch(() => setStatus(null));
  }, [paymentIntentId]);

  return (
    <div className="payment-result payment-result--success">
      <div className="result-icon">✅</div>
      <h2>Payment Successful!</h2>
      <p>Thank you! Your competition entry has been confirmed.</p>
      {paymentIntentId && (
        <p className="ref">
          Reference: <code>{paymentIntentId}</code>
          {status && <span className="status-badge status-badge--{status}"> ({status})</span>}
        </p>
      )}
      <Link to="/" className="result-btn">Back to Competitions</Link>
    </div>
  );
}
