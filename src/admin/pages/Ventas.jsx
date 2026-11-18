import { useEffect, useMemo, useState } from "react";
import { ventasService } from "../services/ventasService";
import { clientesService } from "../services/clientesService";

// Normaliza los estados para evitar diferencias por mayúsculas
// y mantener una presentación uniforme.
const normalizarEstado = (estado) => {
  const valor = String(estado || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es");

  const equivalencias = {
    pendiente: "Pendiente",
    "en proceso": "En proceso",
    procesando: "En proceso",
    completado: "Completado",
    completada: "Completado",
    cancelado: "Cancelado",
    cancelada: "Cancelado",
    "sin estado": "Sin estado",
  };

  return equivalencias[valor] || (
    valor ? valor.charAt(0).toUpperCase() + valor.slice(1) : "Sin estado"
  );
};

// Obtiene la fecha en formato local YYYY-MM-DD.
// Se utiliza para comparar correctamente los filtros de fecha.
const obtenerFechaLocal = (fecha) => {
  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) return "";

  const año = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");

  return `${año}-${mes}-${dia}`;
};

const obtenerTimestamp = (fecha) => {
  const timestamp = new Date(fecha).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatearFecha = (fecha) => {
  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return date.toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatearMoneda = (importe) => {
  return (Number(importe) || 0).toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });
};

// Calcula las unidades vendidas considerando las cantidades
// de cada producto, no solamente el número de líneas.
const obtenerCantidadProductos = (venta) => {
  if (!Array.isArray(venta.items)) return 0;

  return venta.items.reduce(
    (total, item) => total + (Number(item.cantidad) || 0),
    0
  );
};

// Resuelve el nombre del cliente asociado a una venta.
const obtenerNombreCliente = (venta, clientesPorId) => {
  if (!venta.clienteId) return "Sin cliente asociado";

  const cliente = clientesPorId.get(String(venta.clienteId));

  if (!cliente) return "Cliente no disponible";

  const nombreCompleto = [
    cliente.nombre,
    cliente.apellido,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return nombreCompleto || cliente.email || "Cliente sin nombre";
};

const obtenerClaseEstado = (estado) => {
  const valor = estado.toLocaleLowerCase("es");

  if (valor === "pendiente") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (valor === "en proceso") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (valor === "completado") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (valor === "cancelado") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  return "bg-stone-100 text-neutral-600 border-stone-200";
};

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Carga ventas y clientes para relacionar cada operación
  // con su correspondiente registro de cliente.
  const cargarVentas = async () => {
    setLoading(true);
    setError("");

    try {
      const [ventasData, clientesData] = await Promise.all([
        ventasService.obtenerVentas(),
        clientesService.obtenerClientes(),
      ]);

      setVentas(Array.isArray(ventasData) ? ventasData : []);
      setClientes(Array.isArray(clientesData) ? clientesData : []);
    } catch (err) {
      console.error("Error cargando ventas:", err);

      setError(
        "No se pudo cargar el listado de ventas. Verifica que JSON Server esté ejecutándose."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  // Relaciona los clientes por su identificador.
  const clientesPorId = useMemo(() => {
    return new Map(
      clientes
        .filter((cliente) => cliente?.id != null)
        .map((cliente) => [String(cliente.id), cliente])
    );
  }, [clientes]);

  // Obtiene los estados que existen realmente en los registros.
  const estadosDisponibles = useMemo(() => {
    const estados = ventas.map((venta) =>
      normalizarEstado(venta.estado)
    );

    return [...new Set(estados)].sort((a, b) =>
      a.localeCompare(b, "es")
    );
  }, [ventas]);

  // Aplica búsqueda, filtros y ordenamiento.
  const ventasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es");

    return [...ventas]
      .filter((venta) => {
        const nombreCliente = obtenerNombreCliente(
          venta,
          clientesPorId
        );

        const cliente = clientesPorId.get(
          String(venta.clienteId || "")
        );

        // Búsqueda por código, cliente o correo.
        const textoBusqueda = [
          venta.id,
          venta.clienteId,
          nombreCliente,
          cliente?.email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("es");

        const coincideBusqueda =
          !termino || textoBusqueda.includes(termino);

        // Filtro por estado normalizado.
        const estadoVenta = normalizarEstado(venta.estado);

        const coincideEstado =
          !filtroEstado || estadoVenta === filtroEstado;

        // Filtros de fecha inclusivos.
        const fechaVenta = obtenerFechaLocal(venta.fecha);

        const coincideDesde =
          !fechaDesde ||
          (fechaVenta && fechaVenta >= fechaDesde);

        const coincideHasta =
          !fechaHasta ||
          (fechaVenta && fechaVenta <= fechaHasta);

        return (
          coincideBusqueda &&
          coincideEstado &&
          coincideDesde &&
          coincideHasta
        );
      })
      .sort(
        (a, b) =>
          obtenerTimestamp(b.fecha) - obtenerTimestamp(a.fecha)
      );
  }, [
    ventas,
    clientesPorId,
    busqueda,
    filtroEstado,
    fechaDesde,
    fechaHasta,
  ]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("");
    setFechaDesde("");
    setFechaHasta("");
  };

  return (
    <div>
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-light text-neutral-900 tracking-tight">
            Gestión de ventas
          </h1>

          <p className="text-neutral-500 text-sm mt-1">
            Consulta y revisa las compras realizadas en Fashion Store.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarVentas}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-medium
                     bg-[#8a5a63] hover:bg-[#754b53] transition-colors
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Actualizando..." : "↻ Actualizar ventas"}
        </button>
      </div>

      {/* Filtros */}
      <section className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="xl:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Buscar venta o cliente
            </label>

            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Código de venta, nombre o correo..."
              className="w-full px-4 py-2.5 bg-white border border-stone-200
                         rounded-xl text-sm text-neutral-800
                         placeholder-neutral-400 focus:outline-none
                         focus:border-[#8a5a63] focus:ring-4
                         focus:ring-[#8a5a63]/10 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Estado
            </label>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-stone-200
                         rounded-xl text-sm text-neutral-700
                         focus:outline-none focus:border-[#8a5a63]
                         focus:ring-4 focus:ring-[#8a5a63]/10 transition"
            >
              <option value="">Todos los estados</option>

              {estadosDisponibles.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Desde
            </label>

            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-stone-200
                         rounded-xl text-sm text-neutral-700
                         focus:outline-none focus:border-[#8a5a63]
                         focus:ring-4 focus:ring-[#8a5a63]/10 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Hasta
            </label>

            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              min={fechaDesde || undefined}
              className="w-full px-3 py-2.5 bg-white border border-stone-200
                         rounded-xl text-sm text-neutral-700
                         focus:outline-none focus:border-[#8a5a63]
                         focus:ring-4 focus:ring-[#8a5a63]/10 transition"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={limpiarFiltros}
              className="px-3 py-2.5 text-sm font-medium text-neutral-600
                         rounded-xl hover:bg-stone-100 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </section>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 bg-rose-50 border border-rose-200
                        text-rose-800 text-sm rounded-xl p-3.5
                        flex flex-col sm:flex-row sm:items-center
                        sm:justify-between gap-3">
          <span>{error}</span>

          <button
            type="button"
            onClick={cargarVentas}
            disabled={loading}
            className="font-semibold text-rose-700 hover:text-rose-900
                       disabled:opacity-50"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Resumen del listado */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs text-neutral-500">
          Mostrando{" "}
          <span className="font-semibold text-neutral-700">
            {ventasFiltradas.length}
          </span>{" "}
          de {ventas.length} ventas
        </p>
      </div>

      {/* Tabla de ventas */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            Cargando ventas...
          </div>
        ) : ventasFiltradas.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-neutral-700">
              {ventas.length === 0
                ? "Aún no hay ventas registradas."
                : "No se encontraron ventas con los filtros aplicados."}
            </p>

            {ventas.length > 0 && (
              <p className="text-xs text-neutral-400 mt-1">
                Prueba modificando los criterios de búsqueda.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-sm">
              <thead>
                <tr className="bg-stone-50 text-neutral-500 text-left
                               uppercase text-xs tracking-wider">
                  <th className="px-5 py-3">Venta</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3 text-center">Productos</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-center">Estado</th>
                </tr>
              </thead>

              <tbody>
                {ventasFiltradas.map((venta, index) => {
                  const estado = normalizarEstado(venta.estado);

                  return (
                    <tr
                      key={venta.id ?? `${venta.fecha}-${index}`}
                      className="border-t border-stone-100
                                 hover:bg-stone-50/70 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-neutral-800">
                          #{venta.id || "Sin código"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-neutral-600">
                        {formatearFecha(venta.fecha)}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-medium text-neutral-800">
                          {obtenerNombreCliente(venta, clientesPorId)}
                        </span>

                        {clientesPorId.get(
                          String(venta.clienteId || "")
                        )?.email && (
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {
                              clientesPorId.get(
                                String(venta.clienteId)
                              ).email
                            }
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-center text-neutral-600">
                        {obtenerCantidadProductos(venta)}
                      </td>

                      <td className="px-5 py-3.5 text-right font-semibold text-neutral-800">
                        {formatearMoneda(venta.total)}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1
                                      rounded-full border text-xs font-medium
                                      ${obtenerClaseEstado(estado)}`}
                        >
                          {estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ventas;


