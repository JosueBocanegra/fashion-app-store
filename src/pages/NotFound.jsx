import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto text-center">
        <div className="relative inline-block">
          <div className="text-8xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            404
          </div>
          <div className="absolute -top-4 -right-4 text-3xl animate-pulse"></div>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-4">
          Página no encontrada
        </h2>
        
        <p className="text-slate-500 mt-3 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/25"
          >
            <Home className="w-5 h-5" />
            Volver al Inicio
          </Link>
          <Link 
            to="/productos" 
            className="inline-flex items-center gap-2 border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300"
          >
            <Search className="w-5 h-5" />
            Ver Productos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;


