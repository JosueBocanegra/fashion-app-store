import { useState, useEffect } from 'react';
import { productosService } from '../services/productosService';
import ProductCard from '../components/ProductCard';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroOferta, setFiltroOferta] = useState(false);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        let data;
        if (filtroCategoria !== 'todos') {
          data = await productosService.obtenerProductosPorCategoria(filtroCategoria);
        } else {
          data = await productosService.obtenerProductos();
        }
        
        if (filtroOferta) {
          data = data.filter(p => p.oferta === true);
        }
        
        setProductos(data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarProductos();
  }, [filtroCategoria, filtroOferta]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Nuestros Productos</h1>
      
      {/* Filtros */}
      <div className="bg-gray-100 rounded-lg p-4 mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-gray-700">Categoría:</label>
          <select 
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="todos">Todos</option>
            <option value="Hombre">Hombre</option>
            <option value="Mujer">Mujer</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold text-gray-700">Ofertas:</label>
          <input 
            type="checkbox"
            checked={filtroOferta}
            onChange={(e) => setFiltroOferta(e.target.checked)}
            className="w-5 h-5 accent-purple-600"
          />
        </div>

        <button 
          onClick={() => {
            setFiltroCategoria('todos');
            setFiltroOferta(false);
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          Limpiar Filtros
        </button>
      </div>

      {/* Lista de productos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map(producto => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}

      {!loading && productos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-xl">No se encontraron productos con estos filtros</p>
        </div>
      )}
    </div>
  );
};

export default Productos;


