import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CompetitionCard from '../components/CompetitionCard';
import EntryModal from '../components/EntryModal';
import './Dashboard.css';
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
      <header className="dash-header home-page-header">
        <div className="dash-header__inner">
          <div>
            <h1 className="dash-title">🏆 UAE Competition Platform</h1>
            <p className="dash-subtitle">Luxury draws with transparent progress and premium rewards</p>
          </div>
          <Link to="/dashboard" className="back-link">📊 Dashboard</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-gradient" />
        </div>
        <div className="hero-content">
          <span className="hero-badge">🏆 UAE Premium Competitions</span>
          <h1 className="hero-title">Win Life-Changing Prizes</h1>
          <p className="hero-subtitle">
            Fair draws · Cash alternatives · Transparent odds · Guaranteed winners
          </p>
          <div className="hero-badges">
            <div className="badge"><span className="badge-icon">💰</span><span className="badge-text">Cash Alternatives</span></div>
            <div className="badge"><span className="badge-icon">📊</span><span className="badge-text">Transparent Odds</span></div>
            <div className="badge"><span className="badge-icon">✅</span><span className="badge-text">Guaranteed Winners</span></div>
            <div className="badge"><span className="badge-icon">🔴</span><span className="badge-text">Live Draws</span></div>
          </div>
          <a href="#competitions" className="btn-cta">VIEW COMPETITIONS ↓</a>
        </div>
      </section>

      {/* Stats bar */}
      <section className="dash-stats home-dash-stats">
        <div className="stat-card">
          <span className="stat-num">{competitions.length}</span>
          <span className="stat-label">Total Competitions</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{liveComps.length}</span>
          <span className="stat-label">Competitions Live</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">£18.4M</span>
          <span className="stat-label">Annual Prizes</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">100%</span>
          <span className="stat-label">Cash Alternative</span>
        </div>
      </section>

      <div className="draw-legend home-draw-legend">
        <span className="legend-item"><span style={{ color: '#22c55e' }}>🟢</span> Draw Ready (100%)</span>
        <span className="legend-item"><span style={{ color: '#eab308' }}>🟡</span> Almost Ready (75–99%)</span>
        <span className="legend-item"><span style={{ color: '#3b82f6' }}>🔵</span> In Progress (50–74%)</span>
        <span className="legend-item"><span style={{ color: '#6b7280' }}>⚪</span> Coming Soon (0–49%)</span>
      </div>

      {/* Competitions */}
      <section className="competitions-section" id="competitions">
        <div className="container">
          <h2 className="section-title">🎯 LIVE COMPETITIONS</h2>
          {loading && <p className="loading">Loading competitions...</p>}
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
          <h2 className="section-title">WHY CHOOSE US</h2>
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon">🔒</div>
              <h3>Secure Platform</h3>
              <p>Bank-grade security and SSL encryption on all transactions</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">📡</div>
              <h3>Live Fair Draws</h3>
              <p>Every draw is conducted live and verifiably fair</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">💰</div>
              <h3>Cash Alternative</h3>
              <p>Every prize has a cash equivalent — you always have the choice</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">📊</div>
              <h3>Transparent Odds</h3>
              <p>40% house margin shown publicly. No hidden fees or surprises</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} UAE Competition Platform · Fair, Transparent &amp; Compliant Draws</p>
          <Link to="/dashboard" className="footer-dash-link">📊 View Live Dashboard →</Link>
        </div>
      </footer>

      {selectedComp && (
        <EntryModal competition={selectedComp} onClose={() => setSelectedComp(null)} />
      )}
    </div>
  );
}
