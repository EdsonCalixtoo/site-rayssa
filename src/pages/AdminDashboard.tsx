import { useEffect, useState } from 'react';
import { X, LogOut, LayoutDashboard, ShoppingBag, Users, TrendingUp, Truck, Edit2, CreditCard, QrCode, DollarSign, Calendar, Settings, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductManagement from '../components/ProductManagement';
import ShippingConfiguration from '../components/ShippingConfiguration';

type OrderWithDetails = {
  id: string;
  customer_id: string;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  installments: number;
  installment_amount: number;
  paid_at: string;
  tracking_code: string;
  created_at: string;
  customers: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  order_items: {
    quantity: number;
    price: number;
    products: {
      name: string;
    };
  }[];
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'products'>('home');
  const [trackingCode, setTrackingCode] = useState<{[key: string]: string}>({});
  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [showShippingConfig, setShowShippingConfig] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (*),
          order_items (
            quantity,
            price,
            products (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      await loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Erro ao atualizar pedido');
    }
  };

  const updateTrackingCode = async (orderId: string) => {
    const code = trackingCode[orderId];
    if (!code) {
      alert('Digite um código de rastreio');
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ tracking_code: code, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      setEditingTracking(null);
      await loadOrders();
      alert('Código de rastreio adicionado com sucesso!');
    } catch (error) {
      console.error('Error updating tracking code:', error);
      alert('Erro ao adicionar código de rastreio');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const filteredOrders =
    filter === 'all'
      ? orders
      : orders.filter((order) => order.status === filter);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  };

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + order.total_amount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-white rounded-none min-h-screen flex flex-col">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500 p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-2 sticky top-20 z-30">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-slate-900'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-white text-slate-900'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Pedidos
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                activeTab === 'products'
                  ? 'bg-white text-slate-900'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Produtos
            </button>
            <button
              onClick={() => setShowShippingConfig(true)}
              className="ml-auto px-6 py-3 rounded-t-lg font-semibold transition-all text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Frete
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'home' && (
            <div className="p-8 space-y-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <ShoppingBag className="w-10 h-10" />
                    <span className="text-3xl font-bold">{orders.length}</span>
                  </div>
                  <p className="text-blue-100 font-semibold">Total de Pedidos</p>
                </div>
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-10 h-10" />
                    <span className="text-3xl font-bold">{pendingOrders}</span>
                  </div>
                  <p className="text-teal-100 font-semibold">Pedidos Pendentes</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-10 h-10" />
                    <span className="text-2xl font-bold">R$ {totalRevenue.toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="text-green-100 font-semibold">Receita Total</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 shadow-lg border border-slate-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Resumo de Pedidos</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                    <p className="text-3xl font-bold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</p>
                    <p className="text-sm text-yellow-700 font-semibold mt-1">Pendentes</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <p className="text-3xl font-bold text-blue-600">{orders.filter(o => o.status === 'processing').length}</p>
                    <p className="text-sm text-blue-700 font-semibold mt-1">Processando</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl border-2 border-green-200">
                    <p className="text-3xl font-bold text-green-600">{completedOrders}</p>
                    <p className="text-sm text-green-700 font-semibold mt-1">Concluídos</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl border-2 border-red-200">
                    <p className="text-3xl font-bold text-red-600">{orders.filter(o => o.status === 'cancelled').length}</p>
                    <p className="text-sm text-red-700 font-semibold mt-1">Cancelados</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl p-8 shadow-lg border border-teal-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Últimos Pedidos</h3>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <p className="font-semibold text-gray-900">Pedido #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-500">{order.customers.name}</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-gray-900">R$ {order.total_amount.toLocaleString('pt-BR')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <>
              <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-sm ${
                      filter === 'all'
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Todos ({orders.length})
                  </button>
                  <button
                    onClick={() => setFilter('pending')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-sm ${
                      filter === 'pending'
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Pendentes ({orders.filter((o) => o.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setFilter('processing')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-sm ${
                      filter === 'processing'
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Processando ({orders.filter((o) => o.status === 'processing').length})
                  </button>
                  <button
                    onClick={() => setFilter('completed')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-sm ${
                      filter === 'completed'
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Concluídos ({orders.filter((o) => o.status === 'completed').length})
                  </button>
                </div>
              </div>

              <div className="p-8">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600"></div>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-20">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-500 font-semibold">Nenhum pedido encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white border-2 border-gray-100 rounded-2xl p-8 hover:shadow-2xl transition-all hover:border-teal-200"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              {getStatusIcon(order.status)}
                              <span className="font-bold text-2xl text-gray-900">
                                Pedido #{order.id.slice(0, 8)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium">
                              {new Date(order.created_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                              R$ {order.total_amount.toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div className="bg-gradient-to-br from-slate-50 to-white p-5 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2 mb-3">
                              <Users className="w-5 h-5 text-teal-600" />
                              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                Cliente
                              </h4>
                            </div>
                            <p className="text-base text-gray-900 font-semibold mb-1">
                              {order.customers.name}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              {order.customers.email}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              {order.customers.phone}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.customers.address}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-teal-50 to-white p-5 rounded-xl border border-teal-200">
                            <div className="flex items-center gap-2 mb-3">
                              <ShoppingBag className="w-5 h-5 text-teal-600" />
                              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                Itens do Pedido
                              </h4>
                            </div>
                            {order.order_items.map((item, idx) => (
                              <p key={idx} className="text-sm text-gray-700 font-medium mb-1">
                                {item.products.name} x{item.quantity} - R${' '}
                                {(item.price * item.quantity).toLocaleString('pt-BR')}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-5 border-2 border-green-200 mb-6">
                          <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                              Informações de Pagamento
                            </h4>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-green-100">
                              <div className="flex items-center gap-2 mb-2">
                                {order.payment_method === 'pix' ? (
                                  <QrCode className="w-4 h-4 text-green-600" />
                                ) : (
                                  <CreditCard className="w-4 h-4 text-green-600" />
                                )}
                                <p className="text-xs font-semibold text-gray-500 uppercase">Método</p>
                              </div>
                              <p className="text-lg font-bold text-gray-900">
                                {order.payment_method === 'pix' ? 'PIX' : 'Cartão de Crédito'}
                              </p>
                            </div>

                            {order.payment_method === 'credit_card' && (
                              <div className="bg-white rounded-lg p-4 border border-green-100">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="w-4 h-4 text-green-600" />
                                  <p className="text-xs font-semibold text-gray-500 uppercase">Parcelamento</p>
                                </div>
                                <p className="text-lg font-bold text-gray-900">
                                  {order.installments}x de R$ {order.installment_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            )}

                            <div className="bg-white rounded-lg p-4 border border-green-100">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <p className="text-xs font-semibold text-gray-500 uppercase">Status Pagamento</p>
                              </div>
                              <p className={`text-lg font-bold ${
                                order.payment_status === 'paid' ? 'text-green-600' :
                                order.payment_status === 'pending' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {order.payment_status === 'paid' ? 'Pago' :
                                 order.payment_status === 'pending' ? 'Pendente' :
                                 'Falhou'}
                              </p>
                              {order.paid_at && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(order.paid_at).toLocaleString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {order.status === 'processing' && (
                          <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border-2 border-blue-200">
                            <div className="flex items-center gap-2 mb-3">
                              <Truck className="w-5 h-5 text-blue-600" />
                              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                Código de Rastreio
                              </h4>
                            </div>
                            {editingTracking === order.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={trackingCode[order.id] || ''}
                                  onChange={(e) => setTrackingCode({...trackingCode, [order.id]: e.target.value})}
                                  placeholder="Digite o código de rastreio"
                                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                                <button
                                  onClick={() => updateTrackingCode(order.id)}
                                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                                >
                                  Salvar
                                </button>
                                <button
                                  onClick={() => setEditingTracking(null)}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <p className="text-gray-700 font-semibold">
                                  {order.tracking_code || 'Nenhum código adicionado'}
                                </p>
                                <button
                                  onClick={() => {
                                    setEditingTracking(order.id);
                                    setTrackingCode({...trackingCode, [order.id]: order.tracking_code});
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  {order.tracking_code ? 'Editar' : 'Adicionar'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-3">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                              Marcar como Processando
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                              Marcar como Concluído
                            </button>
                          )}
                          {(order.status === 'pending' || order.status === 'processing') && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                              Cancelar Pedido
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'products' && <ProductManagement />}
        </div>

        {showShippingConfig && (
          <ShippingConfiguration onClose={() => setShowShippingConfig(false)} />
        )}
      </div>
    </div>
  );
}


