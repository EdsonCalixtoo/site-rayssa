import { useState, useEffect } from 'react';
import { X, Package, Clock, CheckCircle, XCircle, LogOut, User, Mail, Phone, MapPin, CreditCard, QrCode, Truck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ClientLogin from './ClientLogin';
import ClientRegister from './ClientRegister';

type ModernClientAreaProps = {
  onClose: () => void;
};

type OrderWithDetails = {
  id: string;
  status: string;
  total_amount: number;
  payment_method: string;
  shipping_cost: number;
  zip_code: string;
  city: string;
  state: string;
  tracking_code: string;
  created_at: string;
  order_items: {
    quantity: number;
    price: number;
    products: {
      name: string;
      image_url: string;
    };
  }[];
};

type CustomerData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  zip_code: string;
  city: string;
  state: string;
};

export default function ModernClientArea({ onClose }: ModernClientAreaProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && !showLogin && !showRegister) {
      loadCustomerOrders();
    }
  }, [isAuthenticated, showLogin, showRegister]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsAuthenticated(true);
      setShowLogin(false);
      setShowRegister(false);
    }
    setLoading(false);
  };

  const loadCustomerOrders = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setShowLogin(true);
        return;
      }

      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (customerError) throw customerError;

      if (customers) {
        setCustomerData(customers);

        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              quantity,
              price,
              products (name, image_url)
            )
          `)
          .eq('customer_id', customers.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        setOrders(ordersData || []);
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    onClose();
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    setShowRegister(false);
    loadCustomerOrders();
  };

  const handleRegisterSuccess = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    setShowRegister(false);
    loadCustomerOrders();
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5 text-yellow-600" />,
          label: 'Pendente',
          color: 'bg-yellow-50 border-yellow-300 text-yellow-700'
        };
      case 'processing':
        return {
          icon: <Package className="w-5 h-5 text-blue-600" />,
          label: 'Em Processamento',
          color: 'bg-blue-50 border-blue-300 text-blue-700'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          label: 'Concluído',
          color: 'bg-green-50 border-green-300 text-green-700'
        };
      case 'cancelled':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          label: 'Cancelado',
          color: 'bg-red-50 border-red-300 text-red-700'
        };
      default:
        return {
          icon: <Package className="w-5 h-5 text-gray-600" />,
          label: 'Desconhecido',
          color: 'bg-gray-50 border-gray-300 text-gray-700'
        };
    }
  };

  if (showLogin && !showRegister) {
    return (
      <ClientLogin
        onClose={onClose}
        onSuccess={handleLoginSuccess}
        onRegisterClick={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
    );
  }

  if (showRegister) {
    return (
      <ClientRegister
        onClose={onClose}
        onSuccess={handleRegisterSuccess}
        onLoginClick={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl animate-slide-up">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500 p-2 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Minha Conta</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-88px)]">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600"></div>
            </div>
          ) : (
            <div className="p-8 space-y-8">
              {customerData && (
                <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl p-8 shadow-lg border-2 border-teal-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="w-6 h-6 text-teal-600" />
                    Meus Dados
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-teal-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Nome</p>
                        <p className="text-lg text-gray-900 font-semibold">{customerData.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-teal-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Email</p>
                        <p className="text-lg text-gray-900">{customerData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-teal-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Telefone</p>
                        <p className="text-lg text-gray-900">{customerData.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-teal-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Endereço</p>
                        <p className="text-lg text-gray-900">
                          {customerData.address}, {customerData.number}
                          {customerData.complement && ` - ${customerData.complement}`}
                        </p>
                        <p className="text-sm text-gray-600">{customerData.city} - {customerData.state}</p>
                        <p className="text-sm text-gray-600">CEP: {customerData.zip_code}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Package className="w-6 h-6 text-teal-600" />
                  Meus Pedidos ({orders.length})
                </h3>

                {orders.length === 0 ? (
                  <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-slate-200">
                    <Package className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Nenhum pedido encontrado</h4>
                    <p className="text-gray-600">Você ainda não fez nenhum pedido</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => {
                      const statusInfo = getStatusInfo(order.status);
                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-teal-200"
                        >
                          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
                            <div className="flex justify-between items-center flex-wrap gap-3">
                              <div>
                                <p className="text-white font-bold text-lg">Pedido #{order.id.slice(0, 8)}</p>
                                <p className="text-slate-300 text-sm">
                                  {new Date(order.created_at).toLocaleString('pt-BR')}
                                </p>
                              </div>
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${statusInfo.color} font-bold`}>
                                {statusInfo.icon}
                                {statusInfo.label}
                              </div>
                            </div>
                          </div>

                          <div className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl p-5 border-2 border-teal-200">
                                <div className="flex items-center gap-2 mb-3">
                                  {order.payment_method === 'pix' ? (
                                    <QrCode className="w-5 h-5 text-teal-600" />
                                  ) : (
                                    <CreditCard className="w-5 h-5 text-teal-600" />
                                  )}
                                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                    Forma de Pagamento
                                  </h4>
                                </div>
                                <p className="text-lg font-bold text-gray-900">
                                  {order.payment_method === 'pix' ? 'PIX' : 'Cartão de Crédito'}
                                </p>
                              </div>

                              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border-2 border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <Truck className="w-5 h-5 text-blue-600" />
                                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                    Endereço de Entrega
                                  </h4>
                                </div>
                                <p className="text-sm text-gray-700">{order.city} - {order.state}</p>
                                <p className="text-sm text-gray-700">CEP: {order.zip_code}</p>
                                {order.tracking_code && (
                                  <p className="text-sm font-semibold text-blue-600 mt-2">
                                    Rastreio: {order.tracking_code}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border-2 border-slate-200">
                              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                                Itens do Pedido
                              </h4>
                              <div className="space-y-3">
                                {order.order_items.map((item, idx) => (
                                  <div key={idx} className="flex gap-4 items-center">
                                    <img
                                      src={item.products.image_url}
                                      alt={item.products.name}
                                      className="w-16 h-16 object-cover rounded-lg border-2 border-gray-100"
                                    />
                                    <div className="flex-1">
                                      <p className="font-bold text-gray-900">{item.products.name}</p>
                                      <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                                    </div>
                                    <p className="text-lg font-bold text-teal-600">
                                      R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="border-t-2 border-gray-200 pt-4">
                              <div className="space-y-2 text-right">
                                <div className="flex justify-between text-gray-700">
                                  <span>Frete:</span>
                                  <span className="font-semibold">
                                    R$ {order.shipping_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                                <div className="flex justify-between text-2xl font-bold text-gray-900">
                                  <span>Total:</span>
                                  <span className="text-teal-600">
                                    R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

