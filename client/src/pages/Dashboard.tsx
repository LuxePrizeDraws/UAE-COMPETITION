import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EntryModal from '../components/EntryModal';
import AdBanner from '../components/AdBanner';
import AdSidebar from '../components/AdSidebar';
import AffiliateWidget from '../components/AffiliateWidget';
import './Dashboard.css';

interface Competition {
  id: number;
  title: string;
  prize: string;
  prizeAmount: string;
  entryPrice: string;
  entriesSold: number;
  entriesNeeded: number;
  drawReadyPercent: number;
  timeRemaining: string;
  cashAlternative: string;
  type: 'cash' | 'vehicle' | 'package' | 'experience';
  icon: string;
  status: 'live' | 'coming-soon';
  details?: string[];
}

interface CompetitionTheme {
  accent: string;
  highlight: string;
  image: string;
}

// Keep this featured list in sync with the three-phase CSS ticker in Dashboard.css.
const SUPERCAR_NAMES = [
  'Porsche 911 Turbo S',
  'Lamborghini Huracán',
  'Ferrari 488 GTB',
];

function createSvgDataUri(svg: string) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const COMPETITION_THEMES: Record<Competition['type'], CompetitionTheme> = {
  cash: {
    accent: 'Cash stack spotlight',
    highlight: 'Instant cash jackpot',
    image: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 240">
        <rect width="420" height="240" rx="28" fill="#0f172a"/>
        <circle cx="335" cy="55" r="82" fill="#14532d" opacity="0.45"/>
        <g fill="none" stroke="#86efac" stroke-width="8" stroke-linejoin="round">
          <rect x="95" y="72" width="180" height="104" rx="18"/>
          <rect x="125" y="52" width="180" height="104" rx="18" opacity="0.9"/>
          <rect x="155" y="32" width="180" height="104" rx="18" opacity="0.75"/>
        </g>
        <circle cx="215" cy="104" r="22" fill="none" stroke="#dcfce7" stroke-width="8"/>
        <path d="M205 104h20M215 94v20" stroke="#dcfce7" stroke-width="8" stroke-linecap="round"/>
      </svg>
    `),
  },
  vehicle: {
    accent: 'Supercar collection',
    highlight: 'Supercar fleet showcase',
    image: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 240">
        <rect width="420" height="240" rx="28" fill="#1f2937"/>
        <circle cx="315" cy="55" r="90" fill="#f97316" opacity="0.35"/>
        <path d="M74 146h34l34-42c9-11 22-17 36-17h65c18 0 33 8 43 22l18 25h38c14 0 26 10 28 24H74c0-7 6-12 12-12Z" fill="none" stroke="#fde68a" stroke-width="9" stroke-linejoin="round"/>
        <circle cx="156" cy="163" r="24" fill="none" stroke="#fff7ed" stroke-width="9"/>
        <circle cx="286" cy="163" r="24" fill="none" stroke="#fff7ed" stroke-width="9"/>
        <path d="M166 104h88c15 0 28 7 36 19l9 14H132l16-21c4-8 11-12 18-12Z" fill="none" stroke="#fdba74" stroke-width="8" stroke-linejoin="round"/>
      </svg>
    `),
  },
  package: {
    accent: 'Business lifestyle suite',
    highlight: 'Luxury founder bundle',
    image: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 240">
        <rect width="420" height="240" rx="28" fill="#1f1637"/>
        <circle cx="322" cy="52" r="82" fill="#8b5cf6" opacity="0.35"/>
        <g fill="none" stroke="#ddd6fe" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">
          <rect x="118" y="88" width="184" height="104" rx="18"/>
          <path d="M168 88v-14c0-10 8-18 18-18h48c10 0 18 8 18 18v14"/>
          <path d="M118 132h184"/>
          <path d="M210 122h0"/>
          <path d="M188 140h44"/>
        </g>
        <path d="M88 62l10 22 22 10-22 10-10 22-10-22-22-10 22-10 10-22Z" fill="#f5d0fe" opacity="0.85"/>
      </svg>
    `),
  },
  experience: {
    accent: 'Luxury travel experience',
    highlight: 'Exclusive lifestyle escape',
    image: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 240">
        <rect width="420" height="240" rx="28" fill="#082f49"/>
        <circle cx="320" cy="58" r="84" fill="#06b6d4" opacity="0.3"/>
        <path d="M114 176h194" stroke="#cffafe" stroke-width="8" stroke-linecap="round"/>
        <path d="M140 176c0-36 26-68 58-68 26 0 46 18 54 44 8-12 22-20 38-20 24 0 44 18 48 44" fill="none" stroke="#a5f3fc" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M208 74c22 0 40 18 40 40" fill="none" stroke="#ecfeff" stroke-width="8" stroke-linecap="round"/>
      </svg>
    `),
  },
};

const COMPETITIONS: Competition[] = [
  {
    id: 1,
    title: 'Weekly £10K Cash Draw',
    prize: '£10,000 Cash',
    prizeAmount: '£10,000',
    entryPrice: '£1',
    entriesSold: 15625,
    entriesNeeded: 25000,
    drawReadyPercent: 62.5,
    timeRemaining: '2d 14h 36m',
    cashAlternative: '£10,000 cash',
    type: 'cash',
    icon: '💰',
    status: 'live',
  },
  {
    id: 2,
    title: 'Luxury Experience Package',
    prize: '£100K Luxury OR Cash',
    prizeAmount: '£100,000',
    entryPrice: '£5',
    entriesSold: 45000,
    entriesNeeded: 72000,
    drawReadyPercent: 62.5,
    timeRemaining: '5d 8h 12m',
    cashAlternative: '£100,000 cash',
    type: 'experience',
    icon: '✈️',
    status: 'live',
    details: ['5-star Dubai resort stay', 'Business class flights', 'Yacht experience', 'Fine dining package'],
  },
  {
    id: 3,
    title: '£50K Monthly Cash Draw',
    prize: '£50,000 Cash',
    prizeAmount: '£50,000',
    entryPrice: '£5',
    entriesSold: 56250,
    entriesNeeded: 90000,
    drawReadyPercent: 62.5,
    timeRemaining: '12d 6h 00m',
    cashAlternative: '£50,000 cash',
    type: 'cash',
    icon: '💵',
    status: 'live',
  },
  {
    id: 4,
    title: '£500K Quarterly Cash Draw',
    prize: '£500,000 Cash',
    prizeAmount: '£500,000',
    entryPrice: '£10',
    entriesSold: 187500,
    entriesNeeded: 300000,
    drawReadyPercent: 62.5,
    timeRemaining: '28d 0h 00m',
    cashAlternative: '£500,000 cash',
    type: 'cash',
    icon: '🏆',
    status: 'live',
  },
  {
    id: 5,
    title: '£5M Annual Grand Draw',
    prize: '£5,000,000 Cash',
    prizeAmount: '£5,000,000',
    entryPrice: '£25',
    entriesSold: 0,
    entriesNeeded: 1000000,
    drawReadyPercent: 0,
    timeRemaining: 'Coming Soon',
    cashAlternative: '£5,000,000 cash',
    type: 'cash',
    icon: '💎',
    status: 'coming-soon',
  },
  {
    id: 6,
    title: 'Weekly £10K Bonus Draw',
    prize: '£10,000 Cash',
    prizeAmount: '£10,000',
    entryPrice: '£1',
    entriesSold: 18750,
    entriesNeeded: 30000,
    drawReadyPercent: 62.5,
    timeRemaining: '6d 22h 15m',
    cashAlternative: '£10,000 cash',
    type: 'cash',
    icon: '🎯',
    status: 'live',
  },
  {
    id: 7,
    title: '3 Premium Supercars',
    prize: '3 Supercars OR £135K Cash',
    prizeAmount: '£135,000',
    entryPrice: '£10',
    entriesSold: 21094,
    entriesNeeded: 33750,
    drawReadyPercent: 62.5,
    timeRemaining: '18d 4h 30m',
    cashAlternative: '£135,000 cash',
    type: 'vehicle',
    icon: '🏎️',
    status: 'live',
    details: ['Porsche 911 Turbo S', 'Lamborghini Huracán', 'Ferrari 488 GTB', 'OR take £135K cash'],
  },
  {
    id: 8,
    title: 'UK Entrepreneur Dream',
    prize: 'Full Package OR £320K Cash',
    prizeAmount: '£320,000',
    entryPrice: '£25',
    entriesSold: 20000,
    entriesNeeded: 32000,
    drawReadyPercent: 62.5,
    timeRemaining: '28d 0h 00m',
    cashAlternative: '£320,000 cash',
    type: 'package',
    icon: '💼',
    status: 'live',
    details: ['£80K cash', 'Premium Supercar', 'Ltd Company setup', 'Digital business package', 'Luxury lifestyle bundle', 'OR take £320K cash'],
  },
];

type DrawStatus = 'ready' | 'almost' | 'in-progress' | 'coming-soon';

function getDrawStatus(percent: number): DrawStatus {
  if (percent >= 100) return 'ready';
  if (percent >= 75) return 'almost';
  if (percent >= 50) return 'in-progress';
  return 'coming-soon';
}

function getStatusLabel(status: DrawStatus) {
  switch (status) {
    case 'ready': return { label: '🟢 Draw Ready', color: '#22c55e' };
    case 'almost': return { label: '🟡 Almost Ready', color: '#eab308' };
    case 'in-progress': return { label: '🔵 In Progress', color: '#3b82f6' };
    case 'coming-soon': return { label: '⚪ Coming Soon', color: '#6b7280' };
  }
}

function getTypeColor(type: Competition['type']) {
  switch (type) {
    case 'cash': return '#22c55e';
    case 'vehicle': return '#f97316';
    case 'package': return '#8b5cf6';
    case 'experience': return '#06b6d4';
  }
}

function CountdownTimer({ timeRemaining }: { timeRemaining: string }) {
  return <span className="countdown">{timeRemaining}</span>;
}

function SupercarTicker({ variant = 'card' }: { variant?: 'card' | 'showcase' }) {
  return (
    <div className={`supercar-ticker supercar-ticker--${variant}`}>
      <span className="supercar-ticker__label">Featured prizes</span>
      <div className="supercar-ticker__window">
        {SUPERCAR_NAMES.map((name) => (
          <span key={name} className="supercar-ticker__item">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function parsePound(str: string): number {
  const match = str.replace(/,/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function CompetitionCard({ comp, onSelect, onEnter }: { comp: Competition; onSelect: (id: number) => void; onEnter: (id: number) => void }) {
  const [cashMode, setCashMode] = useState(false);
  const drawStatus = getDrawStatus(comp.drawReadyPercent);
  const statusInfo = getStatusLabel(drawStatus);
  const typeColor = getTypeColor(comp.type);
  const remaining = comp.entriesNeeded - comp.entriesSold;
  const theme = COMPETITION_THEMES[comp.type];

  return (
    <div
      className={`dash-card dash-card--${comp.type} ${comp.status === 'coming-soon' ? 'dash-card--dimmed' : ''}`}
      onClick={() => onSelect(comp.id)}
      style={{
        '--type-color': typeColor,
        '--card-image': theme.image,
      } as React.CSSProperties}
    >
      <div className="dash-card__header">
        <span className="dash-card__icon">{comp.icon}</span>
        <span className="dash-card__type" style={{ color: typeColor }}>{comp.type.toUpperCase()}</span>
        <span className="dash-card__status" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
      </div>

      <div className="dash-card__visual">
        <div className="dash-card__visual-badge">{theme.accent}</div>
        {comp.type === 'vehicle' && (
          <SupercarTicker />
        )}
      </div>

      <h3 className="dash-card__title">{comp.title}</h3>
      <p className="dash-card__highlight">{theme.highlight}</p>

      <div className="dash-card__prize">
        {cashMode ? (
          <span className="prize-alt">💰 {comp.cashAlternative}</span>
        ) : (
          <span className="prize-main">{comp.prize}</span>
        )}
      </div>

      <div className="dash-card__meta">
        <span>🎟️ {comp.entryPrice} / ticket</span>
        <span>⏰ <CountdownTimer timeRemaining={comp.timeRemaining} /></span>
      </div>

      <div className="dash-card__progress-section">
        <div className="progress-labels">
          <span>{comp.entriesSold.toLocaleString()} sold</span>
          <span>{comp.drawReadyPercent.toFixed(1)}%</span>
        </div>
        <div className="progress-track">
          <div
            className={`progress-fill progress-fill--${drawStatus}`}
            style={{ width: `${comp.drawReadyPercent}%` }}
          />
        </div>
        <div className="progress-sub">
          {remaining.toLocaleString()} entries remaining of {comp.entriesNeeded.toLocaleString()}
        </div>
      </div>

      <div className="dash-card__toggle">
        <span className={!cashMode ? 'toggle-active' : ''}>🏆 Prize</span>
        <button
          className={`toggle-switch ${cashMode ? 'toggle-switch--on' : ''}`}
          onClick={(e) => { e.stopPropagation(); setCashMode(!cashMode); }}
          aria-label="Toggle cash or prize"
        >
          <span className="toggle-knob" />
        </button>
        <span className={cashMode ? 'toggle-active' : ''}>💰 Cash</span>
      </div>

      {comp.details && (
        <ul className="dash-card__details">
          {comp.details.map((d, i) => <li key={i}>✓ {d}</li>)}
        </ul>
      )}

      <button
        className={`dash-card__cta dash-card__cta--${comp.type}`}
        disabled={comp.status === 'coming-soon'}
        onClick={(e) => { e.stopPropagation(); onEnter(comp.id); }}
      >
        {comp.status === 'coming-soon' ? '⏳ Coming Soon' : 'ENTER NOW →'}
      </button>
    </div>
  );
}

export default function Dashboard() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [entryCompId, setEntryCompId] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const liveCount = COMPETITIONS.filter(c => c.status === 'live').length;
  const comingSoonCount = COMPETITIONS.filter(c => c.status === 'coming-soon').length;

  const entryComp = entryCompId !== null
    ? (() => {
        const c = COMPETITIONS.find(x => x.id === entryCompId)!;
        const cashAmt = parsePound(c.cashAlternative);
        return {
          id: c.id,
          title: c.title,
          prizeType: c.type.toUpperCase(),
          prizeAmount: parsePound(c.prizeAmount),
          currency: 'GBP',
          cashAlternative: true,
          cashAlternativeAmount: cashAmt,
          entryPrice: parsePound(c.entryPrice),
          totalEntries: c.entriesNeeded,
          soldEntries: c.entriesSold,
          endsIn: c.timeRemaining,
          status: c.status,
          prizeIncludes: c.details,
        };
      })()
    : null;

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-header__inner">
          <div>
            <h1 className="dash-title">🏆 Competition Dashboard</h1>
            <p className="dash-subtitle">Live draw tracking — Cash or Prize — Your choice</p>
          </div>
          <Link to="/" className="back-link">← Home</Link>
        </div>
      </header>

      <section className="dash-stats">
        <div className="stat-card">
          <span className="stat-num">8</span>
          <span className="stat-label">Total Competitions</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{liveCount}</span>
          <span className="stat-label">Competitions Live</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{comingSoonCount}</span>
          <span className="stat-label">Coming Soon</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">£18.4M</span>
          <span className="stat-label">Annual Profit Potential</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">£1.53M</span>
          <span className="stat-label">Avg Monthly Revenue</span>
        </div>
      </section>

      {/* Ad banner between stats and grid */}
      <AdBanner placement="DASHBOARD_TOP" />

      <div className="draw-legend">
        <span className="legend-item"><span style={{ color: '#22c55e' }}>🟢</span> Draw Ready (100%)</span>
        <span className="legend-item"><span style={{ color: '#eab308' }}>🟡</span> Almost Ready (75–99%)</span>
        <span className="legend-item"><span style={{ color: '#3b82f6' }}>🔵</span> In Progress (50–74%)</span>
        <span className="legend-item"><span style={{ color: '#6b7280' }}>⚪</span> Coming Soon (0–49%)</span>
      </div>

      <section className="dashboard-showcase" aria-label="Supercar showcase">
        <span className="dashboard-showcase__eyebrow">Featured vehicle competition</span>
        <SupercarTicker variant="showcase" />
      </section>

      {loading ? (
        <div className="dash-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : (
        <div className="dash-grid">
          {COMPETITIONS.map(comp => (
            <CompetitionCard
              key={comp.id}
              comp={comp}
              onSelect={(id) => setSelectedId(selectedId === id ? null : id)}
              onEnter={(id) => setEntryCompId(id)}
            />
          ))}
        </div>
      )}

      {selectedId !== null && (() => {
        const comp = COMPETITIONS.find(c => c.id === selectedId);
        if (!comp) return null;
        return (
          <div className="detail-modal" onClick={() => setSelectedId(null)}>
            <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
              <button className="detail-close" onClick={() => setSelectedId(null)}>✕</button>
              <h2>{comp.icon} {comp.title}</h2>
              <p className="detail-prize">{comp.prize}</p>
              <div className="detail-grid">
                <div><strong>Entry Price</strong><span>{comp.entryPrice}</span></div>
                <div><strong>Draw Ready</strong><span>{comp.drawReadyPercent}%</span></div>
                <div><strong>Entries Sold</strong><span>{comp.entriesSold.toLocaleString()}</span></div>
                <div><strong>Entries Needed</strong><span>{comp.entriesNeeded.toLocaleString()}</span></div>
                <div><strong>Time Remaining</strong><span>{comp.timeRemaining}</span></div>
                <div><strong>Cash Alternative</strong><span>{comp.cashAlternative}</span></div>
              </div>
              {comp.details && (
                <div className="detail-includes">
                  <strong>Prize Includes:</strong>
                  <ul>{comp.details.map((d, i) => <li key={i}>✓ {d}</li>)}</ul>
                </div>
              )}
              <button
                className={`dash-card__cta dash-card__cta--${comp.type} detail-cta`}
                disabled={comp.status === 'coming-soon'}
                onClick={() => { setSelectedId(null); setEntryCompId(comp.id); }}
              >
                {comp.status === 'coming-soon' ? '⏳ Coming Soon' : 'ENTER NOW →'}
              </button>
            </div>
          </div>
        );
      })()}

      {entryComp && (
        <EntryModal competition={entryComp} onClose={() => setEntryCompId(null)} />
      )}

      {/* Affiliate widget below dashboard */}
      <div style={{ padding: '0 16px 32px' }}>
        <AffiliateWidget category="cash" title="Make the Most of Your Winnings 💰" />
        <AdBanner placement="DASHBOARD_FOOTER" />
      </div>
    </div>
  );
}
