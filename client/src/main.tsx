import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
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
          <Route path="terms" element={<TermsAndConditions />} />
          <Route path="mission" element={<MissionImpact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
