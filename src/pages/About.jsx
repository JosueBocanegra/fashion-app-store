import { 
  Store, 
  Target, 
  Eye, 
  Heart, 
  Shield, 
  Lightbulb, 
  Users, 
  Globe,
  CheckCircle,
  Award,
  Star,
  TrendingUp
} from 'lucide-react';

const About = () => {
  const valores = [
    { 
      icon: Shield, 
      title: 'Calidad en cada prenda',
      desc: 'Seleccionamos los mejores materiales para garantizar durabilidad y confort.'
    },
    { 
      icon: Lightbulb, 
      title: 'Innovación constante',
      desc: 'Siempre a la vanguardia de las últimas tendencias y tecnologías.'
    },
    { 
      icon: Heart, 
      title: 'Compromiso con el cliente',
      desc: 'Tu satisfacción es nuestra prioridad número uno.'
    },
    { 
      icon: Globe, 
      title: 'Responsabilidad social',
      desc: 'Comprometidos con prácticas sostenibles y éticas.'
    }
  ];

  const stats = [
    { number: '10+', label: 'Productos', icon: Store },
    { number: '50%', label: 'Descuentos', icon: TrendingUp },
    { number: '24/7', label: 'Atención', icon: Users },
    { number: '4.9', label: 'Calificación', icon: Star }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Award className="w-4 h-4" />
            Conoce nuestra historia
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Sobre Nosotros
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Descubre quiénes somos, nuestra misión y los valores que nos impulsan a ofrecerte lo mejor en moda.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex p-3 bg-purple-50 rounded-xl text-purple-600 mb-3">
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.number}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          {/* Historia */}
          <div className="p-8 md:p-10 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 rounded-2xl flex-shrink-0">
                <Store className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Nuestra Historia</h2>
                <p className="text-slate-600 leading-relaxed">
                  Fashion Store nació en 2024 con la misión de ofrecer ropa de calidad a precios accesibles. 
                  Desde entonces, nos hemos convertido en la tienda de moda favorita de miles de clientes 
                  en todo el país, gracias a nuestro compromiso con la excelencia y la innovación.
                </p>
              </div>
            </div>
          </div>

          {/* Misión */}
          <div className="p-8 md:p-10 border-b border-slate-100 bg-gradient-to-r from-purple-50/50 to-transparent">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl flex-shrink-0">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Nuestra Misión</h2>
                <p className="text-slate-600 leading-relaxed">
                  Proporcionar a nuestros clientes las mejores prendas de vestir, combinando calidad, 
                  estilo y precios competitivos, para que siempre luzcan y se sientan bien. 
                  Nos esforzamos por superar tus expectativas en cada compra.
                </p>
              </div>
            </div>
          </div>

          {/* Visión */}
          <div className="p-8 md:p-10 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-50 rounded-2xl flex-shrink-0">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Nuestra Visión</h2>
                <p className="text-slate-600 leading-relaxed">
                  Ser la tienda de moda líder en el mercado peruano, reconocida por nuestra calidad, 
                  innovación y excelente servicio al cliente. Queremos ser tu primera opción cuando 
                  pienses en moda y estilo.
                </p>
              </div>
            </div>
          </div>

          {/* Valores */}
          <div className="p-8 md:p-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-pink-50 rounded-2xl flex-shrink-0">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Nuestros Valores</h2>
                <p className="text-slate-500 text-sm">
                  Estos son los principios que guían cada una de nuestras decisiones.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {valores.map((valor, index) => (
                <div key={index} className="group bg-slate-50 rounded-2xl p-5 hover:bg-purple-50 transition-all duration-300 border border-transparent hover:border-purple-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-xl group-hover:bg-purple-100 transition-colors">
                      <valor.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">{valor.title}</h3>
                      <p className="text-sm text-slate-500">{valor.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">¿Listo para descubrir nuestra colección?</h3>
            <p className="text-white/80 mb-6">Encuentra las mejores prendas al mejor precio.</p>
            <a 
              href="/productos" 
              className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Ver Productos
              <CheckCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;


