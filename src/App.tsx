import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';
import Logo from './components/Logo';
import Hero from './components/Hero';
import CategorySection from './components/CategorySection';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ModernCart from './components/ModernCart';
import ModernCheckout from './components/ModernCheckout';
import ModernClientArea from './components/ModernClientArea';
import About from './components/About';
import Testimonials from './components/Testimonials';
import ProductsPage from './pages/ProductsPage';
import { Product } from './lib/supabase';
import { ShoppingCart, User } from 'lucide-react';

type View = 'home' | 'cart' | 'checkout' | 'clientArea';

function AppContent() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { totalItems } = useCart();
  const { isLoggedIn } = useAuth();

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCheckoutSuccess = () => {
    setView('home');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleClientAreaClick = () => {
    setView('clientArea');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-6 right-6 z-40 flex gap-3">
        <button
          onClick={() => setView('cart')}
          className="relative p-4 bg-white hover:bg-teal-50 text-gray-700 hover:text-teal-600 transition-all rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 border-2 border-gray-200 hover:border-teal-400"
        >
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs w-7 h-7 rounded-full flex items-center justify-center animate-pulse font-bold shadow-lg">
              {totalItems}
            </span>
          )}
        </button>

        <button
          onClick={handleClientAreaClick}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 transition-all rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
        >
          <User className="w-5 h-5" />
          <span>{isLoggedIn ? 'Minha Conta' : 'Área do Cliente'}</span>
        </button>
      </div>

      {showSuccess && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-5 rounded-2xl shadow-2xl z-50 animate-fade-in border-2 border-teal-400">
          <p className="font-bold text-lg">Pedido realizado com sucesso!</p>
          <p className="text-sm text-teal-100">Entraremos em contato em breve.</p>
        </div>
      )}

      <Hero />
      <CategorySection />
      <ProductList onProductClick={handleProductClick} />
      <About />
      <Testimonials />

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {view === 'cart' && (
        <ModernCart
          onClose={() => setView('home')}
          onCheckout={() => setView('checkout')}
        />
      )}

      {view === 'checkout' && (
        <ModernCheckout
          onClose={() => setView('home')}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {view === 'clientArea' && (
        <ModernClientArea onClose={() => setView('home')} />
      )}

      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Logo size="md" />
              <span className="text-3xl font-bold bg-gradient-to-r from-teal-200 to-teal-400 bg-clip-text text-transparent">
                RT Pratas
              </span>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Joias exclusivas e elegantes por Rayssa Tayla
            </p>
          </div>
          <div className="border-t border-slate-700 pt-8">
            <p className="text-center text-gray-400">
              © 2025 RT Pratas. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/produtos" element={<ProductsPage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;


