import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CompetitionCard from '../components/CompetitionCard';
import EntryModal from '../components/EntryModal';
import SupercarTicker from '../components/SupercarTicker';
import RecentWinners from '../components/RecentWinners';
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
      <section className="home-header">
        <div className="home-header__inner container">
          <div>
            <span className="home-header__badge">🏆 UAE Premium Competitions</span>
            <h1 className="home-header__title">Competition Home</h1>
            <p className="home-header__subtitle">Live draws · Cash alternatives · Postal entry on every competition</p>
          </div>
          <Link to="/dashboard" className="home-header__link">📊 Open Dashboard</Link>
        </div>
      </section>

      <section className="home-stats-cards container">
        <div className="home-stat-card"><strong>{competitions.length}</strong><span>Total Competitions</span></div>
        <div className="home-stat-card"><strong>{liveComps.length}</strong><span>Live Now</span></div>
        <div className="home-stat-card"><strong>£18.4M</strong><span>Annual Prizes</span></div>
        <div className="home-stat-card"><strong>FREE</strong><span>Postal Entry</span></div>
      </section>

      <section className="competitions-section" id="competitions">
        <div className="container">
          <h2 className="section-title">🎯 LIVE COMPETITIONS</h2>
          <SupercarTicker />
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
          <RecentWinners title="Recent Winners & Prize Amounts" />
        </div>
      </section>

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
              <div className="trust-icon">📬</div>
              <h3>Free Postal Entry</h3>
              <p>Every competition includes a free postal entry route with equal prominence</p>
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
