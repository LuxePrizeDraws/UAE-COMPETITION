import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CompetitionCard from '../components/CompetitionCard';
import EntryModal from '../components/EntryModal';
import './Home.css';

interface Competition {
  id: number;
  title: string;
  description: string;
  prizeType: string;
  prizeAmount: number;
  currency: string;
  cashAlternative: boolean;
  cashAlternativeAmount: number;
  entryPrice: number;
  totalEntries: number;
  soldEntries: number;
  endsIn: string;
  status: string;
  tags: string[];
  profitMargin: string;
  expectedWinners: number;
  prizeIncludes?: string[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Home() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/competitions`)
      .then((res) => res.json())
      .then((data) => {
        setCompetitions(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load competitions. Please try again later.');
        setLoading(false);
      });
  }, []);

  const liveComps = competitions.filter((c) => c.status === 'live');
  const comingSoon = competitions.filter((c) => c.status === 'coming-soon');

  const cardCompetitions = competitions.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    prizeType: c.prizeType,
    prizeAmount: c.prizeAmount,
    prizeDetails: {
      currency: c.currency,
      description: c.prizeType,
      includes: c.prizeIncludes,
    },
    entryPrice: c.entryPrice,
    totalEntries: c.totalEntries,
    soldEntries: c.soldEntries,
    endsIn: c.endsIn,
    tags: c.tags,
    profitMargin: c.profitMargin,
    expectedWinners: c.expectedWinners,
    status: c.status,
  }));

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-gradient" />
        </div>
        <div className="hero-content">
          <span className="hero-badge">💎 Premium Competitions — UAE &amp; UK</span>
          <h1 className="hero-title">Premium Competitions.<br />Guaranteed Prizes.</h1>
          <p className="hero-subtitle">
            Your chance to win life-changing prizes — with equal odds for every entrant.<br />
            Digital or free postal entry. Always fair. Always transparent.
          </p>
          <div className="hero-badges">
            <div className="badge"><span className="badge-icon">🛡️</span><span className="badge-text">Ring-Fenced Prizes</span></div>
            <div className="badge"><span className="badge-icon">📮</span><span className="badge-text">Free Postal Entry</span></div>
            <div className="badge"><span className="badge-icon">✅</span><span className="badge-text">Guaranteed Winners</span></div>
            <div className="badge"><span className="badge-icon">🔒</span><span className="badge-text">Secure &amp; Regulated</span></div>
          </div>
          <a href="#competitions" className="btn-cta">View Competitions ↓</a>
        </div>
      </section>

      {/* Stats bar */}
      <div className="home-stats">
        <div className="home-stats__inner">
          <div className="home-stat"><strong>{competitions.length}</strong><span>Competitions</span></div>
          <div className="home-stat"><strong>{liveComps.length}</strong><span>Live Now</span></div>
          <div className="home-stat"><strong>£18.4M</strong><span>Annual Prizes</span></div>
          <div className="home-stat"><strong>100%</strong><span>Prize Guaranteed</span></div>
        </div>
      </div>

      {/* Ring-fenced guarantee banner */}
      <div className="guarantee-banner">
        <div className="container">
          <div className="guarantee-icon">🛡️</div>
          <div className="guarantee-text">
            <h3>Ring-Fenced Prize Guarantee</h3>
            <p>
              Every prize is 100% ring-fenced before a competition opens. This means the prize money or
              physical prize is secured and held in trust — guaranteed to be paid out to a winner, no matter what.
              You can enter with complete confidence.
            </p>
          </div>
        </div>
      </div>

      {/* Competitions */}
      <section className="competitions-section" id="competitions">
        <div className="container">
          <h2 className="section-title">Live <span>Competitions</span></h2>
          {loading && <p className="loading">Loading competitions…</p>}
          {error && <p className="loading" style={{ color: '#f87171' }}>{error}</p>}
          {!loading && !error && (
            <div className="competitions-grid">
              {cardCompetitions.map((comp) => (
                <CompetitionCard
                  key={comp.id}
                  competition={comp}
                  onEnter={(id) => {
                    const c = competitions.find((x) => x.id === id);
                    if (c) setSelectedComp(c);
                  }}
                />
              ))}
            </div>
          )}
          {comingSoon.length > 0 && (
            <p className="coming-soon-note">
              ⏳ <strong>{comingSoon.length} competition{comingSoon.length > 1 ? 's' : ''} coming soon</strong> — check back shortly!
            </p>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="container">
          <h2 className="section-title">Why <span>Choose Us</span></h2>
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon">🛡️</div>
              <h3>Ring-Fenced Prizes</h3>
              <p>Every prize is secured in trust before the competition opens. Your win is guaranteed.</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">📮</div>
              <h3>Free Postal Entry</h3>
              <p>Enter any competition for free by post. Identical odds to paid digital entries — completely equal.</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">🔒</div>
              <h3>Secure Platform</h3>
              <p>Bank-grade security and SSL encryption on all transactions via Stripe.</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">📊</div>
              <h3>Transparent Odds</h3>
              <p>40% house margin shown publicly. No hidden fees or surprises — ever.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-links">
            <Link to="/postal-entry">Free Postal Entry</Link>
            <Link to="/dashboard">Live Dashboard</Link>
            <a href="#">Terms &amp; Conditions</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Responsible Gaming</a>
          </div>
          <p>© {new Date().getFullYear()} LuxePrize · Ring-Fenced · Fair · Regulated</p>
        </div>
      </footer>

      {selectedComp && (
        <EntryModal competition={selectedComp} onClose={() => setSelectedComp(null)} />
      )}
    </div>
  );
}
