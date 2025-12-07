import { conectarMelhorEnvio } from '../lib/melhorenvio-oauth';

export default function ConectarMelhorEnvioButton() {
  return (
    <button
      onClick={conectarMelhorEnvio}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-bold hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg"
    >
      🔗 Conectar Melhor Envio
    </button>
  );
}
