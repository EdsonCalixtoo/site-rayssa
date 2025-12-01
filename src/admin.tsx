import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import AdminDashboard from './pages/AdminDashboard';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <AdminDashboard />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
);
