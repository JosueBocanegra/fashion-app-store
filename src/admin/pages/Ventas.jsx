
import { useEffect, useMemo, useState } from "react";
import { ventasService } from "../services/ventasService";
import { clientesService } from "../services/clientesService";
import "../styles/modulos.css";

/* =========================================================
   FUNCIONES AUXILIARES
   ========================================================= */

// Normaliza los estados para evitar diferencias por mayúsculas.
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

  return (
    equivalencias[valor] ||
    (valor
      ? valor.charAt(0).toUpperCase() + valor.slice(1)
      : "Sin estado")
  );
};

// Obtiene la fecha local YYYY-MM-DD.
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

// Calcula las unidades vendidas considerando las cantidades.
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

// Devuelve la clase visual según el estado de la venta.
const obtenerClaseEstado = (estado) => {
  const valor = String(estado || "")
    .trim()
    .toLocaleLowerCase("es");

  if (valor === "pendiente") {
    return "admin-pill--pending";
  }

  if (
    valor === "en preparación" ||
    valor === "en preparacion" ||
    valor === "en proceso"
  ) {
    return "admin-pill--preparing";
  }

  if (valor === "enviado") {
    return "admin-pill--shipped";
  }

  if (valor === "entregado" || valor === "completado") {
    return "admin-pill--delivered";
  }

  if (valor === "cancelado" || valor === "cancelada") {
    return "admin-pill--cancelled";
  }

  return "admin-pill--unknown";
};

/* =========================================================
   COMPONENTE PRINCIPAL
   ========================================================= */

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros.
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Detalle y actualización de estado.
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  /* =====================================================
     ACTUALIZACIÓN DEL ESTADO DE UNA VENTA
     ===================================================== */

  const manejarCambioEstado = async (ventaId, nuevoEstado) => {
    try {
      setActualizandoEstado(true);

      await ventasService.actualizarEstadoVenta(
        ventaId,
        nuevoEstado
      );

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
      console.error(
        "Error al actualizar estado de la venta:",
        err
      );

      alert("No se pudo actualizar el estado de la venta.");
    } finally {
      setActualizandoEstado(false);
    }
  };

  /* =====================================================
     CARGA DE VENTAS Y CLIENTES
     ===================================================== */

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

  /* =====================================================
     RELACIÓN DE CLIENTES
     ===================================================== */

  const clientesPorId = useMemo(() => {
    return new Map(
      clientes
        .filter((cliente) => cliente?.id != null)
        .map((cliente) => [String(cliente.id), cliente])
    );
  }, [clientes]);

  /* =====================================================
     ESTADOS DISPONIBLES
     ===================================================== */

  const estadosDisponibles = useMemo(() => {
    const estados = ventas.map((venta) =>
      normalizarEstado(venta.estado)
    );

    return [...new Set(estados)].sort((a, b) =>
      a.localeCompare(b, "es")
    );
  }, [ventas]);

  /* =====================================================
     BÚSQUEDA Y FILTROS
     ===================================================== */

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

  /* =====================================================
     LIMPIEZA DE FILTROS
     ===================================================== */

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("");
    setFechaDesde("");
    setFechaHasta("");
  };

  const hayFiltrosActivos = Boolean(
    busqueda || filtroEstado || fechaDesde || fechaHasta
  );

  /* =====================================================
     INFORMACIÓN DE LA VENTA SELECCIONADA
     ===================================================== */

  const clienteVentaSeleccionada = ventaSeleccionada?.clienteId
    ? clientesPorId.get(String(ventaSeleccionada.clienteId)) || null
    : null;

  const itemsVentaSeleccionada = Array.isArray(
    ventaSeleccionada?.items
  )
    ? ventaSeleccionada.items
    : [];

  /* =====================================================
     INTERFAZ
     ===================================================== */

  return (
    <main className="admin-module-page">
      {/* Encabezado */}
      <header className="admin-page-heading">
        <div>
          <p className="admin-page-heading__eyebrow">
            Operaciones comerciales
          </p>

          <h1 className="admin-page-heading__title">
            Gestión de ventas
          </h1>

          <p className="admin-page-heading__description">
            Consulta las compras realizadas, revisa sus detalles
            y administra el estado de cada venta.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarVentas}
          disabled={loading}
          className="admin-secondary-button"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7v5h-5M4 17v-5h5"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.6 9a7 7 0 0 1 11.8-2L20 12M4 12l2.6 5a7 7 0 0 0 11.8-2"
            />
          </svg>

          {loading ? "Actualizando..." : "Actualizar ventas"}
        </button>
      </header>

      {/* Filtros */}
      <section className="admin-toolbar">
        <div className="admin-toolbar__search">
          <label
            htmlFor="ventas-busqueda"
            className="admin-form-label"
          >
            Buscar venta o cliente
          </label>

          <span className="admin-search-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path
                strokeLinecap="round"
                d="m16 16 4 4"
              />
            </svg>
          </span>

          <input
            id="ventas-busqueda"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Código, nombre o correo..."
            className="admin-field-control admin-search-input"
          />
        </div>

        <div className="admin-toolbar__filters">
          <div style={{ minWidth: "145px" }}>
            <label
              htmlFor="ventas-estado"
              className="admin-form-label"
            >
              Estado
            </label>

            <select
              id="ventas-estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="admin-field-control"
            >
              <option value="">Todos los estados</option>

              {estadosDisponibles.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: "145px" }}>
            <label
              htmlFor="ventas-fecha-desde"
              className="admin-form-label"
            >
              Desde
            </label>

            <input
              id="ventas-fecha-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="admin-field-control"
            />
          </div>

          <div style={{ minWidth: "145px" }}>
            <label
              htmlFor="ventas-fecha-hasta"
              className="admin-form-label"
            >
              Hasta
            </label>

            <input
              id="ventas-fecha-hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              min={fechaDesde || undefined}
              className="admin-field-control"
            />
          </div>

          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="admin-clear-filter"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </section>

      {/* Error de carga */}
      {error && (
        <div className="admin-alert admin-alert--error" role="alert">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path
              strokeLinecap="round"
              d="M12 8v4m0 4h.01"
            />
          </svg>

          <span style={{ flex: 1 }}>{error}</span>

          <button
            type="button"
            onClick={cargarVentas}
            disabled={loading}
            style={{
              color: "#702d40",
              fontWeight: 700,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Resumen del listado */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "13px",
        }}
      >
        <p style={{ color: "#827970", fontSize: "11px" }}>
          Mostrando{" "}
          <strong style={{ color: "#292522" }}>
            {ventasFiltradas.length}
          </strong>{" "}
          de {ventas.length} ventas
        </p>
      </div>

      {/* Tabla de ventas */}
      <section className="admin-table-card">
        {loading ? (
          <div className="admin-loading-state">
            <div className="admin-spinner" />
            Cargando ventas...
          </div>
        ) : ventasFiltradas.length === 0 ? (
          <div className="admin-empty-state">
            <p className="admin-empty-state__title">
              {ventas.length === 0
                ? "Aún no hay ventas registradas"
                : "No se encontraron ventas"}
            </p>

            <p>
              {ventas.length === 0
                ? "Las compras registradas aparecerán en esta sección."
                : "Prueba modificando los criterios de búsqueda."}
            </p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-data-table admin-sales-table">
              <thead>
                <tr>
                  <th>Venta</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th style={{ textAlign: "center" }}>Productos</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                  <th style={{ textAlign: "center" }}>Estado</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {ventasFiltradas.map((venta, index) => {
                  const estado = normalizarEstado(venta.estado);

                  return (
                    <tr
                      key={venta.id ?? `${venta.fecha}-${index}`}
                    >
                      <td>
                        <span className="admin-table-primary-text">
                          #{venta.id || "Sin código"}
                        </span>
                      </td>

                      <td>{formatearFecha(venta.fecha)}</td>

                      <td>
                        <span className="admin-table-primary-text">
                          {obtenerNombreCliente(venta, clientesPorId)}
                        </span>

                        {clientesPorId.get(
                          String(venta.clienteId || "")
                        )?.email && (
                          <span className="admin-table-secondary-text">
                            {
                              clientesPorId.get(
                                String(venta.clienteId)
                              ).email
                            }
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: "center" }}>
                        {obtenerCantidadProductos(venta)}
                      </td>

                      <td
                        style={{
                          textAlign: "right",
                          color: "#292522",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatearMoneda(venta.total)}
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <span
                          className={`admin-pill ${obtenerClaseEstado(
                            estado
                          )}`}
                        >
                          {estado}
                        </span>
                      </td>

                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            onClick={() =>
                              setVentaSeleccionada(venta)
                            }
                            title="Ver detalle de venta"
                            aria-label={`Ver detalle de la venta ${venta.id}`}
                            className="admin-row-action"
                          >
                            <svg
                              width="17"
                              height="17"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                              />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =================================================
          MODAL DE DETALLE DE VENTA
          ================================================= */}

      {ventaSeleccionada && (
        <div className="admin-modal-overlay">
          <section
            className="admin-modal-card admin-modal-card--wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detalle-venta-titulo"
          >
            {/* Encabezado */}
            <header className="admin-modal-header">
              <div>
                <p className="admin-modal-header__eyebrow">
                  Información de la operación
                </p>

                <h2
                  id="detalle-venta-titulo"
                  className="admin-modal-header__title"
                >
                  Detalle de venta
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setVentaSeleccionada(null)}
                aria-label="Cerrar detalle"
                className="admin-modal-close"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </header>

            <div
              className="admin-modal-body"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "17px",
              }}
            >
              {/* Información general */}
              <section className="admin-detail-section">
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "15px",
                  }}
                >
                  <div>
                    <p className="admin-detail-info__label">
                      Código de venta
                    </p>

                    <p
                      style={{
                        marginTop: "5px",
                        color: "#292522",
                        fontSize: "20px",
                        fontWeight: 700,
                      }}
                    >
                      #{ventaSeleccionada.id || "Sin código"}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      minWidth: "165px",
                    }}
                  >
                    <label
                      htmlFor="venta-cambiar-estado"
                      className="admin-form-label"
                    >
                      Cambiar estado
                    </label>

                    <select
                      id="venta-cambiar-estado"
                      value={normalizarEstado(
                        ventaSeleccionada.estado
                      )}
                      onChange={(e) =>
                        manejarCambioEstado(
                          ventaSeleccionada.id,
                          e.target.value
                        )
                      }
                      disabled={actualizandoEstado}
                      className="admin-field-control admin-detail-status-select"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En preparación">
                        En preparación
                      </option>
                      <option value="Enviado">Enviado</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>

                    {actualizandoEstado && (
                      <span
                        style={{
                          color: "#827970",
                          fontSize: "10px",
                        }}
                      >
                        Actualizando estado...
                      </span>
                    )}
                  </div>
                </div>

                <div className="admin-detail-grid" style={{ marginTop: "15px" }}>
                  <div className="admin-detail-info">
                    <p className="admin-detail-info__label">
                      Fecha de compra
                    </p>

                    <p className="admin-detail-info__value">
                      {formatearFecha(ventaSeleccionada.fecha)}
                    </p>
                  </div>

                  <div className="admin-detail-info">
                    <p className="admin-detail-info__label">
                      Cantidad de productos
                    </p>

                    <p className="admin-detail-info__value">
                      {obtenerCantidadProductos(ventaSeleccionada)} unidades
                    </p>
                  </div>
                </div>
              </section>

              {/* Información del cliente */}
              <section className="admin-detail-section">
                <div className="admin-detail-section__heading">
                  <h3 className="admin-detail-section__title">
                    Información del cliente
                  </h3>

                  <p className="admin-detail-section__description">
                    Datos asociados a la compra.
                  </p>
                </div>

                <div className="admin-detail-grid">
                  <div className="admin-detail-info">
                    <p className="admin-detail-info__label">
                      Nombre completo
                    </p>

                    <p className="admin-detail-info__value">
                      {obtenerNombreCliente(
                        ventaSeleccionada,
                        clientesPorId
                      )}
                    </p>
                  </div>

                  <div className="admin-detail-info">
                    <p className="admin-detail-info__label">
                      Correo electrónico
                    </p>

                    <p className="admin-detail-info__value">
                      {clienteVentaSeleccionada?.email || "No registrado"}
                    </p>
                  </div>

                  <div className="admin-detail-info">
                    <p className="admin-detail-info__label">
                      Teléfono
                    </p>

                    <p className="admin-detail-info__value">
                      {clienteVentaSeleccionada?.telefono || "No registrado"}
                    </p>
                  </div>

                  <div className="admin-detail-info">
                    <p className="admin-detail-info__label">
                      Dirección
                    </p>

                    <p className="admin-detail-info__value">
                      {clienteVentaSeleccionada?.direccion || "No registrada"}
                    </p>
                  </div>
                </div>

                {!clienteVentaSeleccionada && (
                  <div
                    className="admin-alert"
                    style={{
                      marginTop: "12px",
                      marginBottom: 0,
                      color: "#906a2e",
                      background: "#faf3e7",
                      borderColor: "#ecdfc6",
                    }}
                  >
                    No se encontró el registro del cliente relacionado
                    con esta venta.
                  </div>
                )}
              </section>

              {/* Productos adquiridos */}
              <section className="admin-detail-section">
                <div className="admin-detail-section__heading">
                  <h3 className="admin-detail-section__title">
                    Productos adquiridos
                  </h3>

                  <p className="admin-detail-section__description">
                    Detalle de los artículos incluidos en la operación.
                  </p>
                </div>

                <div className="admin-table-card">
                  {itemsVentaSeleccionada.length === 0 ? (
                    <div className="admin-empty-state">
                      Esta venta no tiene productos registrados.
                    </div>
                  ) : (
                    <div className="admin-table-scroll">
                      <table className="admin-data-table admin-detail-items-table">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th style={{ textAlign: "center" }}>
                              Cantidad
                            </th>
                            <th style={{ textAlign: "right" }}>
                              Precio unitario
                            </th>
                            <th style={{ textAlign: "right" }}>
                              Subtotal
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {itemsVentaSeleccionada.map((item, index) => (
                            <tr
                              key={`${item.productoId || "producto"}-${index}`}
                            >
                              <td>
                                <span className="admin-table-primary-text">
                                  {item.nombre ||
                                    `Producto ${
                                      item.productoId || index + 1
                                    }`}
                                </span>
                              </td>

                              <td style={{ textAlign: "center" }}>
                                {Number(item.cantidad) || 0}
                              </td>

                              <td
                                style={{
                                  textAlign: "right",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {formatearMoneda(item.precioUnitario)}
                              </td>

                              <td
                                style={{
                                  textAlign: "right",
                                  color: "#292522",
                                  fontWeight: 700,
                                  whiteSpace: "nowrap",
                                }}
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

              {/* Total de la venta */}
              <section className="admin-detail-total">
                <span className="admin-detail-total__label">
                  Total de la venta
                </span>

                <span className="admin-detail-total__value">
                  {formatearMoneda(ventaSeleccionada.total)}
                </span>
              </section>
            </div>

            {/* Pie del modal */}
            <footer className="admin-detail-footer">
              <button
                type="button"
                onClick={() => setVentaSeleccionada(null)}
                className="admin-secondary-button"
              >
                Cerrar
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
};

export default Ventas;


