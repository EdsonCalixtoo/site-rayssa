import { X } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

type ClientRegisterProps = {
  onClose: () => void;
  onSuccess: () => void;
  onLoginClick: () => void;
};

export default function ClientRegister({ onClose, onSuccess, onLoginClick }: ClientRegisterProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    zip_code: '',
    address: '',
    number: '',
    complement: '',
    city: '',
    state: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: customerError } = await supabase
          .from('customers')
          .insert({
            user_id: authData.user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            zip_code: formData.zip_code,
            address: formData.address,
            number: formData.number,
            complement: formData.complement,
            city: formData.city,
            state: formData.state,
          });

        if (customerError) throw customerError;
      }

      onSuccess();
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
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
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-slide-up">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white tracking-tight">Criar Conta</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[calc(95vh-88px)]">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="Seu nome completo"
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
                placeholder="(00) 00000-0000"
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
              placeholder="seu@email.com"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Senha</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Confirmar Senha</label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                placeholder="Repita a senha"
              />
            </div>
          </div>

          <div className="border-t-2 border-gray-200 pt-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Endereço de Entrega</h3>

            <div className="grid md:grid-cols-3 gap-5">
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
                  placeholder="Cidade"
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
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="mt-5">
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

            <div className="grid md:grid-cols-2 gap-5 mt-5">
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all tracking-wide disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg text-lg"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>

          <div className="text-center pt-4 border-t-2 border-gray-200">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={onLoginClick}
                className="text-teal-600 hover:text-teal-700 font-bold"
              >
                Faça login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

