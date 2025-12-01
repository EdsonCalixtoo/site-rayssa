import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Cliente desde 2020',
    content: 'A qualidade das joias é excepcional! Comprei meu anel de noivado aqui e não poderia estar mais feliz. O atendimento é impecável e a peça superou todas as minhas expectativas.',
    rating: 5,
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    name: 'João Santos',
    role: 'Cliente desde 2019',
    content: 'Presenteei minha esposa com um colar desta loja e ela ficou encantada. A embalagem é linda e o certificado de autenticidade passa muita confiança. Voltarei a comprar com certeza!',
    rating: 5,
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200'
  },
  {
    name: 'Ana Costa',
    role: 'Cliente desde 2021',
    content: 'Adoro fazer compras aqui! Já comprei várias peças e todas são lindas e de altíssima qualidade. O time sempre me ajuda a escolher o presente perfeito. Recomendo de olhos fechados!',
    rating: 5,
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200'
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-white via-teal-50/20 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm font-bold text-teal-600 uppercase tracking-widest bg-teal-100 px-4 py-2 rounded-full">
              Depoimentos
            </span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A satisfação dos nossos clientes é nossa maior conquista
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-teal-200 transform hover:-translate-y-2"
            >
              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-12 h-12 text-teal-200" />
                <div className="flex items-center gap-4 relative z-10">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-teal-100"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-teal-400 text-teal-400" />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed italic">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-50 to-teal-100 px-8 py-4 rounded-full border-2 border-teal-200">
            <Star className="w-6 h-6 fill-teal-500 text-teal-500" />
            <span className="text-2xl font-bold text-gray-900">4.9/5.0</span>
            <span className="text-gray-600">Baseado em 2,847 avaliações</span>
          </div>
        </div>
      </div>
    </section>
  );
}
