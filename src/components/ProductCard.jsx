import { ShoppingCart, Tag } from 'lucide-react';

const ProductCard = ({ producto }) => {
  const calcularPrecioConDescuento = () => {
    if (producto.oferta && producto.descuento) {
      return producto.precio - (producto.precio * producto.descuento / 100);
    }
    return producto.precio;
  };

  const obtenerRutaImagen = () => {
    const nombreArchivo = producto.imagen.split('/').pop();
    return `/assets/img/${nombreArchivo}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full border border-slate-100">
      <div className="relative w-full h-56 bg-slate-50">
        <img 
          src={obtenerRutaImagen()} 
          alt={producto.nombre}
          className="w-full h-full object-contain p-4"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/300x200/808080/FFFFFF?text=${producto.nombre}`;
          }}
        />
        {producto.oferta && (
          <span className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Tag className="w-3 h-3" />
            OFERTA
          </span>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-1">
          {producto.nombre}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-slate-500 text-sm">{producto.categoria}</span>
          </div>
          <span className="text-sm text-slate-400">Stock: {producto.stock}</span>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div>
            {producto.oferta ? (
              <div>
                <span className="text-slate-400 line-through text-sm">
                  S/{producto.precio}
                </span>
                <span className="text-purple-600 font-bold text-xl ml-2">
                  S/{calcularPrecioConDescuento().toFixed(2)}
                </span>
                {producto.descuento && (
                  <span className="block text-xs text-green-600 font-semibold">
                    -{producto.descuento}%
                  </span>
                )}
              </div>
            ) : (
              <span className="text-slate-800 font-bold text-xl">
                S/{producto.precio}
              </span>
            )}
          </div>
          <button className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-all duration-300 hover:scale-105 text-sm font-medium cursor-pointer">
            <ShoppingCart className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;


