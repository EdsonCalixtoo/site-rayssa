import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './components/AdminLoginPage';

function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar se já está autenticado
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (token) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('adminToken');
    }
    setIsAuthenticated(false);
  };

  return (
    <AuthProvider>
      <CartProvider>
        {isAuthenticated ? (
          <div className="relative">
            <AdminDashboard />
            <button
              onClick={handleLogout}
              className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors z-50 font-semibold"
            >
              Sair
            </button>
          </div>
        ) : (
          <AdminLoginPage onSuccess={handleLoginSuccess} />
        )}
      </CartProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>,
);

