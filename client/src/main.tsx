import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import App from './App';
import Dashboard from './pages/Dashboard';
import './index.css';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'GBP' }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </PayPalScriptProvider>
  </React.StrictMode>
);
