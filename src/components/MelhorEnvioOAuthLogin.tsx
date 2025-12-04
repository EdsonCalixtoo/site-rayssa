import { useState } from 'react';
import { Truck, LogIn, AlertCircle } from 'lucide-react';

export default function MelhorEnvioOAuthLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginClick = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Obter informações de configuração do OAuth
      const clientId = import.meta.env.VITE_MELHOR_ENVIO_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_MELHOR_ENVIO_REDIRECT_URI;
      const scope = 'shipping-calculate shipping-companies';
      const state = Math.random().toString(36).substring(7);

      if (!clientId || !redirectUri) {
        throw new Error('Variáveis de ambiente não configuradas');
      }

      // Montar URL de autorização
      const authUrl = new URL('https://sandbox.melhorenvio.com.br/oauth/authorize');
      authUrl.searchParams.append('client_id', clientId);
      authUrl.searchParams.append('redirect_uri', redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('scope', scope);

      console.log('🔄 Redirecionando para Melhor Envio...');
      console.log('   URL:', authUrl.toString());

      // Redirecionar para o OAuth
      window.location.href = authUrl.toString();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar login';
      console.error('❌ Erro:', message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3 rounded-lg">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Conectar Melhor Envio</h1>
          <p className="text-sm text-gray-500 text-center">
            Autorize o acesso para calcular fretes em tempo real
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 text-sm">Erro</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-blue-900 text-sm">O que será autorizado?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Cálculo de fretes para seus pedidos</li>
            <li>✓ Consulta de transportadoras disponíveis</li>
            <li>✗ Acesso a dados sensíveis da sua conta</li>
          </ul>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLoginClick}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          {isLoading ? 'Redirecionando...' : 'Conectar com Melhor Envio'}
        </button>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center">
          Você será redirecionado para o site do Melhor Envio para autorizar a integração
        </p>
      </div>
    </div>
  );
}
