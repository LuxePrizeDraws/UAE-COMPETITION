import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import './index.css';
import Dashboard from './pages/Dashboard';
import DrawsPage from './pages/DrawsPage';
import Home from './pages/Home';
import HowItWorksPage from './pages/HowItWorksPage';
import PayPage from './pages/PayPage';
import PlayPage from './pages/PlayPage';
import WinnersPage from './pages/WinnersPage';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="play" element={<PlayPage />} />
          <Route path="pay" element={<PayPage />} />
          <Route path="draws" element={<DrawsPage />} />
          <Route path="winners" element={<WinnersPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
