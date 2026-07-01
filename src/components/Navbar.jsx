import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-gray-300 transition">
          Fashion Store
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/" className="hover:text-gray-300 transition">Inicio</Link>
          <Link to="/about" className="hover:text-gray-300 transition">Nosotros</Link>
          <Link to="/productos" className="hover:text-gray-300 transition">Productos</Link>
          <Link to="/contacto" className="hover:text-gray-300 transition">Contacto</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


