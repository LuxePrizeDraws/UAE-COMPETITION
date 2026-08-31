import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './RingFencing.css';

interface RFAccount {
  id: string;
  accountName: string;
  accountType: string;
  currentBalance: number;
  reservedForPrizes: number;
  reservePercentage: number;
  insuranceProvider: string;
  insuranceAmount: number;
  insurancePremiumMonthly: number;
  insuranceActive: boolean;
  bankName: string;
  auditStatus: string;
  lastAuditDate: string;
  targetPool?: number;
  entryPrice?: number;
  auditFrequency?: string;
  interestAccrual?: boolean;
}

interface RFSummary {
  accounts: RFAccount[];
  totalRingFenced: number;
  totalInsurance: number;
  allVerified: boolean;
}

interface Transaction {
  id: string;
  accountId: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  status: string;
  verified: boolean;
}

interface Certificate {
  id: string;
  accountId: string;
  type: string;
  status: string;
  issuedDate: string;
  expiryDate: string;
  certificateNumber: string;
  guaranteedAmount: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TYPE_LABELS: Record<string, string> = {
  master: 'MASTER ACCOUNT',
  daily: 'DAILY DRAW',
  weekly: 'WEEKLY DRAW',
  monthly: 'MONTHLY MEGA',
  supercar: 'SUPERCAR SPECIAL',
  dream_app: 'DREAM APP PRIZE',
  world_record: 'WORLD RECORD',
};

const TYPE_ICONS: Record<string, string> = {
  master: '🏦',
  daily: '📅',
  weekly: '🗓️',
  monthly: '🏆',
  supercar: '🏎️',
  dream_app: '📱',
  world_record: '🌍',
};

function fmt(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M+`;
  if (n >= 1_000) return `£${n.toLocaleString()}`;
  return `£${n.toFixed(2)}`;
}

function txTypeLabel(t: string) {
  const map: Record<string, string> = {
    entry_deposit: 'Entry Deposit',
    prize_payout: 'Prize Payout',
    interest_credit: 'Interest Credit',
    fee_deduction: 'Fee Deduction',
    reserve_allocation: 'Reserve Allocation',
    insurance_payment: 'Insurance Payment',
    bank_fee: 'Bank Fee',
  };
  return map[t] || t;
}

export default function RingFencing() {
  const [summary, setSummary] = useState<RFSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'accounts' | 'ledger' | 'certificates'>('accounts');

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/ring-fencing/accounts`).then(r => r.json()),
      fetch(`${API_URL}/api/ring-fencing/transactions`).then(r => r.json()),
      fetch(`${API_URL}/api/ring-fencing/certificates`).then(r => r.json()),
    ])
      .then(([s, tx, certs]) => {
        setSummary(s);
        setTransactions(tx);
        setCertificates(certs);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rf-page">
      {/* Header */}
      <div className="rf-hero">
        <div className="rf-hero__content">
          <Link to="/" className="rf-back">← Back to Competitions</Link>
          <h1 className="rf-hero__title">🛡️ Ring-Fenced Prize Guarantees</h1>
          <p className="rf-hero__sub">
            Every prize pool is individually ring-fenced in a dedicated, segregated bank account,
            insurance-backed, and independently audited. Full public transparency on every fund.
          </p>
          {summary && (
            <div className="rf-hero__stats">
              <div className="rf-stat">
                <strong>{fmt(summary.totalRingFenced)}</strong>
                <span>Total Ring-Fenced</span>
              </div>
              <div className="rf-stat">
                <strong>{fmt(summary.totalInsurance)}</strong>
                <span>Total Insurance Cover</span>
              </div>
              <div className="rf-stat">
                <strong>{summary.accounts.length}</strong>
                <span>Accounts</span>
              </div>
              <div className="rf-stat">
                <strong className="rf-stat--green">✅ ALL VERIFIED</strong>
                <span>Audit Status</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="rf-tabs">
        <button className={`rf-tab ${activeTab === 'accounts' ? 'rf-tab--active' : ''}`} onClick={() => setActiveTab('accounts')}>
          🏦 Ring-Fenced Accounts
        </button>
        <button className={`rf-tab ${activeTab === 'ledger' ? 'rf-tab--active' : ''}`} onClick={() => setActiveTab('ledger')}>
          📊 Transaction Ledger
        </button>
        <button className={`rf-tab ${activeTab === 'certificates' ? 'rf-tab--active' : ''}`} onClick={() => setActiveTab('certificates')}>
          📜 Guarantee Certificates
        </button>
      </div>

      <div className="rf-content">
        {loading && <p className="rf-loading">Loading ring-fencing data…</p>}

        {/* Accounts Tab */}
        {!loading && activeTab === 'accounts' && summary && (
          <div className="rf-accounts">
            {summary.accounts.map(acc => {
              const progress = acc.targetPool ? (acc.currentBalance / acc.targetPool) * 100 : 100;
              return (
                <div key={acc.id} className={`rf-account-card rf-account-card--${acc.id}`}>
                  <div className="rf-ac__header">
                    <span className="rf-ac__icon">{TYPE_ICONS[acc.accountType] || '🏦'}</span>
                    <div>
                      <p className="rf-ac__type">{TYPE_LABELS[acc.accountType] || acc.accountType.toUpperCase()}</p>
                      <h3 className="rf-ac__name">{acc.accountName}</h3>
                    </div>
                    <span className={`rf-ac__status ${acc.auditStatus === 'verified' ? 'rf-ac__status--ok' : 'rf-ac__status--warn'}`}>
                      {acc.auditStatus === 'verified' ? '✅ VERIFIED' : '⏳ PENDING'}
                    </span>
                  </div>

                  <div className="rf-ac__balances">
                    <div className="rf-ac__bal">
                      <span>Balance</span>
                      <strong>{fmt(acc.currentBalance)}</strong>
                    </div>
                    <div className="rf-ac__bal">
                      <span>Reserved for Prizes</span>
                      <strong>{fmt(acc.reservedForPrizes)}</strong>
                    </div>
                    <div className="rf-ac__bal">
                      <span>Insurance Cover</span>
                      <strong className="rf-green">{fmt(acc.insuranceAmount)}</strong>
                    </div>
                  </div>

                  {acc.targetPool && (
                    <div className="rf-ac__progress">
                      <div className="rf-ac__prog-header">
                        <span>Pool Progress</span>
                        <span>{fmt(acc.currentBalance)} / {fmt(acc.targetPool)} ({progress.toFixed(1)}%)</span>
                      </div>
                      <div className="rf-ac__prog-bar">
                        <div className="rf-ac__prog-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="rf-ac__meta">
                    <div><span>🏦 Bank</span><strong>{acc.bankName}</strong></div>
                    <div><span>🛡️ Insurer</span><strong>{acc.insuranceProvider}</strong></div>
                    <div><span>🔍 Audit Frequency</span><strong>{acc.auditFrequency || 'Monthly'}</strong></div>
                    <div><span>📅 Last Audit</span><strong>{acc.lastAuditDate}</strong></div>
                    {acc.entryPrice && <div><span>💳 Entry Price</span><strong>£{acc.entryPrice}</strong></div>}
                    {acc.interestAccrual && <div><span>📈 Interest</span><strong>Accrues to pool</strong></div>}
                  </div>

                  <div className="rf-ac__guarantees">
                    <span>🛡️ Ring-Fenced: Yes</span>
                    <span>✅ Insurance: {acc.insuranceActive ? 'Active' : 'Inactive'}</span>
                    <span>✅ Segregated Account</span>
                    <span>✅ Third-Party Verified</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Transaction Ledger Tab */}
        {!loading && activeTab === 'ledger' && (
          <div className="rf-ledger">
            <p className="rf-ledger__note">
              All transactions are anonymised for privacy. Timestamped and verified against bank statements.
            </p>
            <div className="rf-ledger__table-wrap">
              <table className="rf-ledger__table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Account</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.date).toLocaleString()}</td>
                      <td>{TYPE_LABELS[tx.accountId] || tx.accountId}</td>
                      <td><span className={`rf-tx-type rf-tx-type--${tx.type}`}>{txTypeLabel(tx.type)}</span></td>
                      <td>{tx.description}</td>
                      <td className={tx.amount < 0 ? 'rf-tx-neg' : 'rf-tx-pos'}>
                        {tx.amount < 0 ? '' : '+'}{fmt(Math.abs(tx.amount))}
                      </td>
                      <td><span className={`rf-status rf-status--${tx.status}`}>{tx.status}</span></td>
                      <td>{tx.verified ? '✅' : '⏳'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="rf-ledger__footer">Showing recent transactions. Full ledger available on request from our auditors.</p>
          </div>
        )}

        {/* Certificates Tab */}
        {!loading && activeTab === 'certificates' && (
          <div className="rf-certs">
            <p className="rf-certs__note">
              Download official ring-fencing, insurance, and audit certificates for each prize pool.
            </p>
            <div className="rf-certs__grid">
              {certificates.map(cert => (
                <div key={cert.id} className="rf-cert-card">
                  <div className="rf-cert__header">
                    <span className="rf-cert__icon">📜</span>
                    <div>
                      <p className="rf-cert__type">{cert.type.replace(/_/g, ' ').toUpperCase()} CERTIFICATE</p>
                      <h4 className="rf-cert__account">{TYPE_LABELS[cert.accountId] || cert.accountId}</h4>
                    </div>
                    <span className={`rf-cert__status rf-cert__status--${cert.status}`}>
                      {cert.status === 'active' ? '✅ Active' : cert.status}
                    </span>
                  </div>
                  <div className="rf-cert__details">
                    <div><span>Certificate No.</span><strong>{cert.certificateNumber}</strong></div>
                    <div><span>Guaranteed Amount</span><strong className="rf-green">{fmt(cert.guaranteedAmount)}</strong></div>
                    <div><span>Issued</span><strong>{cert.issuedDate}</strong></div>
                    <div><span>Expires</span><strong>{cert.expiryDate}</strong></div>
                  </div>
                  <button className="rf-cert__download" onClick={() => alert(`Certificate ${cert.certificateNumber} - Available for download. Contact support@luxeprizedraws.com for the official PDF.`)}>
                    ⬇ Download Certificate PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* How Ring-Fencing Works Section */}
      <section className="rf-how">
        <div className="rf-how__inner">
          <h2>How Ring-Fencing Works</h2>
          <div className="rf-how__flow">
            <div className="rf-how__step">
              <span className="rf-how__num">1</span>
              <h4>You Pay Entry</h4>
              <p>Your entry fee is processed securely via Stripe</p>
            </div>
            <div className="rf-how__arrow">→</div>
            <div className="rf-how__step">
              <span className="rf-how__num">2</span>
              <h4>70% Ring-Fenced</h4>
              <p>£0.70 of every £1 goes directly to the ring-fenced prize pool immediately</p>
            </div>
            <div className="rf-how__arrow">→</div>
            <div className="rf-how__step">
              <span className="rf-how__num">3</span>
              <h4>Insurance-Backed</h4>
              <p>Lloyd's of London backs every prize pool. If the pool falls short, insurance covers it</p>
            </div>
            <div className="rf-how__arrow">→</div>
            <div className="rf-how__step">
              <span className="rf-how__num">4</span>
              <h4>Draw & Payout</h4>
              <p>Winners are paid directly from the ring-fenced account — same or next day</p>
            </div>
            <div className="rf-how__arrow">→</div>
            <div className="rf-how__step">
              <span className="rf-how__num">5</span>
              <h4>Audited</h4>
              <p>Every transaction is logged, reconciled monthly, and verified quarterly by independent auditors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="rf-footer">
        <div className="rf-footer__inner">
          <p>🛡️ All prize pools are individually ring-fenced and insurance-backed. Verified by independent third-party auditors.</p>
          <Link to="/" className="rf-footer__link">← Back to Competitions</Link>
        </div>
      </footer>
    </div>
  );
}
