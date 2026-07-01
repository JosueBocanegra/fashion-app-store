import { useState, useEffect } from 'react';
import { productosService } from '../services/productosService';
import ProductCard from '../components/ProductCard';

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
        setLoading(false);
      }
    };
    cargarProductos();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner principal */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-8 mb-12">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a Fashion Store</h1>
        <p className="text-xl mb-6">Descubre las últimas tendencias en moda</p>
        <a 
          href="/productos" 
          className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
        >
          Ver Productos
        </a>
      </div>

      {/* Productos destacados */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Productos en Oferta</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productosDestacados.map(producto => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </section>

      {/* Categorías */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Categorías</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500" 
              alt="Hombre"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h3 className="text-3xl font-bold text-white">Hombre</h3>
            </div>
          </div>
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1560243563-062bfc001d68?w=500" 
              alt="Mujer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h3 className="text-3xl font-bold text-white">Mujer</h3>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


