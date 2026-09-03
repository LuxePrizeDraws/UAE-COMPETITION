import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EntryModal from '../components/EntryModal';
import { useButtonSound } from '../hooks/useButtonSound';
import AdBanner from '../components/AdBanner';
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
    details: ['Porsche 911 Turbo', 'Lamborghini Huracán', 'Ferrari 488', 'OR take £135K cash'],
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

function parsePound(str: string): number {
  const match = str.replace(/,/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function CompetitionCard({ comp, onSelect, onEnter }: { comp: Competition; onSelect: (id: number) => void; onEnter: (id: number) => void }) {
  const [cashMode, setCashMode] = useState(false);
  const playSound = useButtonSound();
  const drawStatus = getDrawStatus(comp.drawReadyPercent);
  const statusInfo = getStatusLabel(drawStatus);
  const typeColor = getTypeColor(comp.type);
  const remaining = comp.entriesNeeded - comp.entriesSold;

  return (
    <div
      className={`dash-card dash-card--${comp.type} ${comp.status === 'coming-soon' ? 'dash-card--dimmed' : ''}`}
      onClick={() => onSelect(comp.id)}
      style={{ '--type-color': typeColor } as React.CSSProperties}
    >
      <div className="dash-card__header">
        <span className="dash-card__icon">{comp.icon}</span>
        <span className="dash-card__type" style={{ color: typeColor }}>{comp.type.toUpperCase()}</span>
        <span className="dash-card__status" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
      </div>

      <h3 className="dash-card__title">{comp.title}</h3>

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
        className="dash-card__cta btn-interactive"
        disabled={comp.status === 'coming-soon'}
        onMouseDown={playSound}
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
  const playSound = useButtonSound();

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
                className="dash-card__cta detail-cta btn-interactive"
                disabled={comp.status === 'coming-soon'}
                onMouseDown={playSound}
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
