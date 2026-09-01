import { useEffect, useState } from 'react';
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

const demoPaths = [
  {
    title: 'Start with the dashboard',
    description: 'Show the draw catalogue, progress states, prize or cash toggle, and entry flow in one click.',
    href: '/dashboard',
    cta: 'Open dashboard',
  },
  {
    title: 'Review the investor summary',
    description: 'Keep the story disclosure-first with the existing summary of what is published versus still private.',
    href: '/investor-summary',
    cta: 'View disclosure page',
  },
  {
    title: 'Browse active competitions',
    description: 'Jump straight into the live catalogue below to demonstrate cards, ticket pricing, and modal entry interactions.',
    href: '#competitions',
    cta: 'See competitions',
  },
] as const;

const demoHighlights = [
  'Dark, premium presentation designed for live walkthroughs',
  'Interactive dashboard for draw states, prizes, and entry actions',
  'Disclosure-led investor summary without unsupported public metrics',
  'Existing routing preserved so key pages remain easy to demo',
] as const;

const walkthroughSteps = [
  {
    title: '1. Frame the product clearly',
    description: 'Introduce UAE Competition as a premium prize-draw frontend focused on browsing draws, understanding entry mechanics, and exploring supporting disclosure pages.',
  },
  {
    title: '2. Prove the UI experience',
    description: 'Move into the dashboard and live catalogue to show card states, draw progress, and the current modal-based entry journey.',
  },
  {
    title: '3. Close with disclosure',
    description: 'Finish on the investor summary to show what is published today and what remains available only after verification or direct diligence.',
  },
] as const;

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

  const liveComps = competitions.filter((competition) => competition.status === 'live');
  const comingSoon = competitions.filter((competition) => competition.status === 'coming-soon');
  const cashAlternativeCount = competitions.filter((competition) => competition.cashAlternative).length;

  const cardCompetitions = competitions.map((competition) => ({
    id: competition.id,
    title: competition.title,
    description: competition.description,
    prizeType: competition.prizeType,
    prizeAmount: competition.prizeAmount,
    prizeDetails: {
      currency: competition.currency,
      description: competition.prizeType,
      includes: competition.prizeIncludes,
    },
    entryPrice: competition.entryPrice,
    totalEntries: competition.totalEntries,
    soldEntries: competition.soldEntries,
    endsIn: competition.endsIn,
    tags: competition.tags,
    profitMargin: competition.profitMargin,
    expectedWinners: competition.expectedWinners,
    status: competition.status,
  }));

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-background">
          <div className="hero-gradient" />
        </div>
        <div className="hero-content container">
          <span className="hero-badge">Demo-ready presentation</span>
          <h1 className="hero-title">A polished walkthrough of the UAE Competition experience</h1>
          <p className="hero-subtitle">
            Use this homepage as the demo entry point: it explains the product, points directly to the
            dashboard and investor summary, and keeps the story focused on product experience and
            transparent disclosure.
          </p>
          <div className="hero-actions">
            <Link to="/dashboard" className="btn-cta">Open Live Dashboard</Link>
            <Link to="/investor-summary" className="btn-secondary">Review Investor Summary</Link>
            <a href="#competitions" className="btn-secondary">Browse Competitions</a>
          </div>
          <p className="hero-note">
            Demo note: this experience is presentation-focused and avoids unsupported public
            financial claims. Commercial details remain disclosure-led throughout the app.
          </p>
        </div>
      </section>

      <div className="home-stats">
        <div className="container home-stats__inner">
          <div className="home-stat">
            <strong>{competitions.length}</strong>
            <span>Total competitions</span>
          </div>
          <div className="home-stat">
            <strong>{liveComps.length}</strong>
            <span>Live now</span>
          </div>
          <div className="home-stat">
            <strong>{comingSoon.length}</strong>
            <span>Coming soon</span>
          </div>
          <div className="home-stat">
            <strong>{cashAlternativeCount}</strong>
            <span>Cash alternatives</span>
          </div>
        </div>
      </div>

      <section className="demo-section">
        <div className="container">
          <h2 className="section-title">Demo flow at a glance</h2>
          <div className="demo-grid">
            {demoPaths.map((path) => (
              <article key={path.title} className="demo-card">
                <h3>{path.title}</h3>
                <p>{path.description}</p>
                {path.href.startsWith('/') ? (
                  <Link to={path.href} className="demo-link">{path.cta} →</Link>
                ) : (
                  <a href={path.href} className="demo-link">{path.cta} →</a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="trust-section">
        <div className="container">
          <h2 className="section-title">Why this works well in a demo</h2>
          <div className="trust-grid">
            {demoHighlights.map((highlight) => (
              <article key={highlight} className="trust-item">
                <div className="trust-icon">✦</div>
                <p>{highlight}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="walkthrough-section">
        <div className="container">
          <h2 className="section-title">Suggested presenter walkthrough</h2>
          <div className="walkthrough-grid">
            {walkthroughSteps.map((step) => (
              <article key={step.title} className="walkthrough-card">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="competitions-section" id="competitions">
        <div className="container">
          <h2 className="section-title">Current competition catalogue</h2>
          <p className="section-copy">
            These cards provide the hands-on part of the demo: prize presentation, entry pricing,
            progress indicators, and modal entry handling.
          </p>
          {loading && <p className="loading">Loading competitions...</p>}
          {error && <p className="loading loading--error">{error}</p>}
          {!loading && !error && (
            <div className="competitions-grid">
              {cardCompetitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  onEnter={(id) => {
                    const selectedCompetition = competitions.find((item) => item.id === id);
                    if (selectedCompetition) {
                      setSelectedComp(selectedCompetition);
                    }
                  }}
                />
              ))}
            </div>
          )}
          {comingSoon.length > 0 && (
            <p className="coming-soon-note">
              {comingSoon.length} upcoming competition{comingSoon.length > 1 ? 's are' : ' is'} still
              surfaced for roadmap context during demos.
            </p>
          )}
        </div>
      </section>

      <footer className="home-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} UAE Competition Platform</p>
          <div className="footer-links">
            <Link to="/dashboard" className="footer-dash-link">📊 Live Dashboard</Link>
            <Link to="/investor-summary" className="footer-dash-link">💼 Investor Summary</Link>
          </div>
        </div>
      </footer>

      {selectedComp && (
        <EntryModal competition={selectedComp} onClose={() => setSelectedComp(null)} />
      )}
    </main>
  );
}
