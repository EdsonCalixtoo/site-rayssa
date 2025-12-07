import { X, CreditCard, QrCode, Truck, Lock, Shield, Check, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ShippingCalculator from './ShippingCalculator';

import { ShippingQuote } from '../lib/melhorenvio';

type ModernCheckoutProps = {
  onClose: () => void;
  onSuccess: () => void;
};

interface ShippingCarrier extends ShippingQuote {
  code?: string;
}

export default function ModernCheckout({ onClose, onSuccess }: ModernCheckoutProps) {
  const { cart, totalPrice, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [installments, setInstallments] = useState(1);
  const [shippingCost, setShippingCost] = useState(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<ShippingCarrier | null>(null);
  const [editingAddress, setEditingAddress] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zip_code: '',
    address: '',
    number: '',
    complement: '',
    city: '',
    state: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVV: '',
  });

  // Carregar dados do usuário logado
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email && isLoggedIn) {
          setUserEmail(session.user.email);
          setFormData(prev => ({ ...prev, email: session.user.email }));
          
          // Carregar dados do cliente
          const { data: customer } = await supabase
            .from('customers')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (customer) {
            const newFormData = {
              name: customer.name || '',
              email: session.user.email,
              phone: customer.phone || '',
              zip_code: customer.zip_code || '',
              address: customer.address || '',
              number: customer.number || '',
              complement: customer.complement || '',
              city: customer.city || '',
              state: customer.state || '',
              cardNumber: '',
              cardName: '',
              cardExpiry: '',
              cardCVV: '',
            };
            setFormData(newFormData);
            
            // Calcular frete automaticamente se tiver CEP
            if (customer.zip_code) {
              await calculateShipping(customer.zip_code);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [isLoggedIn]);

  const calculateShipping = async (zipCode: string) => {
    if (zipCode.replace(/\D/g, '').length !== 8) {
      console.warn('❌ CEP inválido:', zipCode);
      return;
    }

    console.log('🔄 Iniciando cálculo de frete para CEP:', zipCode);
    setCalculatingShipping(true);
    setCarriers([]);
    setSelectedCarrier(null);

    try {
      const totalWeight = cart.reduce((sum, item) => {
        return sum + ((item.product.weight || 0.1) * item.quantity);
      }, 0);

      let totalHeight = 0, totalWidth = 0, totalLength = 0;
      cart.forEach((item) => {
        totalHeight = Math.max(totalHeight, item.product.height || 10);
        totalWidth = Math.max(totalWidth, item.product.width || 10);
        totalLength += item.product.length || 10;
      });

      // Validar dimensões mínimas do Melhor Envio
      const weight = Math.max(0.01, totalWeight);
      const height = Math.max(2, totalHeight);
      const width = Math.max(11, totalWidth);
      const length = Math.max(16, totalLength);

      console.log('📦 Dimensões do pedido:', { weight, height, width, length });
      console.log('🛒 Itens do carrinho:', cart.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        weight: item.product.weight,
        height: item.product.height,
        width: item.product.width,
        length: item.product.length,
      })));

      console.log('📍 Endereço de entrega:', {
        zipcode: zipCode.replace(/\D/g, ''),
        state: formData.state,
        city: formData.city,
        address: formData.address,
      });

      const requestBody = {
        to: {
          zipcode: zipCode.replace(/\D/g, ''),
          state: formData.state || '',
          city: formData.city || '',
          address: formData.address || '',
          number: formData.number || '',
          complement: formData.complement,
        },
        products: cart.map((item) => ({
          id: item.product.id,
          width: Math.max(11, item.product.width || 10),
          height: Math.max(2, item.product.height || 10),
          length: Math.max(16, item.product.length || 10),
          weight: Math.max(0.01, item.product.weight || 0.1),
          quantity: item.quantity,
          insurance_value: item.product.price * item.quantity,
          description: item.product.name,
        })),
      };

      console.log('📡 Enviando para Edge Function:', requestBody);

      // Chamar Edge Function do Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/calculate-shipping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro HTTP:', response.status, errorText);
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Resposta da Edge Function:', data);

      if (data.error || !data.carriers || data.carriers.length === 0) {
        console.warn('⚠️ Nenhuma opção de frete:', data.error || 'Array vazio');
        throw new Error('Nenhuma opção de frete disponível para este CEP');
      }

      const carriers: ShippingCarrier[] = data.carriers.map((q: any) => ({
        id: q.id || q.code,
        name: q.name,
        code: q.code || q.id,
        price: typeof q.price === 'string' ? parseFloat(q.price) : q.price,
        deadline: typeof q.deadline === 'string' ? parseInt(q.deadline) : q.deadline,
        insurance_value: q.insurance_value || 0,
        includes: q.includes || [],
        logo: q.logo || '',
      }));
      
      console.log('✅ Carriers para exibir:', carriers);
      setCarriers(carriers);
      const cheapest = carriers[0];
      setSelectedCarrier(cheapest);
      setShippingCost(cheapest.price);
      
      console.log('✅ Frete mais barato selecionado:', cheapest);
    } catch (error) {
      console.error('❌ Erro ao calcular frete:', error);
      console.error('📋 Stack completo:', error instanceof Error ? error.stack : '');
      alert(`Erro ao calcular frete: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setCalculatingShipping(false);
    }
  };

  const handleZipCodeChange = async (zipCode: string) => {
    setFormData({ ...formData, zip_code: zipCode });

    if (zipCode.replace(/\D/g, '').length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${zipCode.replace(/\D/g, '')}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro || '',
            city: data.localidade || '',
            state: data.uf || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching CEP:', error);
      }

      await calculateShipping(zipCode);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          number: formData.number,
          complement: formData.complement,
          zip_code: formData.zip_code,
          city: formData.city,
          state: formData.state,
        })
        .select()
        .single();

      if (customerError) throw customerError;

      const totalAmount = totalPrice + shippingCost;
      const installmentAmount = paymentMethod === 'credit_card' ? totalAmount / installments : 0;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customer.id,
          status: 'pending',
          total_amount: totalAmount,
          payment_method: paymentMethod,
          payment_status: 'pending',
          installments: paymentMethod === 'credit_card' ? installments : 1,
          installment_amount: installmentAmount,
          shipping_cost: shippingCost,
          zip_code: formData.zip_code,
          city: formData.city,
          state: formData.state,
          tracking_code: selectedCarrier ? `${selectedCarrier.code}-pending` : '',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      for (const item of cart) {
        await supabase
          .from('products')
          .update({ stock: item.product.stock - item.quantity })
          .eq('id', item.product.id);
      }

      clearCart();
      onSuccess();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const total = totalPrice + shippingCost;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Lock className="w-7 h-7 text-teal-400" />
            <h2 className="text-3xl font-bold text-white tracking-tight">Checkout Seguro</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center justify-center px-8 py-6 bg-gradient-to-r from-slate-100 to-teal-50 border-b-2 border-gray-200">
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${currentStep >= 1 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              1
            </div>
            <div className={`w-24 h-1 ${currentStep >= 2 ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${currentStep >= 2 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
            <div className={`w-24 h-1 ${currentStep >= 3 ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${currentStep >= 3 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              3
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="grid lg:grid-cols-2 gap-8 p-8">
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-5">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Truck className="w-6 h-6 text-teal-600" />
                    Dados de Entrega
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Telefone</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">CEP</label>
                      <input
                        type="text"
                        required
                        value={formData.zip_code}
                        onChange={(e) => handleZipCodeChange(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                        placeholder="00000-000"
                        maxLength={9}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Cidade</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Estado</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Endereço</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Número</label>
                      <input
                        type="text"
                        required
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                        placeholder="123"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Complemento</label>
                      <input
                        type="text"
                        value={formData.complement}
                        onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                        placeholder="Apto, Bloco, etc. (opcional)"
                      />
                    </div>
                  </div>

                  {calculatingShipping && (
                    <div className="bg-blue-50 border-2 border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm font-semibold">
                      Calculando frete...
                    </div>
                  )}

                  {carriers.length > 0 && !calculatingShipping && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <h4 className="font-bold text-blue-900 mb-3">Escolha a Transportadora</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {carriers.map((carrier) => (
                          <button
                            key={carrier.id}
                            type="button"
                            onClick={() => {
                              setSelectedCarrier(carrier);
                              setShippingCost(carrier.price);
                            }}
                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                              selectedCarrier?.id === carrier.id
                                ? 'border-blue-600 bg-blue-100'
                                : 'border-blue-200 bg-white hover:border-blue-400'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-gray-900">{carrier.name}</p>
                                <p className="text-xs text-gray-600">Prazo: {carrier.deadline} dia(s)</p>
                              </div>
                              <p className="font-bold text-blue-600">
                                R$ {carrier.price?.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) ?? '0,00'}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {shippingCost > 0 && !calculatingShipping && selectedCarrier && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="w-5 h-5 text-green-600" />
                          <div>
                            <span className="font-bold text-green-900 block">{selectedCarrier.name}</span>
                            <span className="text-xs text-green-700">Prazo: {selectedCarrier.deadline} dia(s)</span>
                          </div>
                        </div>
                        <span className="text-xl font-bold text-green-600">
                          R$ {shippingCost?.toLocaleString?.('pt-BR', { minimumFractionDigits: 2 }) ?? '0,00'}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!formData.name || !formData.email || !formData.phone || !formData.address || !formData.number || !formData.city || !formData.state || !formData.zip_code}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    Continuar para Pagamento
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5">
                  {/* Resumo do Endereço */}
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-2xl border-2 border-teal-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <Truck className="w-5 h-5 text-teal-600" />
                        Endereço de Entrega
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditingAddress(!editingAddress)}
                        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        {editingAddress ? 'Concluir' : 'Editar'}
                      </button>
                    </div>

                    {editingAddress ? (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
                            <input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Telefone</label>
                            <input
                              type="tel"
                              required
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">CEP</label>
                            <input
                              type="text"
                              required
                              value={formData.zip_code}
                              onChange={(e) => handleZipCodeChange(e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                              placeholder="00000-000"
                              maxLength={9}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Cidade</label>
                            <input
                              type="text"
                              required
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Estado</label>
                            <input
                              type="text"
                              required
                              value={formData.state}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                              maxLength={2}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Endereço</label>
                          <input
                            type="text"
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Número</label>
                            <input
                              type="text"
                              required
                              value={formData.number}
                              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Complemento</label>
                            <input
                              type="text"
                              value={formData.complement}
                              onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-gray-700">
                        <p><strong>Nome:</strong> {formData.name || 'Não informado'}</p>
                        <p><strong>Telefone:</strong> {formData.phone || 'Não informado'}</p>
                        <p><strong>Endereço:</strong> {formData.address || 'Não informado'}, {formData.number || 'S/N'}</p>
                        <p><strong>Complemento:</strong> {formData.complement || 'Não informado'}</p>
                        <p><strong>CEP:</strong> {formData.zip_code || 'Não informado'} - {formData.city || 'Não informado'}, {formData.state || 'UF'}</p>
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900">Forma de Pagamento</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-6 rounded-2xl border-3 transition-all ${
                        paymentMethod === 'pix'
                          ? 'border-teal-500 bg-teal-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <QrCode className={`w-12 h-12 mx-auto mb-3 ${paymentMethod === 'pix' ? 'text-teal-600' : 'text-gray-400'}`} />
                      <p className="font-bold text-gray-900">PIX</p>
                      <p className="text-sm text-gray-600 mt-1">Aprovação instantânea</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-6 rounded-2xl border-3 transition-all ${
                        paymentMethod === 'credit_card'
                          ? 'border-teal-500 bg-teal-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className={`w-12 h-12 mx-auto mb-3 ${paymentMethod === 'credit_card' ? 'text-teal-600' : 'text-gray-400'}`} />
                      <p className="font-bold text-gray-900">Cartão</p>
                      <p className="text-sm text-gray-600 mt-1">Em até 12x sem juros</p>
                    </button>
                  </div>

                  {paymentMethod === 'credit_card' && (
                    <div className="space-y-4 mt-6 p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-slate-200">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Número do Cartão</label>
                        <input
                          type="text"
                          required={paymentMethod === 'credit_card'}
                          value={formData.cardNumber}
                          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nome no Cartão</label>
                        <input
                          type="text"
                          required={paymentMethod === 'credit_card'}
                          value={formData.cardName}
                          onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                          placeholder="Nome como está no cartão"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Validade</label>
                          <input
                            type="text"
                            required={paymentMethod === 'credit_card'}
                            value={formData.cardExpiry}
                            onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                            placeholder="MM/AA"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">CVV</label>
                          <input
                            type="text"
                            required={paymentMethod === 'credit_card'}
                            value={formData.cardCVV}
                            onChange={(e) => setFormData({ ...formData, cardCVV: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                            placeholder="000"
                            maxLength={4}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Parcelas</label>
                          <select
                            value={installments}
                            onChange={(e) => setInstallments(Number(e.target.value))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                              const installmentValue = (totalPrice + shippingCost) / num;
                              return (
                                <option key={num} value={num}>
                                  {num}x de R$ {installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'pix' && (
                    <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border-2 border-green-200">
                      <div className="flex items-center gap-3 mb-3">
                        <Check className="w-6 h-6 text-green-600" />
                        <h4 className="font-bold text-gray-900">Pagamento via PIX</h4>
                      </div>
                      <p className="text-sm text-gray-700">
                        Após confirmar o pedido, você receberá o QR Code e a chave PIX por email para realizar o pagamento.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-bold shadow-lg"
                    >
                      Revisar Pedido
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-5">
                  <h3 className="text-2xl font-bold text-gray-900">Revisar Pedido</h3>

                  <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl p-6 border-2 border-teal-200">
                    <h4 className="font-bold text-gray-900 mb-3">Endereço de Entrega</h4>
                    <p className="text-gray-700">{formData.name}</p>
                    <p className="text-gray-700">{formData.address}</p>
                    <p className="text-gray-700">{formData.city} - {formData.state}</p>
                    <p className="text-gray-700">CEP: {formData.zip_code}</p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border-2 border-slate-200">
                    <h4 className="font-bold text-gray-900 mb-3">Forma de Pagamento</h4>
                    <div className="flex items-center gap-2">
                      {paymentMethod === 'pix' ? (
                        <>
                          <QrCode className="w-5 h-5 text-teal-600" />
                          <span className="text-gray-900 font-semibold">PIX</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 text-teal-600" />
                          <span className="text-gray-900 font-semibold">Cartão de Crédito</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Shield className="w-5 h-5" />
                      {loading ? 'Processando...' : 'Confirmar Pedido'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border-2 border-slate-200 h-fit sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Resumo do Pedido</h3>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 pb-3 border-b border-gray-200">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-600">Quantidade: {item.quantity}</p>
                      <p className="text-sm font-bold text-teal-600">
                        R$ {(item.product.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t-2 border-gray-200 pt-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Frete</span>
                  <span className="font-semibold">
                    {shippingCost > 0 ? `R$ ${shippingCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'A calcular'}
                  </span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-gray-900 pt-3 border-t-2 border-gray-300">
                  <span>Total</span>
                  <span className="text-teal-600">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                  <Shield className="w-5 h-5" />
                  Compra 100% Segura e Protegida
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
