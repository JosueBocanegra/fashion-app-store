import { X, CheckCircle2, Clock, Truck, Package, Calendar } from "lucide-react";
import { ESTADOS_PEDIDO } from "../services/pedidosService";

const PASOS = [
  { estado: ESTADOS_PEDIDO.PENDIENTE, label: "Pendiente", icon: Clock },
  { estado: ESTADOS_PEDIDO.EN_PREPARACION, label: "En preparación", icon: Package },
  { estado: ESTADOS_PEDIDO.ENVIADO, label: "Enviado", icon: Truck },
  { estado: ESTADOS_PEDIDO.ENTREGADO, label: "Entregado", icon: CheckCircle2 },
];

const DetallePedidoModal = ({ pedido, onClose }) => {
  if (!pedido) return null;

  const indiceActual = PASOS.findIndex((p) => p.estado === pedido.estado);

  const formatearFecha = (fechaStr) => {
    const f = new Date(fechaStr);
    if (isNaN(f.getTime())) return "Fecha no disponible";
    return f.toLocaleString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 p-6 text-white flex items-center justify-between">
          <div>
            <span className="text-purple-300 text-xs font-semibold uppercase tracking-wider">
              Detalle de compra
            </span>
            <h2 className="text-xl font-bold">
              Pedido #{String(pedido.id).slice(-8)}
            </h2>
            <p className="text-white/70 text-xs mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatearFecha(pedido.fecha)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Stepper / Seguimiento de estados horizontal compacto */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Seguimiento del pedido
            </h3>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between gap-1 sm:gap-2">
                {PASOS.map((paso, idx) => {
                  const Icono = paso.icon;
                  const completado = idx <= indiceActual;
                  const esActual = idx === indiceActual;

                  return (
                    <div
                      key={paso.estado}
                      className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 last:flex-initial"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                            completado
                              ? "bg-purple-600 text-white shadow-sm"
                              : "bg-slate-200 text-slate-400"
                          } ${esActual ? "ring-2 ring-purple-300 ring-offset-1" : ""}`}
                        >
                          <Icono className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className={`text-xs whitespace-nowrap ${
                            esActual
                              ? "font-bold text-purple-700"
                              : completado
                              ? "font-semibold text-slate-700"
                              : "text-slate-400"
                          }`}
                        >
                          {paso.label}
                        </span>
                      </div>

                      {idx < PASOS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-1 transition-all ${
                            idx < indiceActual ? "bg-purple-500" : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tabla de Productos Comprados */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Prendas adquiridas
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {(pedido.items || []).map((item, idx) => {
                const precio = Number(item.precioUnitario || 0);
                const subtotal = Number(
                  item.subtotal || precio * (item.cantidad || 1)
                );

                return (
                  <div
                    key={idx}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">
                        {item.nombre}
                      </h4>
                      <p className="text-xs text-slate-500">
                        S/ {precio.toFixed(2)} × {item.cantidad} unidad(es)
                      </p>
                    </div>
                    <span className="font-bold text-slate-800 text-sm">
                      S/ {subtotal.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen Total */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
            <span className="font-bold text-slate-700">Total pagado</span>
            <span className="text-2xl font-bold text-purple-700">
              S/ {Number(pedido.total || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Pie */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-900 transition text-sm cursor-pointer"
          >
            Cerrar detalle
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetallePedidoModal;
