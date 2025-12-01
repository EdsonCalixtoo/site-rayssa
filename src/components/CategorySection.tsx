import { Sparkles } from 'lucide-react';

const categories = [
  {
    title: 'Feminina',
    items: ['Pulseira 2 em 1', 'Pulseira Colorida', 'Pulseira Laminada', 'Colar Cravejado', 'Colar'],
    image: 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=800',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    title: 'Masculina',
    items: ['Pulseira Grossa', 'Pulseira Fina', 'Corrente Grossa', 'Corrente Fina'],
    image: 'https://images.pexels.com/photos/5661960/pexels-photo-5661960.jpeg?auto=compress&cs=tinysrgb&w=800',
    gradient: 'from-slate-700 to-slate-900'
  },
  {
    title: 'Brinco',
    items: ['Cartelinha', 'Argola Cravejada', 'Brinco Revestido a Prata'],
    image: 'https://images.pexels.com/photos/3946019/pexels-photo-3946019.jpeg?auto=compress&cs=tinysrgb&w=800',
    gradient: 'from-teal-500 to-teal-600'
  },
  {
    title: 'Linha de Luxo',
    items: ['Pulseira Swarovski', 'Pulseira Rivieira', 'Colar Swarovski'],
    image: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=800',
    gradient: 'from-purple-600 to-indigo-600'
  }
];

export default function CategorySection() {
  return (
    <section id="categories" className="py-24 bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm font-bold text-teal-600 uppercase tracking-widest bg-teal-100 px-4 py-2 rounded-full animate-pulse">
              Nossas Categorias
            </span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Encontre Seu Estilo Perfeito
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore nossa coleção exclusiva organizada por categoria
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-90 transition-opacity duration-500 z-10`}>
              </div>

              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transform group-hover:scale-125 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform transition-all duration-500 group-hover:translate-y-0">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {category.title}
                  </h3>
                </div>

                <div className="space-y-2 max-h-0 overflow-hidden group-hover:max-h-96 transition-all duration-500 opacity-0 group-hover:opacity-100">
                  {category.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-white/90 text-sm transform translate-x-4 group-hover:translate-x-0 transition-all duration-500"
                      style={{ transitionDelay: `${idx * 50}ms` }}
                    >
                      <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                      <span>{item}</span>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-4 w-full bg-white text-gray-900 py-3 rounded-xl hover:bg-teal-400 hover:text-white transition-all font-bold shadow-lg transform hover:scale-105"
                  >
                    Ver Produtos
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
