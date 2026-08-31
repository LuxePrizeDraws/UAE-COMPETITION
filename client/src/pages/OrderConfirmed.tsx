import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './OrderConfirmed.css';

interface DemoEntry {
  competition_id: string;
  quantity: string;
  prize_option: string;
  demo?: string;
}

export default function OrderConfirmed() {
  const [params] = useSearchParams();
  const [entryNums, setEntryNums] = useState<string[]>([]);

  const competitionId = params.get('competition_id') || params.get('attributes[competition_id]') || '';
  const quantity = parseInt(params.get('quantity') || params.get('attributes[quantity]') || '1');
  const prizeOption = params.get('prize_option') || params.get('attributes[prize_option]') || 'cash';
  const orderId = params.get('order_id') || params.get('checkout[order_id]') || '';
  const isDemo = params.get('demo') === '1';

  useEffect(() => {
    // Generate display entry numbers (in production, these come from the webhook-reconciled backend)
    const nums = Array.from({ length: Math.min(quantity, 20) }, (_, i) =>
      `${competitionId || 'X'}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`
    );
    setEntryNums(nums);
  }, [competitionId, quantity]);

  return (
    <div className="order-confirmed">
      <div className="order-confirmed__card">
        <div className="order-confirmed__icon">🎉</div>
        <h1 className="order-confirmed__title">
          {isDemo ? 'Demo Entry Confirmed!' : 'Payment Received!'}
        </h1>

        {isDemo && (
          <div className="order-confirmed__demo-badge">
            ℹ️ Demo mode — configure <code>SHOPIFY_STORE_DOMAIN</code> for live payments
          </div>
        )}

        <p className="order-confirmed__sub">
          Your entry has been registered. Good luck in the draw!
        </p>

        <div className="order-confirmed__grid">
          {orderId && (
            <div className="order-confirmed__stat">
              <span>Order</span>
              <strong>#{orderId}</strong>
            </div>
          )}
          {competitionId && (
            <div className="order-confirmed__stat">
              <span>Competition</span>
              <strong>#{competitionId}</strong>
            </div>
          )}
          <div className="order-confirmed__stat">
            <span>Tickets</span>
            <strong>{quantity}</strong>
          </div>
          <div className="order-confirmed__stat">
            <span>Prize Option</span>
            <strong>{prizeOption === 'cash' ? '💰 Cash' : '🏆 Physical Prize'}</strong>
          </div>
        </div>

        {entryNums.length > 0 && (
          <div className="order-confirmed__entries">
            <p className="order-confirmed__entries-label">Your Entry Numbers:</p>
            <div className="order-confirmed__tickets">
              {entryNums.map((n) => (
                <span key={n} className="order-confirmed__ticket">{n}</span>
              ))}
              {quantity > 20 && (
                <span className="order-confirmed__ticket order-confirmed__ticket--more">
                  +{quantity - 20} more
                </span>
              )}
            </div>
          </div>
        )}

        <p className="order-confirmed__note">
          ✅ The draw will be conducted live and fairly once all entries are sold. Results will be announced publicly.
        </p>

        <div className="order-confirmed__actions">
          <Link to="/" className="order-confirmed__btn order-confirmed__btn--primary">
            Browse More Competitions
          </Link>
          <Link to="/dashboard" className="order-confirmed__btn order-confirmed__btn--secondary">
            📊 Live Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
