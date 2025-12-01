import { Star, Award, Shield, Gem, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

export default function Hero() {
  const navigate = useNavigate();
  return (
    <>
      <div className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="absolute top-10 left-10 animate-float">
          <Gem className="w-16 h-16 text-teal-300/20" />
        </div>
        <div className="absolute top-20 right-20 animate-float animation-delay-2000">
          <Star className="w-12 h-12 text-teal-300/20" />
        </div>
        <div className="absolute bottom-32 left-20 animate-float animation-delay-4000">
          <Star className="w-14 h-14 text-teal-300/20" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="text-center">
            <div className="flex justify-center mb-8 animate-bounce-slow">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-500 blur-3xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-teal-400 to-teal-600 p-1 rounded-full">
                  <Logo size="lg" />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <span className="inline-block text-teal-300 text-sm font-bold uppercase tracking-widest mb-4 animate-fade-in">
                Bem-vindo à
              </span>
            </div>

            <h1 className="text-6xl lg:text-8xl font-bold tracking-tight text-white mb-8 animate-fade-in">
              <span className="inline-block bg-gradient-to-r from-teal-200 via-teal-300 to-teal-200 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
                RT Pratas
              </span>
            </h1>

            <p className="text-2xl lg:text-3xl text-teal-300 font-semibold mb-6 animate-fade-in-delay">
              Joias de Elegância por Rayssa Tayla
            </p>

            <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-delay-2">
              Descubra joias exclusivas para cada estilo. Femininas, Masculinas, Brincos e nossa exclusiva Linha de Luxo.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-delay-2 mb-12">
              <button
                onClick={() => {
                  document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative bg-gradient-to-r from-teal-500 to-teal-600 text-white px-12 py-5 rounded-full hover:from-teal-600 hover:to-teal-700 transition-all duration-300 text-lg font-bold tracking-wide shadow-2xl hover:shadow-teal-500/50 transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Explorar Categorias
                  <Star className="w-5 h-5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>

              <button
                onClick={() => {
                  navigate('/produtos');
                }}
                className="group relative border-2 border-teal-400 text-teal-400 px-12 py-5 rounded-full hover:bg-teal-400 hover:text-teal-900 transition-all duration-300 text-lg font-bold tracking-wide transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Ver Produtos
                  <Gem className="w-5 h-5" />
                </span>
              </button>
            </div>

            <div className="flex justify-center gap-8 text-white/80 animate-fade-in-delay-2">
              <div className="text-center">
                <p className="text-3xl font-bold text-teal-400 mb-1">50k+</p>
                <p className="text-sm uppercase tracking-wider">Clientes</p>
              </div>
              <div className="w-px bg-white/20"></div>
              <div className="text-center">
                <p className="text-3xl font-bold text-teal-400 mb-1">20+</p>
                <p className="text-sm uppercase tracking-wider">Anos</p>
              </div>
              <div className="w-px bg-white/20"></div>
              <div className="text-center">
                <p className="text-3xl font-bold text-teal-400 mb-1">100%</p>
                <p className="text-sm uppercase tracking-wider">Satisfação</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-teal-400">
          <ArrowDown className="w-8 h-8" />
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-24">
            <path fill="#ffffff" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-teal-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Qualidade Premium</h3>
              <p className="text-gray-600">Materiais nobres selecionados com rigor absoluto</p>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-teal-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Design Exclusivo</h3>
              <p className="text-gray-600">Criações únicas desenvolvidas por mestres artesãos</p>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-teal-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Garantia Vitalícia</h3>
              <p className="text-gray-600">Certificado de autenticidade e proteção eterna</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


