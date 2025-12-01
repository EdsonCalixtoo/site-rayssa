import { Heart, Users, Award, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-24 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm font-bold text-teal-600 uppercase tracking-widest bg-teal-100 px-4 py-2 rounded-full">
              Nossa História
            </span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Excelência em Cada Detalhe
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Há mais de 20 anos transformando momentos especiais em memórias eternas através de joias únicas
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
              <Heart className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Paixão pela Perfeição</h3>
              <p className="text-teal-100 leading-relaxed">
                Cada peça é criada com amor e dedicação por nossos mestres artesãos, utilizando técnicas
                tradicionais combinadas com tecnologia de ponta.
              </p>
            </div>
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-8 text-white shadow-xl">
              <Award className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Reconhecimento Internacional</h3>
              <p className="text-slate-200 leading-relaxed">
                Premiados em diversas exposições de joalheria ao redor do mundo, nossa marca é sinônimo
                de qualidade e exclusividade.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 border-2 border-slate-200 shadow-xl">
              <Users className="w-12 h-12 text-teal-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Equipe de Especialistas</h3>
              <p className="text-gray-600 leading-relaxed">
                Nossa equipe conta com joalheiros experientes, gemólogos certificados e designers premiados
                que trabalham juntos para criar peças extraordinárias.
              </p>
            </div>
            <div className="bg-gradient-to-br from-white to-teal-50 rounded-2xl p-8 border-2 border-teal-200 shadow-xl">
              <Sparkles className="w-12 h-12 text-teal-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Materiais Premium</h3>
              <p className="text-gray-600 leading-relaxed">
                Trabalhamos apenas com ouro 18k, diamantes certificados e gemas preciosas selecionadas
                criteriosamente de fornecedores éticos ao redor do mundo.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-12 text-center shadow-2xl">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-4xl font-bold text-white mb-6">
              Mais de 50.000 Clientes Satisfeitos
            </h3>
            <p className="text-xl text-slate-200 mb-8">
              Celebrando momentos especiais e criando memórias que duram para sempre
            </p>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="text-5xl font-bold text-teal-400 mb-2">20+</p>
                <p className="text-slate-300 font-semibold">Anos de Experiência</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-teal-400 mb-2">50k+</p>
                <p className="text-slate-300 font-semibold">Clientes Felizes</p>
              </div>
              <div>
                <p className="text-5xl font-bold text-teal-400 mb-2">100%</p>
                <p className="text-slate-300 font-semibold">Garantia de Qualidade</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
