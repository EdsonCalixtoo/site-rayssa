import { ShoppingCart } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

type ProductCardProps = {
  product: Product;
  onClick: () => void;
};

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        {product.is_featured && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2 rounded-full text-xs font-bold tracking-wider shadow-xl">
            DESTAQUE
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-full hover:from-teal-600 hover:to-teal-700 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 shadow-lg"
          >
            <ShoppingCart className="w-5 h-5" />
            {product.stock === 0 ? 'Esgotado' : 'Adicionar'}
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-teal-600 uppercase tracking-widest font-bold">
            {product.category === 'ring' && 'Anel'}
            {product.category === 'necklace' && 'Colar'}
            {product.category === 'bracelet' && 'Pulseira'}
            {product.category === 'earrings' && 'Brincos'}
          </p>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-semibold">
              {product.stock} restantes
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight group-hover:text-teal-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
            R$ {product.price.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
