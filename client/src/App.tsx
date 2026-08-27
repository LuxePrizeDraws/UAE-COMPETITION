import { Link } from 'react-router-dom';
import CompetitionCard from './components/CompetitionCard';
import './App.css';

const competitions = [
  {
    id: 1,
    title: 'WIN 10,000 AED CASH',
    description: 'Guaranteed Winner - Fair Live Draw',
    prizeType: 'CASH COMPETITION',
    prizeAmount: 10000,
    prizeDetails: { currency: 'AED', description: 'Cash Prize' },
    entryPrice: 1,
    totalEntries: 10000,
    soldEntries: 7248,
    endsIn: '2 days 14 hours',
    tags: ['Guaranteed Winner', 'Fair Live Draw', 'Transparent Odds'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
  {
    id: 2,
    title: 'WIN THE ULTIMATE UAE DREAM PACKAGE',
    description: 'Luxury Stay, Premium Experiences, Travel & Lifestyle',
    prizeType: 'LIFESTYLE PACKAGE',
    prizeAmount: 500000,
    prizeDetails: {
      currency: 'AED',
      description: 'Luxury Experience Package',
      includes: ['5-star luxury stay', 'Premium experiences', 'Travel package', 'Lifestyle experiences'],
    },
    entryPrice: 1,
    totalEntries: 1000000,
    soldEntries: 856000,
    endsIn: '5 days 14 hours',
    tags: ['Luxury Experience', 'Fair Live Draw', 'Transparent Odds'],
    profitMargin: '40% House, 60% Prize Pool (Transparent)',
    expectedWinners: 1,
  },
];

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">🏆 UAE Competition Platform</h1>
          <nav>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/dashboard" className="nav-link nav-link--highlight">📊 Live Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="competitions-grid">
        {competitions.map((comp) => (
          <CompetitionCard key={comp.id} competition={comp} />
        ))}
      </main>

      <footer className="app-footer">
        <p>© 2024 UAE Competition Platform | Fair, Transparent &amp; Compliant Draws</p>
      </footer>
    </div>
  );
}

export default App;
