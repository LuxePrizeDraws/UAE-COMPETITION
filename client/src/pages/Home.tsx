import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CompetitionCard from '../components/CompetitionCard';
import EntryModal from '../components/EntryModal';
import { cardShadow, getNextSunday8PmUtc, hoverShadow, palette, useCountdown, useCyclingIndex } from '../lib/luxury';
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
const winnerFeed = ['Sarah M.', 'James T.', 'Aisha K.', 'Anonymous VIP'];

export default function Home() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [liveEntryCount, setLiveEntryCount] = useState(48270);
  const [lastHourEntries, setLastHourEntries] = useState(318);
  const nextDrawTarget = useMemo(() => getNextSunday8PmUtc(), []);
  const countdown = useCountdown(nextDrawTarget);
  const winnerIndex = useCyclingIndex(winnerFeed.length, 4000);

  useEffect(() => {
    fetch(`${API_URL}/api/competitions`)
      .then((res) => res.json())
      .then((data: Competition[]) => {
        setCompetitions(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load competitions. Please try again later.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const entriesInterval = window.setInterval(() => {
      setLiveEntryCount((current) => current + Math.floor(Math.random() * 4) + 1);
    }, 2500);

    const hourlyInterval = window.setInterval(() => {
      setLastHourEntries(280 + Math.floor(Math.random() * 170));
    }, 10000);

    return () => {
      window.clearInterval(entriesInterval);
      window.clearInterval(hourlyInterval);
    };
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

  const tickerItems = [
    `🔴 LIVE ${liveEntryCount.toLocaleString()} total entries`,
    `🎉 ${winnerFeed[winnerIndex]} just won £10,000`,
    `⏰ Next draw closes in ${countdown.shortLabel}`,
    '⚡ DOUBLE ENTRIES promo live now',
  ];

  return (
    <div className="home" style={{ background: palette.nearBlack, color: palette.text }}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          background: '#050505',
          borderBottom: `1px solid ${palette.gold}`,
          overflow: 'hidden',
          height: 42,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', minWidth: 'max-content', animation: 'luxuryMarquee 22s linear infinite' }}>
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <div
              key={`${item}-${index}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '0 1.8rem',
                fontSize: 14,
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: palette.urgent, animation: 'luxuryPulse 1s infinite' }}>●</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: palette.urgent,
          color: palette.text,
          textAlign: 'center',
          padding: '0.8rem 1rem',
          fontWeight: 900,
          letterSpacing: 1.2,
          animation: 'luxuryFlash 1.2s infinite',
        }}
      >
        ⚡ DOUBLE ENTRIES — LIMITED TIME! ⚡
      </div>

      <section className="hero" style={{ paddingTop: '5rem', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <div className="hero-background">
          <div className="hero-gradient" />
        </div>
        <div className="hero-content">
          <span className="hero-badge">🏆 UAE Premium Competitions</span>
          <h1 className="hero-title">Win Life-Changing Prizes</h1>
          <p className="hero-subtitle">
            Fair draws · Cash alternatives · Transparent odds · Guaranteed winners
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '0.9rem 1.2rem',
              borderRadius: 12,
              background: 'rgba(220,38,38,0.12)',
              border: '1px solid rgba(220,38,38,0.5)',
              marginBottom: '1rem',
              boxShadow: '0 0 25px rgba(220,38,38,0.16)',
            }}
          >
            <span style={{ color: palette.urgent, animation: 'luxuryPulse 1s infinite' }}>●</span>
            <strong>⏰ Next draw closes in {countdown.label}</strong>
          </div>
          <div
            style={{
              margin: '0 auto 2rem',
              maxWidth: 700,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1rem',
            }}
          >
            <div style={{ padding: '1rem', borderRadius: 12, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.18)' }}>
              <div style={{ color: palette.gold, fontSize: '1.4rem', fontWeight: 900 }}>{liveEntryCount.toLocaleString()}</div>
              <div style={{ color: palette.muted, fontSize: 14 }}>Live entries sold today</div>
            </div>
            <div style={{ padding: '1rem', borderRadius: 12, background: 'rgba(22,163,74,0.09)', border: '1px solid rgba(22,163,74,0.3)' }}>
              <div style={{ color: palette.success, fontSize: '1.4rem', fontWeight: 900 }}>🔥 {lastHourEntries}</div>
              <div style={{ color: palette.muted, fontSize: 14 }}>people entered in the last hour</div>
            </div>
            <div style={{ padding: '1rem', borderRadius: 12, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.35)' }}>
              <div style={{ color: palette.hot, fontSize: '1.4rem', fontWeight: 900 }}>{liveComps.length || 0}</div>
              <div style={{ color: palette.muted, fontSize: 14 }}>live competitions closing fast</div>
            </div>
          </div>
          <div className="hero-badges">
            <div className="badge"><span className="badge-icon">💰</span><span className="badge-text">Cash Alternatives</span></div>
            <div className="badge"><span className="badge-icon">📊</span><span className="badge-text">Transparent Odds</span></div>
            <div className="badge"><span className="badge-icon">✅</span><span className="badge-text">Guaranteed Winners</span></div>
            <div className="badge"><span className="badge-icon">🔴</span><span className="badge-text">Live Draws</span></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="#competitions" className="btn-cta">VIEW COMPETITIONS ↓</a>
            <Link
              to="/play"
              style={{
                padding: '1rem 2rem',
                borderRadius: 8,
                border: `1px solid ${palette.gold}`,
                color: palette.gold,
                fontWeight: 800,
                background: 'rgba(212,175,55,0.08)',
                boxShadow: cardShadow,
              }}
            >
              FREE ENTRY CHALLENGES →
            </Link>
          </div>
        </div>
      </section>

      <div className="home-stats">
        <div className="container">
          <div className="home-stats__inner">
            <div className="home-stat"><strong>{competitions.length}</strong><span>Competitions</span></div>
            <div className="home-stat"><strong>{liveComps.length}</strong><span>Live Now</span></div>
            <div className="home-stat"><strong>£18.4M</strong><span>Annual Prizes</span></div>
            <div className="home-stat"><strong>100%</strong><span>Cash Alternative</span></div>
          </div>
        </div>
      </div>

      <section className="competitions-section" id="competitions">
        <div className="container">
          <h2 className="section-title">🎯 LIVE COMPETITIONS</h2>
          {loading && <p className="loading">Loading competitions...</p>}
          {error && <p className="loading" style={{ color: '#f87171' }}>{error}</p>}
          {!loading && !error && (
            <>
              <div className="competitions-grid">
                {cardCompetitions.map((comp) => (
                  <CompetitionCard
                    key={comp.id}
                    competition={comp}
                    onEnter={(id) => {
                      const competition = competitions.find((item) => item.id === id);
                      if (competition) setSelectedComp(competition);
                    }}
                  />
                ))}
              </div>
              <Link
                to="/play"
                style={{
                  display: 'block',
                  marginTop: '1rem',
                  padding: '1.4rem',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(17,17,17,0.95) 100%)',
                  border: `1px solid ${palette.gold}`,
                  boxShadow: hoverShadow,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ color: palette.goldBright, fontWeight: 900, fontSize: '1.3rem', marginBottom: 6 }}>FREE ENTRY CHALLENGES →</div>
                    <div style={{ color: palette.textSoft }}>Play quick mini-games, unlock free entries, and boost your odds before the Sunday draw.</div>
                  </div>
                  <div style={{ color: palette.success, fontWeight: 800 }}>🎮 7 live challenges</div>
                </div>
              </Link>
            </>
          )}
          {comingSoon.length > 0 && (
            <p className="coming-soon-note">
              ⏳ <strong>{comingSoon.length} competition{comingSoon.length > 1 ? 's' : ''} coming soon</strong> — check back shortly!
            </p>
          )}
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
              <div className="trust-icon">📊</div>
              <h3>Transparent Odds</h3>
              <p>40% house margin shown publicly. No hidden fees or surprises</p>
            </div>
          </div>
        </div>
      </section>

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
