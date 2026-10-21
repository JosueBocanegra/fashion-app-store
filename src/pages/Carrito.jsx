import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCarrito } from "../context/CarritoContext";

const Carrito = () => {
  const {
    carrito,
    eliminarDelCarrito,
    cambiarCantidad,
    vaciarCarrito,
    totalCarrito,
  } = useCarrito();

  if (carrito.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-100 p-6 rounded-full">
              <ShoppingBag className="w-16 h-16 text-purple-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-800 mb-3">
            Tu carrito está vacío
          </h1>

          <p className="text-slate-500 mb-6">
            Agrega algunos productos para comenzar tu compra.
          </p>

          <Link
            to="/productos"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="container mx-auto max-w-6xl">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Mi carrito
            </h1>
            <p className="text-slate-500 mt-1">
              Revisa los productos que deseas comprar
            </p>
          </div>

          <button
            onClick={vaciarCarrito}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            Vaciar carrito
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* PRODUCTOS */}
          <div className="lg:col-span-2 space-y-4">

            {carrito.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-2xl shadow-md p-5 flex flex-col sm:flex-row gap-5"
              >

                {/* Imagen */}
                <div className="w-full sm:w-32 h-32 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={
                      producto.imagen?.startsWith("http")
                        ? producto.imagen
                        : `/assets/img/${producto.imagen?.split("/").pop()}`
                    }
                    alt={producto.nombre}
                    className="w-full h-full object-contain p-3"
                  />
                </div>

                {/* Información */}
                <div className="flex-grow">

                  <div className="flex justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">
                        {producto.nombre}
                      </h2>

                      <p className="text-sm text-slate-500">
                        {producto.categoria}
                      </p>
                    </div>

                    <button
                      onClick={() => eliminarDelCarrito(producto.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    {/* Precio */}
                    <div>
                      <span className="text-purple-600 font-bold text-xl">
                        S/{Number(producto.precioFinal).toFixed(2)}
                      </span>

                      {producto.oferta && (
                        <span className="ml-2 text-sm text-slate-400 line-through">
                          S/{Number(producto.precio).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Cantidad */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden w-fit">

                      <button
                        onClick={() =>
                          cambiarCantidad(
                            producto.id,
                            producto.cantidad - 1
                          )
                        }
                        disabled={producto.cantidad <= 1}
                        className="p-2 hover:bg-slate-100 disabled:opacity-40"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="px-4 font-semibold">
                        {producto.cantidad}
                      </span>

                      <button
                        onClick={() =>
                          cambiarCantidad(
                            producto.id,
                            producto.cantidad + 1
                          )
                        }
                        disabled={
                          producto.cantidad >= Number(producto.stock)
                        }
                        className="p-2 hover:bg-slate-100 disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                    </div>

                    {/* Subtotal */}
                    <div className="font-bold text-slate-800">
                      S/{
                        (
                          producto.precioFinal * producto.cantidad
                        ).toFixed(2)
                      }
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RESUMEN */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">

              <h2 className="text-xl font-bold text-slate-800 mb-6">
                Resumen de compra
              </h2>

              <div className="flex justify-between text-slate-600 mb-3">
                <span>Productos</span>
                <span>{carrito.reduce((total, item) => total + item.cantidad, 0)}</span>
              </div>

              <div className="flex justify-between text-slate-600 mb-5">
                <span>Subtotal</span>
                <span>S/{totalCarrito.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-200 pt-5 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-800">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-purple-600">
                    S/{totalCarrito.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all"
                onClick={() => alert("Funcionalidad de compra próximamente")}
              >
                Continuar compra
              </button>

              <Link
                to="/productos"
                className="mt-3 w-full flex items-center justify-center gap-2 text-purple-600 py-3 rounded-xl font-medium hover:bg-purple-50 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Seguir comprando
              </Link>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Carrito;