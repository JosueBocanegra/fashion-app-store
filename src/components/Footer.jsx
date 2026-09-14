const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Fashion Store</h3>
            <p className="text-gray-400 text-sm">
              Tu tienda de moda favorita con los mejores productos.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-gray-400 hover:text-white transition">Inicio</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-white transition">Nosotros</a></li>
              <li><a href="/productos" className="text-gray-400 hover:text-white transition">Productos</a></li>
              <li><a href="/contacto" className="text-gray-400 hover:text-white transition">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <p className="text-gray-400 text-sm">Email: info@fashionstore.com</p>
            <p className="text-gray-400 text-sm">Teléfono: +51 999 999 999</p>
            <p className="text-gray-400 text-sm">Dirección: Av. Principal 123, Lima</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-400">
          <p>&copy; 2024 Fashion Store. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


