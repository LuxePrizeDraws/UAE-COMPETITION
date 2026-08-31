import { Link, useSearchParams } from 'react-router-dom';
import './PaymentFailure.css';

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') ?? 'Your payment could not be processed.';

  return (
    <div className="payment-result payment-result--failure">
      <div className="result-icon">❌</div>
      <h2>Payment Failed</h2>
      <p>{decodeURIComponent(reason)}</p>
      <p>No charge has been made to your account. Please try again or contact support.</p>
      <Link to="/" className="result-btn">Try Again</Link>
    </div>
  );
}
