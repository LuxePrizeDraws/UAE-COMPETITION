import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LegendsLeague from './pages/LegendsLeague';
import DreamAppPrize from './pages/DreamAppPrize';
import SupercarGallery from './pages/SupercarGallery';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="legends-league" element={<LegendsLeague />} />
          <Route path="prize/dream-app" element={<DreamAppPrize />} />
          <Route path="supercar-gallery" element={<SupercarGallery />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
