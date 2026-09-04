import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import InvestorSummary from './pages/InvestorSummary';
import FeatureCentre from './pages/FeatureCentre';
import GameChallenges from './pages/GameChallenges';
import EntryOptions from './pages/EntryOptions';
import WellbeingSupport from './pages/WellbeingSupport';
import ChessTournament from './pages/ChessTournament';
import Connect4Tournament from './pages/Connect4Tournament';
import Gallery from './pages/Gallery';
import MentalHealthSupport from './pages/MentalHealthSupport';
import Help from './pages/Help';
import TermsAndConditions from './pages/TermsAndConditions';
import MissionImpact from './pages/MissionImpact';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="competitions" element={<Dashboard />} />
          <Route path="feature-centre" element={<FeatureCentre />} />
          <Route path="game-challenges" element={<GameChallenges />} />
          <Route path="entry-options" element={<EntryOptions />} />
          <Route path="wellbeing-support" element={<WellbeingSupport />} />
          <Route path="investor-summary" element={<InvestorSummary />} />
          <Route path="chess-tournament" element={<ChessTournament />} />
          <Route path="connect4-tournament" element={<Connect4Tournament />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="mental-health" element={<MentalHealthSupport />} />
          <Route path="help" element={<Help />} />
          <Route path="terms" element={<TermsAndConditions />} />
          <Route path="mission" element={<MissionImpact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
