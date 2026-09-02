import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import InvestorSummary from './pages/InvestorSummary';
import FeatureCentre from './pages/FeatureCentre';
import EntryOptions from './pages/EntryOptions';
import WellbeingSupport from './pages/WellbeingSupport';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="feature-centre" element={<FeatureCentre />} />
          <Route path="entry-options" element={<EntryOptions />} />
          <Route path="wellbeing-support" element={<WellbeingSupport />} />
          <Route path="investor-summary" element={<InvestorSummary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
