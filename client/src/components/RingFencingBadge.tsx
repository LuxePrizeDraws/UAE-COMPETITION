import { Link } from 'react-router-dom';
import './RingFencingBadge.css';

interface RingFencingBadgeProps {
  insuranceAmount: number;
  auditStatus?: string;
  accountType?: string;
  compact?: boolean;
}

const ACCOUNT_AUDIT: Record<string, string> = {
  daily: 'Weekly',
  weekly: 'Monthly',
  monthly: 'Monthly',
  supercar: 'Per Draw',
  dream_app: 'Per Draw',
  world_record: 'Monthly + Quarterly',
  master: 'Monthly + Quarterly',
};

export default function RingFencingBadge({ insuranceAmount, auditStatus = 'verified', accountType, compact = false }: RingFencingBadgeProps) {
  const auditLabel = accountType ? ACCOUNT_AUDIT[accountType] : 'Monthly';
  const fmt = (n: number) =>
    n >= 1_000_000
      ? `£${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M+`
      : `£${n.toLocaleString()}`;

  if (compact) {
    return (
      <div className="rfb rfb--compact">
        <span className="rfb__shield">🛡️</span>
        <span className="rfb__label">RING-FENCED &amp; GUARANTEED</span>
        <span className="rfb__ins">Insurance: {fmt(insuranceAmount)}</span>
      </div>
    );
  }

  return (
    <div className="rfb">
      <div className="rfb__header">
        <span className="rfb__shield">🛡️</span>
        <span className="rfb__title">RING-FENCED &amp; GUARANTEED</span>
      </div>
      <ul className="rfb__list">
        <li>
          <span className="rfb__check">✅</span>
          Insurance-Backed: <strong>{fmt(insuranceAmount)}</strong>
        </li>
        <li>
          <span className="rfb__check">✅</span>
          Audited: <strong>{auditLabel}</strong>
        </li>
        <li>
          <span className="rfb__check">✅</span>
          Third-Party Verified:{' '}
          <strong className={auditStatus === 'verified' ? 'rfb__ok' : 'rfb__pending'}>
            {auditStatus === 'verified' ? '✓ Verified' : 'Pending'}
          </strong>
        </li>
        <li>
          <span className="rfb__check">✅</span>
          Segregated Bank Account
        </li>
      </ul>
      <Link to="/ring-fencing" className="rfb__link">
        View Guarantee Certificate →
      </Link>
    </div>
  );
}
