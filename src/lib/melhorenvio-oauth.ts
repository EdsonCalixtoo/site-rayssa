/**
 * Função para iniciar o fluxo de OAuth com Melhor Envio
 */
export function conectarMelhorEnvio() {
  const clientId = import.meta.env.VITE_MELHOR_ENVIO_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_MELHOR_ENVIO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    alert("Erro: Variáveis de ambiente não configuradas");
    return;
  }

  const url = `https://melhorenvio.com.br/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  window.location.href = url;
}
