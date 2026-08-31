import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SupercarGallery from './pages/SupercarGallery';
import OrderConfirmed from './pages/OrderConfirmed';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="gallery/supercars" element={<SupercarGallery />} />
          <Route path="order-confirmed" element={<OrderConfirmed />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
