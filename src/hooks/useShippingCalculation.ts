import { useState, useCallback } from 'react';
import { calculateShipping as calculateMelhorEnvioShipping, ShippingQuote, ShippingData } from '../lib/melhorenvio';
import { Product } from '../lib/supabase';

export function useShippingCalculation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [shippingOptions, setShippingOptions] = useState<ShippingQuote[]>([]);

  const calculateShipping = useCallback(
    async (zipCode: string, cartItems: { product: Product; quantity: number }[]) => {
      if (!zipCode || zipCode.replace(/\D/g, '').length !== 8) {
        setError('CEP inválido');
        return null;
      }

      setLoading(true);
      setError('');

      try {
        // Validar se tem produtos no carrinho
        if (cartItems.length === 0) {
          setError('Nenhum produto no carrinho');
          return null;
        }

        // Preparar dados para cálculo
        const shippingData: ShippingData = {
          to: {
            zipcode: zipCode.replace(/\D/g, ''),
            state: '',
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

        const quotes = await calculateMelhorEnvioShipping(shippingData);
        setShippingOptions(quotes);

        if (quotes.length === 0) {
          setError('Nenhuma opção de entrega disponível para este CEP');
          return null;
        }

        return quotes;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Erro ao calcular frete. Tente novamente.';
        setError(errorMessage);
        console.error('Erro ao calcular frete:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const clearOptions = useCallback(() => {
    setShippingOptions([]);
  }, []);

  return {
    loading,
    error,
    shippingOptions,
    calculateShipping,
    clearError,
    clearOptions,
  };
}
