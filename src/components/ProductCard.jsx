const ProductCard = ({ producto }) => {
  const calcularPrecioConDescuento = () => {
    if (producto.oferta && producto.descuento) {
      return producto.precio - (producto.precio * producto.descuento / 100);
    }
    return producto.precio;
  };

  const obtenerRutaImagen = () => {
    const nombreArchivo = producto.imagen.split('/').pop();
    // En desarrollo: /assets/img/nombre.jpg
    // En producción (GitHub Pages): /fashion-store-react/assets/img/nombre.jpg
    const basePath = import.meta.env.BASE_URL || '/';
    return `${basePath}assets/img/${nombreArchivo}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img 
          src={obtenerRutaImagen()} 
          alt={producto.nombre}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/300x200/808080/FFFFFF?text=${producto.nombre}`;
          }}
        />
        {producto.oferta && (
          <span className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            OFERTA
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {producto.nombre}
        </h3>
        
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-gray-600 text-sm">Categoría: {producto.categoria}</span>
          </div>
          <span className="text-sm text-gray-600">Stock: {producto.stock}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            {producto.oferta ? (
              <div>
                <span className="text-gray-400 line-through text-sm">
                  S/{producto.precio}
                </span>
                <span className="text-green-600 font-bold text-lg ml-2">
                  S/{calcularPrecioConDescuento().toFixed(2)}
                </span>
                {producto.descuento && (
                  <span className="block text-xs text-red-600">
                    {producto.descuento}% descuento
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-800 font-bold text-lg">
                S/{producto.precio}
              </span>
            )}
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm">
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;


