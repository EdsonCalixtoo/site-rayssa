import { ShoppingCart, LayoutDashboard, User, Home, Package as PackageIcon } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

type HeaderProps = {
  onCartClick: () => void;
  onLogoClick: () => void;
  onDashboardClick: () => void;
  onClientAreaClick: () => void;
};

export default function Header({ onCartClick, onLogoClick, onDashboardClick, onClientAreaClick }: HeaderProps) {
  const { totalItems } = useCart();
  const { isAdmin } = useAuth();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <button
            onClick={onLogoClick}
            className="flex items-center space-x-3 group"
          >
            <Logo size="sm" />
            <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
              RT Pratas
            </span>
          </button>

          <nav className="flex items-center space-x-2">
            <button
              onClick={onLogoClick}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-teal-600 transition-all rounded-lg hover:bg-teal-50 font-semibold"
            >
              <Home className="w-5 h-5" />
              <span className="hidden md:inline">Home</span>
            </button>
            <button
              onClick={() => scrollToSection('products')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-teal-600 transition-all rounded-lg hover:bg-teal-50 font-semibold"
            >
              <PackageIcon className="w-5 h-5" />
              <span className="hidden md:inline">Produtos</span>
            </button>
            {isAdmin ? (
              <button
                onClick={onDashboardClick}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-teal-600 transition-all rounded-lg hover:bg-teal-50 font-semibold"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
            ) : (
              <button
                onClick={onClientAreaClick}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-800 hover:to-slate-900 transition-all border-2 border-slate-700 rounded-full hover:shadow-lg transform hover:-translate-y-0.5 font-semibold"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Área do Cliente</span>
              </button>
            )}
            <button
              onClick={onCartClick}
              className="relative p-3 text-gray-700 hover:text-teal-600 transition-all rounded-full hover:bg-teal-50 transform hover:scale-110"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center animate-pulse font-bold shadow-lg">
                  {totalItems}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}


