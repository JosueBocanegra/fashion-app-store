import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthCliente } from "../context/AuthClienteContext";
import { obtenerVentasCliente } from "../services/ventasService";
import {
  ESTADOS_PEDIDO,
  normalizarEstadoPedido,
} from "../services/estadosPedido";

const formatearFecha = (fecha) => {
  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatearMonto = (monto) => `S/${(Number(monto) || 0).toFixed(2)}`;

const obtenerClaseEstado = (estado) => {
  if (estado === "Pendiente") return "bg-amber-50 text-amber-700";
  if (estado === "En preparación") return "bg-blue-50 text-blue-700";
  if (estado === "Enviado") return "bg-purple-50 text-purple-700";
  if (estado === "Entregado") return "bg-emerald-50 text-emerald-700";
  return "bg-slate-100 text-slate-600";
};

// Barra con los pasos del pedido: Pendiente -> Entregado.
const SeguimientoPedido = ({ estado }) => {
  const indiceActual = ESTADOS_PEDIDO.indexOf(estado);

  if (indiceActual === -1) return null;

  return (
    <ol className="grid grid-cols-4 gap-2 mt-5">
      {ESTADOS_PEDIDO.map((paso, indice) => {
        const alcanzado = indice <= indiceActual;

        return (
          <li key={paso} className="text-center">
            <div
              className={`h-1.5 rounded-full ${
                alcanzado ? "bg-purple-600" : "bg-slate-200"
              }`}
            />
            <p
              className={`text-xs mt-2 ${
                alcanzado ? "text-slate-800 font-semibold" : "text-slate-400"
              }`}
            >
              {paso}
            </p>
          </li>
        );
      })}
    </ol>
  );
};

const MisPedidos = () => {
  const { cliente, autenticado } = useAuthCliente();

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!autenticado || !cliente?.id) {
      setCargando(false);
      return;
    }

    const cargarPedidos = async () => {
      setCargando(true);
      setError("");

      try {
        const ventas = await obtenerVentasCliente(cliente.id);

        // Los pedidos más recientes primero.
        const ordenados = [...ventas].sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );

        setPedidos(ordenados);
      } catch (err) {
        console.error("Error cargando pedidos:", err);
        setError(
          "No se pudieron cargar tus pedidos. Intenta nuevamente en unos minutos."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarPedidos();
  }, [autenticado, cliente?.id]);

  if (!autenticado) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <h1 className="text-xl font-bold text-slate-800 mb-2">Mis pedidos</h1>
        <p className="text-slate-500 mb-6">
          Inicia sesión para ver el estado de tus compras.
        </p>
        <Link
          to="/login-cliente"
          className="inline-block bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-all"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-800">Mis pedidos</h1>
      <p className="text-slate-500 mt-1 mb-8">
        Revisa en qué estado está cada una de tus compras.
      </p>

      {error && (
        <p className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3.5">
          {error}
        </p>
      )}

      {cargando ? (
        <p className="text-slate-500">Cargando pedidos...</p>
      ) : pedidos.length === 0 && !error ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-slate-500 mb-4">Aún no tienes pedidos.</p>
          <Link
            to="/productos"
            className="text-purple-600 font-semibold hover:text-purple-700"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {pedidos.map((pedido) => {
            const estado = normalizarEstadoPedido(pedido.estado);
            const items = Array.isArray(pedido.items) ? pedido.items : [];

            return (
              <article
                key={pedido.id}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Pedido #{pedido.id}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {formatearFecha(pedido.fecha)}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${obtenerClaseEstado(
                      estado
                    )}`}
                  >
                    {estado}
                  </span>
                </div>

                <SeguimientoPedido estado={estado} />

                <ul className="mt-5 divide-y divide-slate-100 text-sm">
                  {items.map((item, indice) => (
                    <li
                      key={`${item.productoId}-${indice}`}
                      className="flex justify-between py-2 text-slate-600"
                    >
                      <span>
                        {item.nombre} x {item.cantidad}
                      </span>
                      <span>
                        {formatearMonto(item.cantidad * item.precioUnitario)}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="flex justify-between mt-3 pt-3 border-t border-slate-100 font-bold text-slate-800">
                  <span>Total</span>
                  <span className="text-purple-600">
                    {formatearMonto(pedido.total)}
                  </span>
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MisPedidos;
