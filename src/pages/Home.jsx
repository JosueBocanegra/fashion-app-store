import { useState, useEffect } from 'react';
import { productosService } from '../services/productosService';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Star
} from 'lucide-react';

const Home = () => {
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const productos = await productosService.obtenerProductosEnOferta();
        setProductosDestacados(productos.slice(0, 4));
      } catch (error) {
        console.error('Error al cargar productos destacados:', error);
      } finally {
        setloading(false);
      }
    };
    cargarProductos();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner principal */}
      <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 rounded-3xl shadow-2xl p-8 md:p-12 mb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-white space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/10">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Nueva Colección 2026
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Bienvenido a <br />
              <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                Fashion Store
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/70 max-w-lg">
              Descubre las últimas tendencias en moda con los mejores precios y calidad garantizada.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/productos" 
                className="inline-flex items-center gap-2 bg-white text-purple-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                Ver Productos
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/about" 
                className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                Conócenos
              </Link>
            </div>

            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-2xl font-bold text-white">10+</p>
                <p className="text-sm text-white/50">Productos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">50%</p>
                <p className="text-sm text-white/50">Descuentos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-sm text-white/50">Atención</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl scale-150"></div>
              <img 
                src="assets/img/home-fashion.png"
                alt="Fashion Store"
                className="relative w-full max-w-sm md:max-w-md h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Productos destacados */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            Productos en Oferta
          </h2>
          <Link 
            to="/productos" 
            className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-semibold hover:underline cursor-pointer"
          >
            Ver todos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productosDestacados.map(producto => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </section>

      {/* Categorías con enlaces dinámicos */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Star className="w-8 h-8 text-purple-600" />
          Categorías
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tarjeta Hombre */}
          <Link
            to="/productos?categoria=Hombre"
            className="group relative h-72 rounded-2xl overflow-hidden shadow-xl cursor-pointer"
          >
            <img 
              src="assets/img/categoriaHombre.jpg"
              alt="Hombre"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h3 className="text-4xl font-bold text-white mb-2">Hombre</h3>
              <p className="text-white/70 text-sm">Descubre la colección</p>
              <span className="mt-4 inline-flex items-center gap-2 border-2 border-white/50 text-white px-6 py-2 rounded-full text-sm font-semibold group-hover:bg-white group-hover:text-purple-900 transition-all duration-300">
                Ver más
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          {/* Tarjeta Mujer */}
          <Link
            to="/productos?categoria=Mujer"
            className="group relative h-72 rounded-2xl overflow-hidden shadow-xl cursor-pointer"
          >
            <img 
              src="assets/img/categoriaMujer.jpg"
              alt="Mujer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h3 className="text-4xl font-bold text-white mb-2">Mujer</h3>
              <p className="text-white/70 text-sm">Descubre la colección</p>
              <span className="mt-4 inline-flex items-center gap-2 border-2 border-white/50 text-white px-6 py-2 rounded-full text-sm font-semibold group-hover:bg-white group-hover:text-purple-900 transition-all duration-300">
                Ver más
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

        </div>
      </section>

      {/* Beneficios */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-slate-100">
            <div className="inline-flex p-4 bg-purple-50 rounded-2xl text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Envío Rápido</h3>
            <p className="text-slate-500 text-sm">Entrega en 24-48 horas a nivel nacional</p>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-slate-100">
            <div className="inline-flex p-4 bg-blue-50 rounded-2xl text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Pago Seguro</h3>
            <p className="text-slate-500 text-sm">Transacciones protegidas con SSL</p>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-slate-100">
            <div className="inline-flex p-4 bg-green-50 rounded-2xl text-green-600 mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
              <RotateCcw className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Devoluciones</h3>
            <p className="text-slate-500 text-sm">30 días de garantía sin complicaciones</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;