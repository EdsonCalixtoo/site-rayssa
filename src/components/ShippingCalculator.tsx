import { useState } from 'react';
import { Truck, AlertCircle, Loader } from 'lucide-react';
import { calculateShipping, ShippingQuote, ShippingData } from '../lib/melhorenvio';
import { Product } from '../lib/supabase';

interface ShippingCalculatorProps {
  zipCode: string;
  cartItems: { product: Product; quantity: number }[];
  onShippingSelected: (option: ShippingQuote, cost: number) => void;
  onLoading: (loading: boolean) => void;
}

export default function ShippingCalculator({
  zipCode,
  cartItems,
  onShippingSelected,
  onLoading,
}: ShippingCalculatorProps) {
  const [shippingOptions, setShippingOptions] = useState<ShippingQuote[]>([]);
  const [selectedOption, setSelectedOption] = useState<ShippingQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const calculateFreight = async () => {
    if (!zipCode || zipCode.replace(/\D/g, '').length !== 8) {
      setError('CEP inválido');
      return;
    }

    setLoading(true);
    setError('');
    onLoading(true);

    try {
      // Preparar dados para cálculo de frete
      const shippingData: ShippingData = {
        to: {
          zipcode: zipCode.replace(/\D/g, ''),
          state: '', // Será preenchido automaticamente pelo CEP
          city: '',
          address: '',
          number: '',
        },
        products: cartItems.map((item) => ({
          id: item.product.id,
          width: item.product.width || 10,
          height: item.product.height || 10,
          length: item.product.length || 10,
          weight: item.product.weight || 0.1,
          quantity: item.quantity,
          insurance_value: item.product.price * item.quantity,
          description: item.product.name,
        })),
      };

      const quotes = await calculateShipping(shippingData);
      setShippingOptions(quotes);

      if (quotes.length === 0) {
        setError('Nenhuma opção de entrega disponível para este CEP');
      }
    } catch (err) {
      console.error('Erro ao calcular frete:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao calcular frete. Tente novamente.'
      );
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  const handleSelectOption = (option: ShippingQuote) => {
    setSelectedOption(option);
    onShippingSelected(option, option.price);
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <button
          onClick={calculateFreight}
          disabled={loading || !zipCode}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 transition-all font-semibold"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Calculando frete...
            </>
          ) : (
            <>
              <Truck className="w-5 h-5" />
              Calcular Frete
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {shippingOptions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700 mb-3">
            Opções de Entrega
          </h3>
          {shippingOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedOption?.id === option.id
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-200 bg-white hover:border-teal-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {option.logo && (
                    <img
                      src={option.logo}
                      alt={option.name}
                      className="w-6 h-6 object-contain"
                    />
                  )}
                  <span className="font-semibold text-gray-900">{option.name}</span>
                </div>
                <span className="font-bold text-teal-600">
                  R$ {option.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-xs text-gray-600">
                <p>Entrega em {option.deadline} dia(s) úteis</p>
                {option.includes && option.includes.length > 0 && (
                  <p className="mt-1">Inclui: {option.includes.join(', ')}</p>
                )}
              </div>
              {selectedOption?.id === option.id && (
                <div className="mt-3 pt-3 border-t border-teal-200 flex items-center gap-2 text-teal-600">
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-semibold">Selecionado</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {!loading && shippingOptions.length === 0 && !error && (
        <p className="text-center text-gray-500 text-sm py-4">
          Digite um CEP válido e clique em "Calcular Frete"
        </p>
      )}
    </div>
  );
}
