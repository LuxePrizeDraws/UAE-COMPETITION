import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
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
          <Route path="competitions" element={<Dashboard />} />
          <Route path="dashboard" element={<Navigate to="/competitions" replace />} />
          <Route path="investor-summary" element={<Navigate to="/mission" replace />} />
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