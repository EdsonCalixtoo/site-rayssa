import { X, LogIn } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

type ClientLoginProps = {
  onClose: () => void;
  onSuccess: () => void;
  onRegisterClick: () => void;
};

export default function ClientLogin({ onClose, onSuccess, onRegisterClick }: ClientLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;
      onSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl animate-slide-up overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white tracking-tight">Entrar</h2>
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
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
              placeholder="seu@email.com"
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
            <LogIn className="w-5 h-5" />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="text-center pt-4 border-t-2 border-gray-200">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={onRegisterClick}
                className="text-teal-600 hover:text-teal-700 font-bold"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

