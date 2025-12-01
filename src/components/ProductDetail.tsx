import { X, ShoppingCart, Package, Shield, Award, Star, Sparkles, Check } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

type ProductDetailProps = {
  product: Product;
  onClose: () => void;
};

export default function ProductDetail({ product, onClose }: ProductDetailProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-slide-up">
        <div className="sticky top-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-teal-400" />
            <h2 className="text-2xl font-bold text-white tracking-wide">Detalhes Exclusivos</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-all text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-0 overflow-y-auto max-h-[calc(95vh-88px)]">
          <div className="relative aspect-square bg-gradient-to-br from-slate-100 via-teal-50 to-slate-100 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent"></div>
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
            />
            {product.is_featured && (
              <div className="absolute top-8 right-8 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-full text-sm font-bold tracking-wider shadow-2xl flex items-center gap-2">
                <Star className="w-5 h-5 fill-white" />
                DESTAQUE
              </div>
            )}
            <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-teal-400 text-teal-400" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">4.9/5.0 (127 avaliações)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col p-10 bg-gradient-to-br from-white to-teal-50/30">
            <div className="inline-block mb-4">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-100 px-4 py-2 rounded-full">
                {product.category === 'ring' && 'Anel Premium'}
                {product.category === 'necklace' && 'Colar Premium'}
                {product.category === 'bracelet' && 'Pulseira Premium'}
                {product.category === 'earrings' && 'Brincos Premium'}
              </span>
            </div>

            <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="mb-8">
              <div className="flex items-baseline gap-3 mb-2">
                <p className="text-6xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                  R$ {product.price.toLocaleString('pt-BR')}
                </p>
              </div>
              <p className="text-sm text-gray-500">Parcelamento disponível em até 12x sem juros</p>
            </div>

            <p className="text-gray-700 mb-8 leading-relaxed text-lg">
              {product.description}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-lg border-2 border-teal-100 hover:shadow-xl transition-shadow">
                <Package className="w-10 h-10 text-teal-600 mx-auto mb-3" />
                <p className="text-xs text-gray-700 font-bold">Frete Grátis</p>
                <p className="text-xs text-gray-500 mt-1">Brasil inteiro</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-lg border-2 border-teal-100 hover:shadow-xl transition-shadow">
                <Shield className="w-10 h-10 text-teal-600 mx-auto mb-3" />
                <p className="text-xs text-gray-700 font-bold">Garantia</p>
                <p className="text-xs text-gray-500 mt-1">Vitalícia</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-white to-teal-50 rounded-2xl shadow-lg border-2 border-teal-100 hover:shadow-xl transition-shadow">
                <Award className="w-10 h-10 text-teal-600 mx-auto mb-3" />
                <p className="text-xs text-gray-700 font-bold">Certificado</p>
                <p className="text-xs text-gray-500 mt-1">Autenticidade</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 mb-8 border-2 border-slate-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Características Premium
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Ouro 18k certificado
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Pedras preciosas selecionadas
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Acabamento artesanal
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Embalagem de luxo inclusa
                </li>
              </ul>
            </div>

            {product.stock > 0 ? (
              <div className="space-y-4">
                {product.stock <= 5 && (
                  <div className="bg-gradient-to-r from-teal-100 to-teal-50 border-2 border-teal-300 text-teal-800 px-6 py-4 rounded-2xl text-center font-bold flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Apenas {product.stock} unidades disponíveis
                  </div>
                )}
                <button
                  onClick={handleAddToCart}
                  disabled={added}
                  className={`w-full py-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg font-bold tracking-wide shadow-xl ${
                    added
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 transform hover:scale-105 hover:shadow-2xl'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-6 h-6" />
                      Adicionado ao Carrinho
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-6 h-6" />
                      Adicionar ao Carrinho
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-red-100 to-red-50 border-2 border-red-300 text-red-700 py-6 rounded-2xl text-center font-bold text-lg">
                Produto Esgotado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

