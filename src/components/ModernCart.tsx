import { X, Minus, Plus, Trash2, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

type ModernCartProps = {
  onClose: () => void;
  onCheckout: () => void;
};

export default function ModernCart({ onClose, onCheckout }: ModernCartProps) {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-slide-up overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500 p-2 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Meu Carrinho</h2>
              <p className="text-slate-300 text-sm">{cart.length} {cart.length === 1 ? 'item' : 'itens'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-br from-teal-100 to-teal-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Seu carrinho está vazio</h3>
              <p className="text-gray-600 mb-6">Adicione produtos incríveis da nossa coleção</p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg font-semibold"
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-gradient-to-br from-white to-teal-50/30 rounded-2xl p-5 shadow-lg border-2 border-gray-100 hover:border-teal-200 transition-all group"
                >
                  <div className="flex gap-5">
                    <div className="relative">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-28 h-28 object-cover rounded-xl border-2 border-gray-200 group-hover:border-teal-300 transition-all"
                      />
                      <div className="absolute -top-2 -right-2 bg-teal-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                        {item.quantity}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-teal-600 transition-colors">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          R$ {item.product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / unidade
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-white rounded-xl p-2 shadow-md border border-gray-200">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-teal-100 rounded-lg transition-colors text-gray-700 hover:text-teal-600"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-8 h-8 flex items-center justify-center hover:bg-teal-100 rounded-lg transition-colors text-gray-700 hover:text-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <p className="text-2xl font-bold text-teal-600">
                            R$ {(item.product.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t-2 border-gray-200 bg-gradient-to-br from-slate-50 to-white px-8 py-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-100 to-teal-50 rounded-2xl border-2 border-teal-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-teal-600" />
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                </div>
                <span className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                  R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button
                onClick={onCheckout}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-5 rounded-2xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-bold text-lg flex items-center justify-center gap-3"
              >
                Finalizar Compra
                <ArrowRight className="w-6 h-6" />
              </button>

              <button
                onClick={onClose}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-2xl hover:bg-gray-50 transition-all font-semibold"
              >
                Continuar Comprando
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
