import { useEffect, useState } from 'react';
import type * as React from 'react';
import { Link } from 'react-router-dom';
import CompetitionCard from '../components/CompetitionCard';
import { DRAW_LEGEND_ITEMS } from '../constants/drawLegend';
import { CurrencyCode, CURRENCIES, detectCurrency, detectJurisdictionCurrency, storeCurrency } from '../utils/currency';
import { API_BASE } from '../config';
import '../styles/luxuryLayout.css';
import './Home.css';

interface Competition {
  id: number;
  title: string;
  description: string;
  prizeType: string;
  prizeAmount: number;
  prizeDetails: {
    currency: string;
    description: string;
    includes?: string[];
  };
  entryPrice: number;
  totalEntries: number;
  soldEntries: number;
  endsIn: string;
  tags: string[];
  profitMargin: string;
  expectedWinners: number;
  status?: string;
}

const Home = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>('AED');
  const [complianceCurrency, setComplianceCurrency] = useState<CurrencyCode>('AED');

  useEffect(() => {
    detectCurrency().then(setCurrency);
    detectJurisdictionCurrency().then(setComplianceCurrency);
  }, []);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/competitions`);
        if (!response.ok) throw new Error('Failed to fetch competitions');
        const data = await response.json();
        setCompetitions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchCompetitions();
  }, []);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as CurrencyCode;
    setCurrency(selected);
    storeCurrency(selected);
  };

  const liveComps = competitions.filter((c) => c.status === 'live');
  const comingSoonCount = competitions.filter((c) => c.status === 'coming-soon').length;

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
          <div className="hero-gradient"></div>
        </div>
        <div className="hero-content">
          <span className="hero-badge">✦ TRANSPARENT · COMPLIANT · GLOBAL ✦</span>
          <h1 className="hero-title">WIN LUXURY.<br />LIVE ELITE.</h1>
          <p className="hero-subtitle">
            Enter elite competitions with fully transparent odds. Win luxury prizes or take the cash alternative. 
            Compliant across UK &amp; UAE.
          </p>
          <div className="hero-badges">
            <div className="badge">
              <span className="badge-icon">🎯</span>
              <span className="badge-text">Transparent Odds</span>
            </div>
            <div className="badge">
              <span className="badge-icon">🔒</span>
              <span className="badge-text">Secure &amp; Compliant</span>
            </div>
            <div className="badge">
              <span className="badge-icon">💰</span>
              <span className="badge-text">Cash Alternative</span>
            </div>
            <div className="badge">
              <span className="badge-icon">🌍</span>
              <span className="badge-text">Global Entry</span>
            </div>
          </div>
        </div>
      </section>

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
          <span className="stat-num">{comingSoonCount}</span>
          <span className="stat-label">Coming Soon</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">100%</span>
          <span className="stat-label">Cash Alternative</span>
        </div>
      </section>

      <div className="draw-legend home-draw-legend">
        {DRAW_LEGEND_ITEMS.map((item) => (
          <span key={item.label} className="legend-item">
            <span style={{ color: item.color }}>{item.icon}</span> {item.label}
          </span>
        ))}
      </div>

      {/* Currency Selector */}
      <section className="currency-bar">
        <div className="container">
          <div className="currency-selector-wrapper">
            <span className="currency-selector-label">🌍 Your Currency:</span>
            <select
              className="currency-select"
              value={currency}
              onChange={handleCurrencyChange}
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} — {c.name}
                </option>
              ))}
            </select>
            <span className="currency-note">Prices shown in your currency (indicative rates)</span>
          </div>
        </div>
      </section>

      {/* Competitions */}
      <section className="competitions-section">
        <div className="container">
          <h2 className="section-title">LIVE COMPETITIONS</h2>
          {loading && <div className="loading">Loading competitions...</div>}
          {error && <div className="loading" style={{ color: '#e57373' }}>Error: {error}</div>}
          {!loading && !error && (
            <div className="competitions-grid">
              {competitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  currency={currency}
                  complianceCurrency={complianceCurrency}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon">⚖️</div>
              <h3>UK Compliant</h3>
              <p>Structured as "win to buy" — compliant with UK Gambling Commission guidelines</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">🇦🇪</div>
              <h3>UAE Compliant</h3>
              <p>Structured as a promotional competition — aligned with UAE DFSA guidelines</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">📊</div>
              <h3>Transparent Odds</h3>
              <p>Every competition shows exact odds so you always know your chances</p>
            </div>
            <div className="trust-item">
              <div className="trust-icon">🏆</div>
              <h3>Guaranteed Winner</h3>
              <p>Every competition has a guaranteed winner via live draw</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer compliance */}
      <footer className="footer-compliance">
        <div className="container">
          <p>
            18+ UK / 21+ UAE. Please gamble responsibly.{' '}
            <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer">BeGambleAware.org</a>
            {' '}|{' '}
            <a href="https://www.gamblingcommission.gov.uk" target="_blank" rel="noopener noreferrer">UK Gambling Commission</a>
          </p>
          <p>Currency conversion rates are indicative only. Prizes paid in AED unless cash alternative selected.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
