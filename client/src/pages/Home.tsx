import { useEffect, useState } from 'react';
import CompetitionCard from '../components/CompetitionCard';
import type { Competition } from '../types';
import './Home.css';

const Home = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        const response = await fetch('/api/competitions');
        if (!response.ok) {
          throw new Error('Unable to load competitions');
        }
        const data = await response.json();
        setCompetitions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load competitions');
      } finally {
        setLoading(false);
      }
    };

    loadCompetitions().catch(() => setError('Unable to load competitions'));
  }, []);

  const totalPrizeValue = competitions.reduce((sum, item) => sum + item.prizeAmount, 0);
  const totalLiveEntries = competitions.reduce((sum, item) => sum + item.soldEntries, 0);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-background">
          <div className="hero-gradient" />
        </div>
        <div className="container hero-content">
          <span className="hero-badge">Luxury draws designed for the UAE</span>
          <h1 className="hero-title">Win elite prizes for as little as 1 AED.</h1>
          <p className="hero-subtitle">
            Discover eight premium competitions spanning cash, supercars, real estate, luxury travel and rare
            timepieces — all inside a dark luxury experience built for conversion.
          </p>

          <div className="hero-badges">
            <div className="badge">
              <span className="badge-icon">✦</span>
              <span className="badge-text">8 live premium competitions</span>
            </div>
            <div className="badge">
              <span className="badge-icon">💰</span>
              <span className="badge-text">{totalPrizeValue.toLocaleString() || '0'} AED in prizes</span>
            </div>
            <div className="badge">
              <span className="badge-icon">🎟</span>
              <span className="badge-text">{totalLiveEntries.toLocaleString() || '0'} entries confirmed</span>
            </div>
            <div className="badge">
              <span className="badge-icon">🔐</span>
              <span className="badge-text">JWT member access & protected admin</span>
            </div>
          </div>

          <div className="hero-actions">
            <a href="#competitions" className="btn btn-cta">
              Explore Live Competitions
            </a>
            <a href="#trust" className="btn-outline btn-ghost">
              Why members trust us
            </a>
          </div>
        </div>
      </section>

      <section className="competitions-section" id="competitions">
        <div className="container">
          <p className="section-eyebrow">Curated live opportunities</p>
          <h2 className="section-heading">Eight premium competitions, one refined platform.</h2>
          <p className="section-copy">
            Every draw includes transparent entry caps, live status indicators, luxury positioning and a direct path
            from discovery to checkout.
          </p>

          {loading && <div className="loading">Loading premium inventory…</div>}
          {error && <div className="error-banner">{error}</div>}

          <div className="competitions-grid">
            {competitions.map((competition) => (
              <CompetitionCard key={competition.id} competition={competition} />
            ))}
          </div>
        </div>
      </section>

      <section className="trust-section" id="trust">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon">⚜</div>
              <h3>Luxury-first branding</h3>
              <p>Dark surfaces, gold highlights and premium presentation tailored for high-value UAE audiences.</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">🛡</div>
              <h3>Secure authentication</h3>
              <p>JWT-based member sessions with protected checkout, dashboard and admin experiences.</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">💳</div>
              <h3>Stripe-ready checkout</h3>
              <p>Payment-intent stub wiring makes it simple to connect production Stripe flows later.</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">📊</div>
              <h3>Operational visibility</h3>
              <p>Admins can review members, platform stats and entries in a protected control panel.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="gallery-section">
        <div className="container card-grid">
          {[
            ['Ferrari F8 Tributo', 'Italian performance icon and bespoke ownership dream.'],
            ['Dubai Penthouse', 'Iconic skyline living with ultra-premium positioning.'],
            ['Rolex Daytona', 'Collector-grade prestige with instant desirability.'],
            ['Business Class World Tour', 'Aspirational travel narrative crafted for conversion.'],
          ].map(([title, copy]) => (
            <article key={title} className="info-tile gallery-tile">
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
