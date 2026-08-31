import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import MentalHealthChatbot from './components/MentalHealthChatbot';
import './App.css';

function App() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isPostal = location.pathname === '/postal-entry';
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <Link to="/" className="logo">
            💎 LuxePrize
          </Link>
          <nav>
            <Link to="/" className={`nav-link${!isDashboard && !isPostal ? ' nav-link--active' : ''}`}>Home</Link>
            <Link to="/postal-entry" className={`nav-link${isPostal ? ' nav-link--active' : ''}`}>Free Entry</Link>
            <Link to="/dashboard" className={`nav-link${isDashboard ? ' nav-link--highlight' : ''}`}>Dashboard</Link>
          </nav>
        </div>
      </header>
      <Outlet />

      {/* Floating Wellbeing Button */}
      <button
        className="chatbot-fab"
        onClick={() => setShowChatbot(true)}
        aria-label="Open wellbeing support chat"
        title="Wellbeing Support"
      >
        🧠
      </button>

      {showChatbot && <MentalHealthChatbot onClose={() => setShowChatbot(false)} />}
    </div>
  );
}

export default App;
