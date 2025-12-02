import { useState, useEffect } from 'react';
import { Truck, Package, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { trackShipment } from '../lib/melhorenvio';
import { supabase } from '../lib/supabase';

interface ShippingLogEntry {
  id: string;
  status: string;
  status_description?: string;
  status_date: string;
  location?: string;
}

interface OrderTrackingProps {
  orderId: string;
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
    case 'entregue':
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    case 'in_transit':
    case 'em_trânsito':
      return <Truck className="w-6 h-6 text-blue-600" />;
    case 'pending':
    case 'pendente':
      return <Package className="w-6 h-6 text-gray-600" />;
    case 'error':
    case 'erro':
      return <AlertCircle className="w-6 h-6 text-red-600" />;
    default:
      return <Package className="w-6 h-6 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
    case 'entregue':
      return 'bg-green-50 border-green-200';
    case 'in_transit':
    case 'em_trânsito':
      return 'bg-blue-50 border-blue-200';
    case 'pending':
    case 'pendente':
      return 'bg-gray-50 border-gray-200';
    case 'error':
    case 'erro':
      return 'bg-red-50 border-red-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

interface Order {
  id: string;
  tracking_code?: string;
  shipping_carrier?: string;
  estimated_delivery_date?: string;
}

export default function OrderTracking({ orderId }: OrderTrackingProps) {
  const [shippingLogs, setShippingLogs] = useState<ShippingLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [orderInfo, setOrderInfo] = useState<Order | null>(null);

  useEffect(() => {
    const loadTrackingInfo = async () => {
      try {
        setLoading(true);
        setError('');

        // Carregar informações do pedido
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;
        if (!order) throw new Error('Pedido não encontrado');

        setOrderInfo(order);

        // Carregar logs de rastreamento do banco de dados
        const { data: logs, error: logsError } = await supabase
          .from('shipping_logs')
          .select('*')
          .eq('order_id', orderId)
          .order('status_date', { ascending: false });

        if (logsError) throw logsError;
        setShippingLogs(logs || []);

        // Se tiver tracking code, tentar atualizar do Melhor Envio
        if (order.tracking_code) {
          try {
            const trackingData = await trackShipment(order.tracking_code);
            console.log('Dados de rastreamento:', trackingData);
            // Aqui você poderia atualizar os logs com as informações mais recentes
          } catch (err) {
            console.error('Erro ao buscar rastreamento:', err);
            // Não lança erro pois já temos dados locais
          }
        }
      } catch (err) {
        console.error('Erro ao carregar rastreamento:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar informações de rastreamento'
        );
      } finally {
        setLoading(false);
      }
    };

    loadTrackingInfo();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="w-8 h-8 text-teal-600 animate-spin mb-3" />
        <p className="text-gray-600">Carregando informações de rastreamento...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Erro ao carregar rastreamento</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {orderInfo && (
        <div className="mb-8 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border-2 border-teal-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Informações do Pedido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Número do Pedido</p>
              <p className="font-semibold text-gray-900">#{orderInfo.id.slice(0, 8).toUpperCase()}</p>
            </div>
            {orderInfo.tracking_code && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Código de Rastreamento</p>
                <p className="font-semibold text-gray-900">{orderInfo.tracking_code}</p>
              </div>
            )}
            {orderInfo.shipping_carrier && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Transportadora</p>
                <p className="font-semibold text-gray-900">{orderInfo.shipping_carrier}</p>
              </div>
            )}
            {orderInfo.estimated_delivery_date && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Entrega Estimada</p>
                <p className="font-semibold text-gray-900">
                  {new Date(orderInfo.estimated_delivery_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {shippingLogs.length > 0 ? (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Histórico de Rastreamento</h3>
          <div className="space-y-4">
            {shippingLogs.map((log, index) => (
              <div
                key={log.id}
                className={`p-4 rounded-xl border-2 ${getStatusColor(log.status)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(log.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-gray-900">
                        {log.status_description || log.status}
                      </h4>
                      <span className="text-xs text-gray-600">
                        {new Date(log.status_date).toLocaleDateString('pt-BR', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {log.location && (
                      <p className="text-sm text-gray-700">{log.location}</p>
                    )}
                  </div>
                </div>
                {index < shippingLogs.length - 1 && (
                  <div className="mt-4 ml-3 h-6 border-l-2 border-gray-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {orderInfo?.tracking_code
              ? 'Rastreamento será atualizado em breve...'
              : 'Rastreamento não disponível para este pedido'}
          </p>
        </div>
      )}
    </div>
  );
}
