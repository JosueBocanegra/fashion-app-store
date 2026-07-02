import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1 - Brand */}
          <div>
            <div className="flex items-center gap-2 text-xl font-bold mb-4">
              <ShoppingBag className="w-6 h-6 text-purple-400" />
              <span className="text-white">Fashion</span>
              <span className="text-purple-400">Store</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Tu tienda de moda favorita con los mejores productos y las últimas tendencias.
            </p>
          </div>
          
          {/* Columna 2 - Enlaces */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-white/60 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/60 hover:text-white transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/productos" className="text-white/60 hover:text-white transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-white/60 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Columna 3 - Contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contacto</h4>
            <ul className="space-y-2 text-white/60 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                info@fashionstore.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-400" />
                +51 999 999 999
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                Av. Principal 123, Lima
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-4 text-center text-sm text-white/40">
          <p>&copy; 2026 Fashion Store. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


