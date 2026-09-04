import { useState } from 'react';
import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ChessTournament from './pages/ChessTournament';
import Connect4Tournament from './pages/Connect4Tournament';
import Gallery from './pages/Gallery';
import MentalHealthSupport from './pages/MentalHealthSupport';
import Help from './pages/Help';
import TermsAndConditions from './pages/TermsAndConditions';
import InvestorSummary from './pages/InvestorSummary';
import MissionImpact from './pages/MissionImpact';

interface NavItem {
  to: string;
  label: string;
  highlight?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/competitions', label: 'Competitions', highlight: true },
  { to: '/tournaments/chess', label: 'Chess' },
  { to: '/tournaments/connect4', label: 'Connect 4' },
  { to: '/mental-health', label: 'Support' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/help', label: 'Help' },
  { to: '/terms', label: 'Terms' },
];

function navClass({ isActive }: { isActive: boolean }, highlight?: boolean): string {
  const classes = ['nav-link'];
  if (highlight) classes.push('nav-link--highlight');
  if (isActive) classes.push('nav-link--active');
  return classes.join(' ');
}

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">UAE Competition</div>
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            ☰
          </button>
          <nav className="app-nav app-nav--desktop-only" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={(state) => navClass(state, item.highlight)}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <nav id="mobile-nav" className={`app-nav app-nav--mobile ${menuOpen ? 'app-nav--open' : ''}`} aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={`mobile-${item.to}`}
                to={item.to}
                className={(state) => navClass(state, item.highlight)}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/competitions" element={<Dashboard />} />
        <Route path="/tournaments/chess" element={<ChessTournament />} />
        <Route path="/tournaments/connect4" element={<Connect4Tournament />} />
        <Route path="/chess-tournament" element={<Navigate to="/tournaments/chess" replace />} />
        <Route path="/connect4-tournament" element={<Navigate to="/tournaments/connect4" replace />} />
        <Route path="/mental-health" element={<MentalHealthSupport />} />
        <Route path="/wellbeing-support" element={<Navigate to="/mental-health" replace />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/help" element={<Help />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/investor-summary" element={<InvestorSummary />} />
        <Route path="/mission-impact" element={<MissionImpact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <footer className="app-footer">© {new Date().getFullYear()} UAE Competition Platform</footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
