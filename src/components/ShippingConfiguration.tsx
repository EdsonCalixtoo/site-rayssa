import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ShippingConfigProps = {
  onClose: () => void;
};

type ShippingConfig = {
  id: string;
  client_id: string;
  client_secret: string;
  token: string;
  is_production: boolean;
  enabled_carriers: string[];
};

export default function ShippingConfiguration({ onClose }: ShippingConfigProps) {
  const [config, setConfig] = useState<ShippingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);

  const carriers = [
    { id: 'jadlog', name: '🚚 Jadlog' },
    { id: 'correios', name: '📮 Correios' },
    { id: 'azul_cargo', name: '✈️ Azul Cargo' },
  ];

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setConfig(data || {
        id: '',
        client_id: '',
        client_secret: '',
        token: '',
        is_production: false,
        enabled_carriers: ['jadlog', 'correios', 'azul_cargo'],
      });
    } catch (error) {
      console.error('Error loading config:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('shipping_config')
        .update({
          client_id: config.client_id,
          client_secret: config.client_secret,
          token: config.token,
          is_production: config.is_production,
          enabled_carriers: config.enabled_carriers,
          updated_at: new Date().toISOString(),
        })
        .eq('id', config.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
    }
  };

  const toggleCarrier = (carrierId: string) => {
    if (!config) return;
    const updated = config.enabled_carriers.includes(carrierId)
      ? config.enabled_carriers.filter(c => c !== carrierId)
      : [...config.enabled_carriers, carrierId];
    setConfig({ ...config, enabled_carriers: updated });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
          <div className="flex justify-center">
            <Loader className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Configuração de Frete</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">Como configurar o Melhor Envio:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Acesse <a href="https://melhorenvio.com.br" target="_blank" rel="noopener noreferrer" className="underline font-semibold">melhorenvio.com.br</a></li>
                <li>Faça login ou crie uma conta</li>
                <li>Vá em Configurações → Integrações → Criar Aplicação</li>
                <li>Preencha os dados abaixo com seus tokens</li>
              </ol>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl flex gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </p>
          </div>
        )}

        {config && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Ambiente
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, is_production: false })}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    !config.is_production
                      ? 'bg-teal-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🧪 Sandbox (Testes)
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, is_production: true })}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    config.is_production
                      ? 'bg-teal-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🚀 Produção
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Client ID
              </label>
              <input
                type="text"
                value={config.client_id}
                onChange={(e) => setConfig({ ...config, client_id: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="Seu Client ID do Melhor Envio"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Client Secret
              </label>
              <div className="flex gap-2">
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={config.client_secret}
                  onChange={(e) => setConfig({ ...config, client_secret: e.target.value })}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="Seu Client Secret do Melhor Envio"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                >
                  {showSecrets ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Token de Acesso
              </label>
              <input
                type={showSecrets ? 'text' : 'password'}
                value={config.token}
                onChange={(e) => setConfig({ ...config, token: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="Token gerado na aplicação do Melhor Envio"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Transportadoras Ativas
              </label>
              <div className="space-y-2">
                {carriers.map((carrier) => (
                  <label
                    key={carrier.id}
                    className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-teal-300 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={config.enabled_carriers.includes(carrier.id)}
                      onChange={() => toggleCarrier(carrier.id)}
                      className="w-5 h-5 rounded text-teal-600 cursor-pointer"
                    />
                    <span className="text-gray-900 font-medium">{carrier.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Configurações
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

