import { Link } from 'react-router-dom';
import CompetitionCard from './components/CompetitionCard';
import './App.css';

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
    tags: ['Business Package', 'Cash Alternative', 'Fair Live Draw'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 9,
    title: 'BIGGEST BUSINESS PRIZE: £100K Win Your Own Company + Start-up Grant',
    description: 'Our flagship launch prize: win a £100K company package with custom web + app build design support.',
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
    tags: ['Flagship Prize', 'Biggest Business Package', 'Coming Soon', 'Cash Alternative Available'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
];

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">
            <span className="logo-mark" aria-hidden="true">£</span>
            <span className="logo-text">UK Luxe Prize Draw</span>
          </h1>
          <nav>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/dashboard" className="nav-link nav-link--highlight">📊 Live Dashboard</Link>
          </nav>
        </div>
        <div className="mascot-banner" aria-live="polite">
          <span className="mascot-figure" aria-hidden="true">🕺</span>
          <p className="mascot-speech">welcome to a luxury poundland</p>
        </div>
      </header>

      <main className="competitions-grid">
        {competitions.map((comp) => (
          <CompetitionCard key={comp.id} competition={comp} />
        ))}
      </main>

      <footer className="app-footer">
        <p>© 2024 UK Luxe Prize Draw | Fair, Transparent &amp; Compliant Draws</p>
      </footer>
    </div>
  );
}

export default App;
