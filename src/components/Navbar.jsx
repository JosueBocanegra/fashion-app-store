import { Link } from 'react-router-dom';
import { ShoppingBag, Home, Users, Package, Mail, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 sticky top-0 z-50 shadow-2xl border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
            <ShoppingBag className="w-7 h-7 text-purple-400" />
            <span className="text-white">Fashion</span>
            <span className="text-purple-400">Store</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
            >
              <Home className="w-4 h-4" />
              Inicio
            </Link>
            <Link 
              to="/about" 
              className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
            >
              <Users className="w-4 h-4" />
              Nosotros
            </Link>
            <Link 
              to="/productos" 
              className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
            >
              <Package className="w-4 h-4" />
              Productos
            </Link>
            <Link 
              to="/contacto" 
              className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
            >
              <Mail className="w-4 h-4" />
              Contacto
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 py-4' : 'max-h-0'}`}>
          <div className="flex flex-col space-y-2">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
            >
              <Home className="w-5 h-5" />
              Inicio
            </Link>
            <Link 
              to="/about" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
            >
              <Users className="w-5 h-5" />
              Nosotros
            </Link>
            <Link 
              to="/productos" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
            >
              <Package className="w-5 h-5" />
              Productos
            </Link>
            <Link 
              to="/contacto" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
            >
              <Mail className="w-5 h-5" />
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


