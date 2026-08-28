import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Competition } from '../types';

const CompetitionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompetition = async () => {
      try {
        const response = await fetch(`/api/competitions/${id}`);
        if (!response.ok) {
          throw new Error('Competition not found');
        }
        const data = await response.json();
        setCompetition(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Competition not found');
      } finally {
        setLoading(false);
      }
    };

    loadCompetition().catch(() => setError('Competition not found'));
  }, [id]);

  const remainingEntries = useMemo(() => {
    if (!competition) return 0;
    return competition.totalEntries - competition.soldEntries;
  }, [competition]);

  const total = (competition?.entryPrice ?? 0) * quantity;

  const handleProceed = () => {
    if (!competition) return;
    const checkoutPath = `/checkout?competition=${competition.id}&quantity=${quantity}`;
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(checkoutPath)}`);
      return;
    }
    navigate(checkoutPath);
  };

  if (loading) {
    return <div className="container page-header"><div className="notice">Loading competition details…</div></div>;
  }

  if (!competition) {
    return (
      <div className="container not-found-page">
        <div className="error-banner">{error || 'Competition not found'}</div>
        <Link className="btn" to="/">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="container">
        <div className="page-header">
          <p className="section-eyebrow">Competition detail</p>
          <h1 className="section-heading">{competition.title}</h1>
          <p className="section-copy">{competition.description}</p>
        </div>

        <div className="detail-grid">
          <section className="detail-card competition-hero-card">
            <div className="competition-hero-icon">{competition.image}</div>
            <div className="detail-pill-row">
              <span className="badge-pill">{competition.prizeType}</span>
              <span className="badge-pill">Draw date: {competition.drawDate}</span>
            </div>
            <h2>{competition.shortTitle}</h2>
            <p className="section-copy">
              Prize value of {competition.prizeAmount.toLocaleString()} AED with a transparent capped-entry structure.
            </p>

            <div className="kpi-grid detail-kpis">
              <div className="hero-stat">
                <div className="metric-value">{competition.entryPrice} AED</div>
                <div className="metric-label">Entry price</div>
              </div>
              <div className="hero-stat">
                <div className="metric-value">{remainingEntries.toLocaleString()}</div>
                <div className="metric-label">Entries remaining</div>
              </div>
              <div className="hero-stat">
                <div className="metric-value">{competition.soldEntries.toLocaleString()}</div>
                <div className="metric-label">Tickets sold</div>
              </div>
              <div className="hero-stat">
                <div className="metric-value">{competition.endsIn}</div>
                <div className="metric-label">Time remaining</div>
              </div>
            </div>

            <div className="info-list">
              <h3>What is included</h3>
              <ul>
                {competition.prizeDetails.includes?.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <div className="info-list">
              <h3>Why members love this prize</h3>
              <ul>
                {competition.highlights.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </section>

          <aside className="detail-card detail-entry-card">
            <p className="section-eyebrow">Reserve your entries</p>
            <h2>Fast-track checkout</h2>
            <p className="section-copy">
              Secure your place in the draw with a Stripe-ready checkout experience and instant account tracking.
            </p>

            <div className="form-grid">
              <label>
                <span>Number of entries</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(event) => setQuantity(Math.max(1, Math.min(100, Number(event.target.value) || 1)))}
                />
              </label>
            </div>

            <div className="summary-card detail-summary">
              <div>
                <span className="metric-label">Ticket price</span>
                <div className="metric-value">{competition.entryPrice} AED</div>
              </div>
              <div>
                <span className="metric-label">Entries selected</span>
                <div className="metric-value">{quantity}</div>
              </div>
              <div>
                <span className="metric-label">Order total</span>
                <div className="metric-value">{total.toLocaleString()} AED</div>
              </div>
            </div>

            <div className="notice">{competition.profitMargin}</div>
            <button type="button" className="btn" onClick={handleProceed}>
              {user ? 'Continue to Checkout' : 'Login to Continue'}
            </button>
            <Link className="btn-linkish" to="/signup">
              New member? Create your luxury access account.
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CompetitionDetail;
