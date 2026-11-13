import { useState } from 'react';
import {
  ShoppingBag,
  Home,
  Users,
  Package,
  Mail,
  Menu,
  X,
  ShoppingCart,
  LogIn,
  UserPlus,
  LogOut
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import { useAuthCliente } from '../context/AuthClienteContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cantidadProductos } = useCarrito();
  const { cliente, autenticado, logout } = useAuthCliente();
  const navigate = useNavigate();

  const manejarCerrarSesion = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

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

            <Link
              to="/carrito"
              className="relative flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
            >
              <ShoppingCart className="w-5 h-5" />
              Carrito

              {cantidadProductos > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center">
                  {cantidadProductos}
                </span>
              )}
            </Link>

            {/* Autenticación de clientes */}
            {autenticado ? (
              <div className="flex items-center gap-3 px-3">
                <span className="text-white text-sm">
                  Hola, {cliente.nombre}
                </span>

                <button
                  onClick={manejarCerrarSesion}
                  className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login-cliente"
                  className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar sesión
                </Link>

                <Link
                  to="/registro-cliente"
                  className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </Link>
              </div>
            )}
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
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[600px] py-4' : 'max-h-0'}`}>
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

            {/* Autenticación de clientes en móvil */}
            {autenticado ? (
              <>
                <div className="px-4 py-3 text-white font-medium">
                  Hola, {cliente.nombre}
                </div>

                <button
                  onClick={manejarCerrarSesion}
                  className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login-cliente"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
                >
                  <LogIn className="w-5 h-5" />
                  Iniciar sesión
                </Link>

                <Link
                  to="/registro-cliente"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-medium"
                >
                  <UserPlus className="w-5 h-5" />
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


