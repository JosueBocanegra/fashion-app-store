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
    "en preparación": "En preparación",
    "en preparacion": "En preparación",
    preparacion: "En preparación",
    "en proceso": "En preparación",
    procesando: "En preparación",
    enviado: "Enviado",
    entregado: "Entregado",
    completado: "Entregado",
    completada: "Entregado",
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

// Utiliza el subtotal guardado o lo calcula para ventas antiguas.
const obtenerSubtotalItem = (item) => {
  const tieneSubtotal =
    item?.subtotal !== undefined &&
    item?.subtotal !== null &&
    item?.subtotal !== "";

  if (tieneSubtotal && Number.isFinite(Number(item.subtotal))) {
    return Number(item.subtotal);
  }

  return (
    (Number(item?.cantidad) || 0) *
    (Number(item?.precioUnitario) || 0)
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
  const valor = String(estado || "").toLocaleLowerCase("es");

  if (valor === "pendiente") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (
    valor === "en preparación" ||
    valor === "en preparacion" ||
    valor === "en proceso"
  ) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (valor === "enviado") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (valor === "entregado" || valor === "completado") {
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
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  const manejarCambioEstado = async (ventaId, nuevoEstado) => {
    try {
      setActualizandoEstado(true);
      await ventasService.actualizarEstadoVenta(ventaId, nuevoEstado);

      setVentas((prev) =>
        prev.map((v) =>
          String(v.id) === String(ventaId)
            ? { ...v, estado: nuevoEstado }
            : v
        )
      );

      if (
        ventaSeleccionada &&
        String(ventaSeleccionada.id) === String(ventaId)
      ) {
        setVentaSeleccionada((prev) => ({
          ...prev,
          estado: nuevoEstado,
        }));
      }
    } catch (err) {
      console.error("Error al actualizar estado de la venta:", err);
      alert("No se pudo actualizar el estado de la venta.");
    } finally {
      setActualizandoEstado(false);
    }
  };

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

  const clienteVentaSeleccionada = ventaSeleccionada?.clienteId
    ? clientesPorId.get(String(ventaSeleccionada.clienteId)) || null
    : null;

  const itemsVentaSeleccionada = Array.isArray(ventaSeleccionada?.items)
    ? ventaSeleccionada.items
    : [];

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
            <table className="w-full min-w-[950px] text-sm">
              <thead>
                <tr className="bg-stone-50 text-neutral-500 text-left
                               uppercase text-xs tracking-wider">
                  <th className="px-5 py-3">Venta</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3 text-center">Productos</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-center">Estado</th>
                  <th className="px-5 py-3 text-center">Acciones</th>
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

                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setVentaSeleccionada(venta)}
                          className="text-[#8a5a63] hover:text-[#754b53]
                                    font-semibold text-xs transition-colors"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalle de venta */}
      {ventaSeleccionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
                     p-4 bg-black/45 backdrop-blur-xs"
          onClick={() => setVentaSeleccionada(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-stone-200
                       w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detalle-venta-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado */}
            <div className="px-6 py-5 border-b border-stone-100
                            flex items-start justify-between gap-4"
            >
              <div>
                <h2
                  id="detalle-venta-titulo"
                  className="text-xl font-semibold text-neutral-900"
                >
                  Detalle de venta
                </h2>

                <p className="text-sm text-neutral-500 mt-1">
                  Información completa de la operación.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setVentaSeleccionada(null)}
                aria-label="Cerrar detalle"
                className="w-9 h-9 rounded-lg flex items-center
                           justify-center text-neutral-500
                           hover:bg-stone-100 hover:text-neutral-900
                           transition-colors text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Información general */}
              <section>
                <div className="flex flex-col sm:flex-row
                                sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">
                      Código de venta
                    </p>

                    <p className="text-lg font-bold text-neutral-900">
                      #{ventaSeleccionada.id || "Sin código"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs text-neutral-500 font-medium">
                      Cambiar estado:
                    </span>
                    <select
                      value={normalizarEstado(ventaSeleccionada.estado)}
                      onChange={(e) =>
                        manejarCambioEstado(
                          ventaSeleccionada.id,
                          e.target.value
                        )
                      }
                      disabled={actualizandoEstado}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-[#8a5a63] disabled:opacity-50 ${obtenerClaseEstado(
                        normalizarEstado(ventaSeleccionada.estado)
                      )}`}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En preparación">En preparación</option>
                      <option value="Enviado">Enviado</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                  <div className="bg-stone-50 rounded-xl p-4">
                    <p className="text-xs text-neutral-500">
                      Fecha de compra
                    </p>

                    <p className="text-sm font-medium text-neutral-800 mt-1">
                      {formatearFecha(ventaSeleccionada.fecha)}
                    </p>
                  </div>

                  <div className="bg-stone-50 rounded-xl p-4">
                    <p className="text-xs text-neutral-500">
                      Cantidad de productos
                    </p>

                    <p className="text-sm font-medium text-neutral-800 mt-1">
                      {obtenerCantidadProductos(ventaSeleccionada)} unidades
                    </p>
                  </div>
                </div>
              </section>

              {/* Datos del cliente */}
              <section>
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-neutral-900">
                    Información del cliente
                  </h3>

                  <p className="text-xs text-neutral-500 mt-0.5">
                    Datos asociados a la compra.
                  </p>
                </div>

                <div className="border border-stone-200 rounded-xl p-4">
                  <div className="mb-4">
                    <p className="text-xs text-neutral-500">
                      Nombre completo
                    </p>

                    <p className="text-sm font-semibold text-neutral-800 mt-1">
                      {obtenerNombreCliente(
                        ventaSeleccionada,
                        clientesPorId
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-neutral-500">
                        Correo electrónico
                      </p>

                      <p className="text-sm text-neutral-700 mt-1 break-all">
                        {clienteVentaSeleccionada?.email || "No registrado"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-neutral-500">
                        Teléfono
                      </p>

                      <p className="text-sm text-neutral-700 mt-1">
                        {clienteVentaSeleccionada?.telefono || "No registrado"}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-xs text-neutral-500">
                        Dirección
                      </p>

                      <p className="text-sm text-neutral-700 mt-1">
                        {clienteVentaSeleccionada?.direccion || "No registrada"}
                      </p>
                    </div>
                  </div>

                  {!clienteVentaSeleccionada && (
                    <p className="text-xs text-amber-700 mt-3
                                  bg-amber-50 border border-amber-100
                                  rounded-lg p-2.5"
                    >
                      No se encontró el registro del cliente relacionado
                      con esta venta.
                    </p>
                  )}
                </div>
              </section>

              {/* Productos adquiridos */}
              <section>
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-neutral-900">
                    Productos adquiridos
                  </h3>

                  <p className="text-xs text-neutral-500 mt-0.5">
                    Detalle de los artículos incluidos en la operación.
                  </p>
                </div>

                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  {itemsVentaSeleccionada.length === 0 ? (
                    <p className="p-5 text-sm text-neutral-500 text-center">
                      Esta venta no tiene productos registrados.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-sm">
                        <thead>
                          <tr className="bg-stone-50 text-neutral-500
                                         text-xs uppercase tracking-wider
                                         text-left"
                          >
                            <th className="px-4 py-3">Producto</th>
                            <th className="px-4 py-3 text-center">
                              Cantidad
                            </th>
                            <th className="px-4 py-3 text-right">
                              Precio unitario
                            </th>
                            <th className="px-4 py-3 text-right">
                              Subtotal
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {itemsVentaSeleccionada.map((item, index) => (
                            <tr
                              key={`${item.productoId || "producto"}-${index}`}
                              className="border-t border-stone-100"
                            >
                              <td className="px-4 py-3 text-neutral-800
                                             font-medium"
                              >
                                {item.nombre ||
                                  `Producto ${item.productoId || index + 1}`}
                              </td>

                              <td className="px-4 py-3 text-center
                                             text-neutral-600"
                              >
                                {Number(item.cantidad) || 0}
                              </td>

                              <td className="px-4 py-3 text-right
                                             text-neutral-600"
                              >
                                {formatearMoneda(item.precioUnitario)}
                              </td>

                              <td className="px-4 py-3 text-right
                                             font-medium text-neutral-800"
                              >
                                {formatearMoneda(
                                  obtenerSubtotalItem(item)
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>

              {/* Total */}
              <section className="bg-stone-50 border border-stone-200
                                  rounded-xl p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-neutral-600">
                    Total de la venta
                  </span>

                  <span className="text-xl font-bold text-[#8a5a63]">
                    {formatearMoneda(ventaSeleccionada.total)}
                  </span>
                </div>
              </section>
            </div>

            {/* Pie */}
            <div className="px-6 py-4 border-t border-stone-100
                            flex justify-end"
            >
              <button
                type="button"
                onClick={() => setVentaSeleccionada(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium
                           text-neutral-700 bg-stone-100
                           hover:bg-stone-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Ventas;


