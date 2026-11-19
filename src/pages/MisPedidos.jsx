import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  PackageCheck,
  ShoppingBag,
  Calendar,
  RotateCw,
  AlertCircle,
  Eye,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useAuthCliente } from "../context/AuthClienteContext";
import { obtenerPedidosCliente, ESTADOS_PEDIDO } from "../services/pedidosService";
import DetallePedidoModal from "../components/DetallePedidoModal";

// Configuración de estilo y badges según el estado del pedido
export const ESTADO_CONFIG = {
  [ESTADOS_PEDIDO.PENDIENTE]: {
    label: "Pendiente",
    bg: "bg-amber-50 text-amber-800 border-amber-300",
    dot: "bg-amber-500",
  },
  [ESTADOS_PEDIDO.EN_PREPARACION]: {
    label: "En preparación",
    bg: "bg-blue-50 text-blue-800 border-blue-300",
    dot: "bg-blue-500",
  },
  [ESTADOS_PEDIDO.ENVIADO]: {
    label: "Enviado",
    bg: "bg-purple-50 text-purple-800 border-purple-300",
    dot: "bg-purple-500",
  },
  [ESTADOS_PEDIDO.ENTREGADO]: {
    label: "Entregado",
    bg: "bg-emerald-50 text-emerald-800 border-emerald-300",
    dot: "bg-emerald-500",
  },
};

const MisPedidos = () => {
  const { cliente, autenticado } = useAuthCliente();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const cargarPedidos = async () => {
    if (!cliente?.id) {
      setCargando(false);
      return;
    }
    try {
      setCargando(true);
      setError(null);
      const datos = await obtenerPedidosCliente(cliente.id);
      setPedidos(datos);
    } catch (err) {
      setError(err.message || "Error al cargar pedidos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (autenticado) {
      cargarPedidos();
    } else {
      setCargando(false);
    }
  }, [autenticado, cliente?.id]);

  const pedidosFiltrados = useMemo(() => {
    if (filtroEstado === "TODOS") return pedidos;
    return pedidos.filter((p) => p.estado === filtroEstado);
  }, [pedidos, filtroEstado]);

  const formatearFecha = (fechaStr) => {
    const f = new Date(fechaStr);
    if (isNaN(f.getTime())) return "Fecha no disponible";
    return f.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Si no ha iniciado sesión
  if (!autenticado) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-slate-100">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Inicia sesión</h2>
          <p className="text-slate-600 mb-6">
            Para consultar tus compras anteriores y conocer el estado actual de cada pedido, debes ingresar a tu cuenta.
          </p>
          <Link
            to="/login-cliente"
            className="inline-flex items-center justify-center gap-2 w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-700 transition"
          >
            Iniciar sesión ahora
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <PackageCheck className="w-8 h-8 text-purple-600" />
              Mis pedidos
            </h1>
            <p className="text-slate-500 mt-1">
              Consulta tus compras y sigue el estado de entrega en tiempo real.
            </p>
          </div>

          <button
            onClick={cargarPedidos}
            disabled={cargando}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition shadow-sm font-medium self-start disabled:opacity-50 cursor-pointer"
            title="Sincronizar cambios"
          >
            <RotateCw className={`w-4 h-4 ${cargando ? "animate-spin text-purple-600" : ""}`} />
            Actualizar
          </button>
        </div>

        {/* Filtros por estado */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-2">
            <Filter className="w-3.5 h-3.5" /> Estado:
          </span>
          {["TODOS", ...Object.values(ESTADOS_PEDIDO)].map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                filtroEstado === est
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {est === "TODOS" ? "Todos los pedidos" : est}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Cargando */}
        {cargando && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Estado Vacío */}
        {!cargando && pedidosFiltrados.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {pedidos.length === 0 ? "Aún no tienes pedidos registrados" : "No hay pedidos con este estado"}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {pedidos.length === 0
                ? "Explora nuestra tienda de moda y realiza tu primera compra hoy mismo."
                : "Prueba seleccionando otro estado en el filtro superior."}
            </p>
            {pedidos.length === 0 && (
              <Link
                to="/productos"
                className="inline-flex items-center gap-2 bg-purple-600 text-white font-medium py-2.5 px-6 rounded-xl hover:bg-purple-700 transition"
              >
                Ver catálogo
              </Link>
            )}
          </div>
        )}

        {/* Listado de Pedidos */}
        {!cargando && pedidosFiltrados.length > 0 && (
          <div className="space-y-4">
            {pedidosFiltrados.map((pedido) => {
              const cfg = ESTADO_CONFIG[pedido.estado] || ESTADO_CONFIG[ESTADOS_PEDIDO.PENDIENTE];
              const totalItems = (pedido.items || []).reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0);

              return (
                <div
                  key={pedido.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                >
                  <div className="space-y-3 flex-grow">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-slate-900 text-lg">
                        Pedido #{String(pedido.id).slice(-8)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatearFecha(pedido.fecha)}
                      </span>
                      <span>•</span>
                      <span>{totalItems} prenda(s)</span>
                    </div>

                    {/* Resumen de items */}
                    <div className="text-sm text-slate-600">
                      {(pedido.items || []).map((it, idx) => (
                        <span key={idx}>
                          {it.nombre} <strong className="text-slate-800">x{it.cantidad}</strong>
                          {idx < pedido.items.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Total y Acción */}
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className="block text-xs text-slate-400 font-medium uppercase">Total</span>
                      <span className="text-2xl font-bold text-purple-700">
                        S/ {Number(pedido.total || 0).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => setPedidoSeleccionado(pedido)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl font-medium text-sm transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      Ver detalles
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalle Completo de la Compra */}
      {pedidoSeleccionado && (
        <DetallePedidoModal
          pedido={pedidoSeleccionado}
          onClose={() => setPedidoSeleccionado(null)}
        />
      )}
    </div>
  );
};

export default MisPedidos;
