import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productosService } from '../services/productosService';
import ProductCard from '../components/ProductCard';
import { Filter, X, Tag } from 'lucide-react';

const Productos = () => {
  // --- PARÁMETROS DE BÚSQUEDA URL ---
  const [searchParams] = useSearchParams();
  const categoriaURL = searchParams.get("categoria");

  // --- ESTADOS ---
  const [productos, setProductos] = useState([]); // Guarda el catálogo maestro original
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState(categoriaURL || 'todos');
  const [filtroOferta, setFiltroOferta] = useState(false);

  // Efecto para sincronizar el estado cuando cambia la URL y desplazar suavemente hacia arriba
  useEffect(() => {
    const categoria = searchParams.get("categoria");
    setFiltroCategoria(categoria || 'todos');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  // Cargamos todos los productos de la tienda una sola vez al montar el componente
  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      try {
        const data = await productosService.obtenerProductos();
        setProductos(data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarProductos();
  }, []);

  // --- FILTRADO DINÁMICO CLIENT-SIDE (useMemo) ---
  // Filtra en tiempo real basándose en el estado sin destruir ni mutar el array original de productos
  const productosFiltrados = useMemo(() => {
    return productos.filter(producto => {
      const cumpleCategoria = filtroCategoria === 'todos' || producto.categoria === filtroCategoria;
      const cumpleOferta = !filtroOferta || producto.oferta === true;
      return cumpleCategoria && cumpleOferta;
    });
  }, [productos, filtroCategoria, filtroOferta]);

  // --- CONTADOR ESTABLE DE CATEGORÍAS ---
  // Siempre lee del catálogo maestro (`productos`), asegurando que los contadores del selector no cambien a 0
  const getCategoriaCount = (categoria) => {
    if (categoria === 'todos') return productos.length;
    return productos.filter(p => p.categoria === categoria).length;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Título */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Nuestros Productos
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {productosFiltrados.length} productos mostrados
          </p>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-lg p-5 mb-8 border border-slate-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <Filter className="w-4 h-4 text-purple-600" />
            <span className="text-sm">Filtros:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50 text-sm cursor-pointer"
            >
              <option value="todos">Todos ({getCategoriaCount('todos')})</option>
              <option value="Hombre">Hombre ({getCategoriaCount('Hombre')})</option>
              <option value="Mujer">Mujer ({getCategoriaCount('Mujer')})</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input 
                type="checkbox"
                checked={filtroOferta}
                onChange={(e) => setFiltroOferta(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded"
              />
              <Tag className="w-4 h-4 text-green-600" />
              Ofertas
            </label>
          </div>

          <button 
            onClick={() => {
              setFiltroCategoria('todos');
              setFiltroOferta(false);
            }}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-xl transition-colors ml-auto cursor-pointer"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        </div>

        {/* Filtros activos */}
        {(filtroCategoria !== 'todos' || filtroOferta) && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">Filtros activos:</span>
            {filtroCategoria !== 'todos' && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {filtroCategoria}
                <button 
                  onClick={() => setFiltroCategoria('todos')}
                  className="hover:text-purple-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filtroOferta && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                Ofertas
                <button 
                  onClick={() => setFiltroOferta(false)}
                  className="hover:text-green-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Lista de productos */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-slate-400 text-sm mt-4">Cargando productos...</p>
        </div>
      ) : (
        <>
          {productosFiltrados.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-100">
              <p className="text-slate-500 text-xl font-medium">No se encontraron productos</p>
              <p className="text-slate-400 text-sm mt-1">Prueba con otros filtros</p>
              <button 
                onClick={() => {
                  setFiltroCategoria('todos');
                  setFiltroOferta(false);
                }}
                className="mt-4 text-purple-600 hover:text-purple-800 font-medium text-sm cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productosFiltrados.map(producto => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Productos;