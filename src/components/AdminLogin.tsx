import { X, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

type AdminLoginProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function AdminLogin({ onClose, onSuccess }: AdminLoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl animate-slide-up overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Admin Login</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email do Administrador</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
              placeholder="admin@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
              placeholder="Sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all tracking-wide disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg text-lg flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            {loading ? 'Entrando...' : 'Acessar Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

