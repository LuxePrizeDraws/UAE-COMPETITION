import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CompetitionCard from './components/CompetitionCard';
import './App.css';

const WORLD_RECORD_TARGET_USD = 10_000_001;

const WINNER_FLASH_FEED = [
  { name: 'Emma R.', prize: '£10,000 Cash', nationality: 'United Kingdom', flag: '🇬🇧' },
  { name: 'Liam K.', prize: '£2,500 Fast Cash Sprint', nationality: 'Ireland', flag: '🇮🇪' },
  { name: 'Zara H.', prize: 'Luxury Experience Package', nationality: 'United Kingdom', flag: '🇬🇧' },
  { name: 'Noah S.', prize: '£900 Micro Cash Flash', nationality: 'Scotland', flag: '🏴' },
];

const competitions = [
  {
    id: 1,
    title: 'Weekly £10K Cash Draw',
    description: 'Guaranteed Winner – Fair Live Draw every week',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 10000,
    prizeDetails: { currency: 'GBP', description: 'Cash Prize' },
    entryPrice: 1,
    totalEntries: 25000,
    soldEntries: 15625,
    endsIn: '2 days 14 hours',
    status: 'live',
    tags: ['Guaranteed Winner', 'Fair Live Draw', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 2,
    title: 'Luxury Experience OR £100K Cash',
    description: 'Ultimate luxury travel & lifestyle prize. Cash or prize – your choice.',
    prizeType: 'EXPERIENCE PACKAGE',
    prizeAmount: 100000,
    prizeDetails: {
      currency: 'GBP',
      description: 'Luxury Experience Package',
      includes: ['5-star luxury resort stay', 'Business class flights', 'Yacht experience', 'Fine dining package'],
    },
    entryPrice: 5,
    totalEntries: 72000,
    soldEntries: 45000,
    endsIn: '5 days 8 hours',
    status: 'live',
    tags: ['Luxury Experience', 'Fair Live Draw', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 7,
    title: '3 Premium Supercars OR £135K Cash',
    description: 'Win 3 luxury supercars or take £135K cash instead. CASH OR CARS – YOU CHOOSE!',
    prizeType: 'VEHICLE COMPETITION',
    prizeAmount: 135000,
    prizeDetails: {
      currency: 'GBP',
      description: '3 Premium Supercars',
      includes: ['Porsche 911 Turbo S', 'Lamborghini Huracán', 'Ferrari 488 GTB', 'OR take £135,000 cash'],
    },
    entryPrice: 10,
    totalEntries: 33750,
    soldEntries: 21094,
    endsIn: '18 days 4 hours',
    status: 'live',
    tags: ['Supercar Draw', 'Cash or Cars', 'Fair Live Draw'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 8,
    title: 'UK Entrepreneur Dream OR £320K Cash',
    description: 'Full business & lifestyle package or £320K cash. Your choice.',
    prizeType: 'BUSINESS PACKAGE',
    prizeAmount: 320000,
    prizeDetails: {
      currency: 'GBP',
      description: 'Full Entrepreneur Package',
      includes: ['£80K cash lump sum', 'Premium Supercar', 'Ltd Company setup', 'Digital business package', 'OR take £320K cash'],
    },
    entryPrice: 25,
    totalEntries: 32000,
    soldEntries: 20000,
    endsIn: '28 days',
    status: 'live',
    tags: ['Business Package', 'Cash Alternative', 'Fair Live Draw'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 9,
    title: 'BIGGEST BUSINESS PRIZE: £100K Win Your Own Company + Start-up Grant',
    description: 'Our flagship launch prize ambition: a £100K company package with custom web + app build design support, subject to terms.',
    prizeType: 'FLAGSHIP MEGA BUSINESS DRAW',
    prizeAmount: 100000,
    prizeDetails: {
      currency: 'GBP',
      description: 'Business launch package',
      includes: ['Company launch support', 'Start-up grant package', 'Custom web build design', 'Custom app build design', 'OR take £100,000 cash'],
    },
    entryPrice: 1,
    totalEntries: 400000,
    soldEntries: 0,
    endsIn: 'Coming Soon',
    status: 'coming-soon',
    tags: ['Flagship Prize', 'Biggest Business Package', 'Coming Soon', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
    recordGoalUSD: WORLD_RECORD_TARGET_USD,
    recordCurrentUSD: 0,
    recordUnlockText: '$100M community mega draw',
    drawStructure: {
      model: 'Overlapping fixed draw windows',
      flagshipSchedule: 'Monthly flagship draw (fixed date/time)',
      weeklyDraws: 'Weekly fixed draws every Friday',
      dailyDraws: 'Daily mini draws at fixed cut-off',
      instantWinAllocation: 'Up to 8% of prize fund, pre-structured and capped',
      instantWinStatus: 'Coming soon',
    },
  },
  {
    id: 10,
    title: 'LIVE WORLD RECORD CHASE: £1 Entry Cash Pot',
    description: 'A live global £1-entry campaign targeting a record milestone, subject to eligibility, terms, and legal approvals.',
    prizeType: 'LIVE CASH CHALLENGE',
    prizeAmount: 100000000,
    prizeDetails: {
      currency: 'USD TARGET',
      description: 'Record-breaking cash campaign',
      includes: ['£1 ticket entry', 'Global live participation', 'Transparent milestone tracker', 'Target: unlock $100M mega draw'],
    },
    entryPrice: 1,
    totalEntries: 120000000,
    soldEntries: 6400000,
    endsIn: '37 days',
    status: 'live',
    tags: ['Live Competition', 'Record Chase', '£1 Entry', 'Community Unlock'],
    profitMargin: 'Target campaign model with transparent milestone tracking',
    expectedWinners: 1,
    recordGoalUSD: WORLD_RECORD_TARGET_USD,
    recordCurrentUSD: 6400000,
    recordUnlockText: '$100M community mega draw',
    drawStructure: {
      model: 'Overlapping fixed draw windows',
      flagshipSchedule: 'Quarterly flagship draw with audited cut-off',
      weeklyDraws: 'Weekly record-chase supporting draws',
      dailyDraws: 'Daily £1 micro draws with fixed schedule',
      instantWinAllocation: 'Minority instant wins capped at 5% of total prize pool',
      instantWinStatus: 'Coming soon',
    },
  },
  {
    id: 11,
    title: 'Fast Cash Sprint Draw (50p Entry)',
    description: 'Lower-cost rapid draw with fast payout cycle for frequent winners.',
    prizeType: 'FAST CASH DRAW',
    prizeAmount: 2500,
    prizeDetails: {
      currency: 'GBP',
      description: 'Rapid cash payout draw',
      includes: ['50p ticket', 'High-frequency fixed draw windows', 'Fast payout target after confirmation'],
    },
    entryPrice: 0.5,
    totalEntries: 10000,
    soldEntries: 6400,
    endsIn: '14 hours',
    status: 'live',
    tags: ['50p Entry', 'Fast Draw', 'Quick Payout'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 12,
    title: 'Micro Cash Flash Draw (20p Entry)',
    description: 'Ultra-low entry micro draw designed for very frequent payout rounds.',
    prizeType: 'MICRO CASH DRAW',
    prizeAmount: 900,
    prizeDetails: {
      currency: 'GBP',
      description: 'Micro fast-payout cash draw',
      includes: ['20p ticket', 'Short draw countdowns', 'Frequent winner announcements'],
    },
    entryPrice: 0.2,
    totalEntries: 7500,
    soldEntries: 4200,
    endsIn: '6 hours',
    status: 'live',
    tags: ['20p Entry', 'Micro Draw', 'Fast Payout'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
];

function App() {
  const [winnerIndex, setWinnerIndex] = useState(0);
  const [showWinnerFlash, setShowWinnerFlash] = useState(true);

  useEffect(() => {
    const cycleTimer = window.setInterval(() => {
      setWinnerIndex((current) => (current + 1) % WINNER_FLASH_FEED.length);
      setShowWinnerFlash(true);
      window.setTimeout(() => setShowWinnerFlash(false), 3200);
    }, 7000);

    return () => window.clearInterval(cycleTimer);
  }, []);

  const activeWinner = WINNER_FLASH_FEED[winnerIndex];

  return (
    <div className="app">
      {showWinnerFlash && (
        <aside className="winner-flash" role="status" aria-live="polite">
          <div className="winner-flash__title">🏆 Winner League Flash</div>
          <div className="winner-flash__name">{activeWinner.name}</div>
          <div className="winner-flash__meta">{activeWinner.prize}</div>
          <div className="winner-flash__flag" aria-label={activeWinner.nationality}>{activeWinner.flag}</div>
        </aside>
      )}
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">
            <span className="logo-mark" aria-hidden="true">£</span>
            <span className="logo-text">UK Luxe Prize Draw</span>
          </h1>
          <nav>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/signup" className="nav-link">Sign Up</Link>
            <Link to="/dashboard" className="nav-link nav-link--highlight">📊 Live Dashboard</Link>
          </nav>
        </div>
        <div className="mascot-banner" aria-live="polite">
          <span className="mascot-figure" aria-hidden="true">🕺</span>
          <p className="mascot-speech">welcome to a luxury poundland</p>
        </div>
        <p className="trust-banner">
          Trusted launch mode: secure checkout, transparent draw maths, clear terms, and a no-purchase route for fair participation.
        </p>
        <p className="trust-banner">
          Profit-use commitment: profits are reinvested into community development initiatives that support UK economic growth in the right direction.
        </p>
        <div className="impact-badge" role="note" aria-label="Mental health impact commitment">
          🧠 Mental Health Awareness: we aim to fund practical support for mental health issues affecting communities across our nation.
        </div>
        <div className="aim-advert" role="note" aria-label="Launch ambition">
          🚀 Mission target: aim to exceed the reported $10M in-app benchmark by 10x, subject to compliance approvals and published terms.
        </div>
      </header>

      <main className="competitions-grid">
        {competitions.map((comp) => (
          <CompetitionCard key={comp.id} competition={comp} />
        ))}
      </main>

      <footer className="app-footer">
        <p>© 2024 UK Luxe Prize Draw | Fair, Transparent &amp; Compliant Draws | Tax-free cash prizes where legally applicable</p>
        <p className="app-footer-credit">Designed by GST LLC • Dubai, UAE</p>
      </footer>
    </div>
  );
}

export default App;
