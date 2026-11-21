
import { useEffect, useMemo, useState } from "react";
import { productosService } from "../services/productosService";
import ImageModal from "../../components/ImageModal";
import AdminPagination from "../components/AdminPagination";
import "../styles/modulos.css";

const initialForm = {
  nombre: "",
  precio: "",
  categoria: "Hombre",
  stock: "",
  imagen: "assets/img/casacaCueroHombre.jpg",
  oferta: false,
  descuento: 0,
};

const categoriasDisponibles = [
  "Hombre",
  "Mujer",
  "Niños",
  "Accesorios",
  "Calzado",
];

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorModal, setErrorModal] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroPromocion, setFiltroPromocion] = useState(false);
  const [filtroBajoStock, setFiltroBajoStock] = useState(false);
  const [productoVisualizando, setProductoVisualizando] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  const [confirmacion, setConfirmacion] = useState(() => {
    return sessionStorage.getItem("producto_confirmacion") || null;
  });

  /* =====================================================
     CONFIRMACIÓN TEMPORAL
     ===================================================== */

  useEffect(() => {
    if (!confirmacion) return;

    const timer = setTimeout(() => {
      setConfirmacion(null);
      sessionStorage.removeItem("producto_confirmacion");
    }, 4500);

    return () => clearTimeout(timer);
  }, [confirmacion]);

  const cerrarConfirmacion = () => {
    setConfirmacion(null);
    sessionStorage.removeItem("producto_confirmacion");
  };

  /* =====================================================
     CARGA DE PRODUCTOS
     ===================================================== */

  const cargarProductos = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await productosService.obtenerProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        "No se pudo cargar el listado de productos. Asegúrate de tener json-server activo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  /* =====================================================
     REGISTRO Y EDICIÓN
     ===================================================== */

  const abrirNuevo = () => {
    setEditando(null);
    setForm(initialForm);
    setError("");
    setErrorModal("");
    setModalOpen(true);
  };

  const abrirEditar = (producto) => {
    setEditando(producto.id);

    setForm({
      nombre: producto.nombre || "",
      precio: producto.precio ?? "",
      categoria: producto.categoria || "Hombre",
      stock: producto.stock ?? "",
      imagen: producto.imagen || "",
      oferta: Boolean(producto.oferta),
      descuento: producto.descuento ?? 0,
    });

    setError("");
    setErrorModal("");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditando(null);
    setErrorModal("");
    setForm(initialForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (errorModal) {
      setErrorModal("");
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      setErrorModal("El nombre del producto es obligatorio.");
      return;
    }

    if (form.precio === "" || Number(form.precio) <= 0) {
      setErrorModal("El precio debe ser un número válido mayor a 0.");
      return;
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      setErrorModal("El stock no puede ser un valor negativo.");
      return;
    }

    if (
      form.oferta &&
      (form.descuento === "" ||
        Number(form.descuento) <= 0 ||
        Number(form.descuento) >= 100)
    ) {
      setErrorModal(
        "El porcentaje de descuento debe ser mayor a 0% y menor a 100%."
      );
      return;
    }

    setGuardando(true);
    setErrorModal("");

    const payload = {
      nombre: form.nombre.trim(),
      precio: Number(form.precio),
      categoria: form.categoria,
      stock: Number(form.stock),
      imagen: form.imagen.trim() || "assets/img/casacaCueroHombre.jpg",
      oferta: form.oferta,
      descuento: form.oferta ? Number(form.descuento || 0) : 0,
    };

    try {
      const eraNuevo = !editando;

      if (editando) {
        await productosService.actualizarProducto(editando, payload);
      } else {
        await productosService.crearProducto({
          id: String(Date.now()),
          ...payload,
        });
      }

      await cargarProductos();
      cerrarModal();

      const mensaje = eraNuevo
        ? "El producto se ha agregado correctamente."
        : "El producto se ha actualizado correctamente.";

      sessionStorage.setItem("producto_confirmacion", mensaje);
      setConfirmacion(mensaje);
    } catch (err) {
      setErrorModal(
        "No se pudo guardar el producto. Asegúrate de que el servidor esté activo."
      );
    } finally {
      setGuardando(false);
    }
  };

  /* =====================================================
     ELIMINACIÓN
     ===================================================== */

  const abrirModalEliminar = (producto) => {
    setErrorEliminar("");
    setProductoAEliminar(producto);
  };

  const cerrarModalEliminar = () => {
    if (eliminando) return;

    setProductoAEliminar(null);
    setErrorEliminar("");
  };

  const confirmarEliminar = async () => {
    if (!productoAEliminar) return;

    setEliminando(true);
    setErrorEliminar("");

    try {
      await productosService.eliminarProducto(productoAEliminar.id);

      const mensaje = `El producto "${productoAEliminar.nombre}" se ha eliminado correctamente.`;

      sessionStorage.setItem("producto_confirmacion", mensaje);
      setConfirmacion(mensaje);
      setProductoAEliminar(null);

      await cargarProductos();
    } catch (err) {
      setErrorEliminar(
        "No se pudo eliminar el producto. Verifica que json-server esté en ejecución."
      );
    } finally {
      setEliminando(false);
    }
  };

  /* =====================================================
     BÚSQUEDA, FILTROS Y MÉTRICAS
     ===================================================== */

  const esBusquedaPorId = busqueda.trim().startsWith("#");

  const productosFiltrados = useMemo(() => {
    const query = busqueda.trim();
    const esPorId = query.startsWith("#");
    const idBuscado = esPorId
      ? query.slice(1).trim().toLowerCase()
      : "";

    return productos.filter((p) => {
      let coincideBusqueda = true;

      if (query) {
        if (esPorId) {
          coincideBusqueda = idBuscado
            ? String(p.id).toLowerCase().includes(idBuscado)
            : true;
        } else {
          const termino = query.toLowerCase();

          coincideBusqueda =
            p.nombre?.toLowerCase().includes(termino) ||
            p.categoria?.toLowerCase().includes(termino) ||
            String(p.id).toLowerCase() === termino;
        }
      }

      const coincideCategoria =
        filtroCategoria === "todos" || p.categoria === filtroCategoria;

      const coincidePromocion =
        !filtroPromocion || p.oferta === true;

      const coincideBajoStock =
        !filtroBajoStock || Number(p.stock) <= 5;

      return (
        coincideBusqueda &&
        coincideCategoria &&
        coincidePromocion &&
        coincideBajoStock
      );
    });
  }, [
    productos,
    busqueda,
    filtroCategoria,
    filtroPromocion,
    filtroBajoStock,
  ]);

  // Reiniciar la página cuando cambien la búsqueda o los filtros.
  useEffect(() => {
    setPaginaActual(1);
  }, [
    busqueda,
    filtroCategoria,
    filtroPromocion,
    filtroBajoStock,
    registrosPorPagina,
  ]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(productosFiltrados.length / registrosPorPagina)
  );

  const paginaActualSegura = Math.min(paginaActual, totalPaginas);

  const productosPaginados = productosFiltrados.slice(
    (paginaActualSegura - 1) * registrosPorPagina,
    paginaActualSegura * registrosPorPagina
  );

  // Ajustar la página si se elimina un registro de la última página.
  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  const metricas = useMemo(() => {
    const total = productos.length;
    const ofertas = productos.filter((p) => p.oferta).length;

    const stockTotal = productos.reduce(
      (acc, p) => acc + (Number(p.stock) || 0),
      0
    );

    const bajoStock = productos.filter(
      (p) => (Number(p.stock) || 0) <= 5
    ).length;

    return {
      total,
      ofertas,
      stockTotal,
      bajoStock,
    };
  }, [productos]);

  /* =====================================================
     UTILIDADES
     ===================================================== */

  const resolverRutaImagen = (img) => {
    if (!img) {
      return "https://via.placeholder.com/80?text=Sin+Foto";
    }

    if (img.startsWith("http://") || img.startsWith("https://")) {
      return img;
    }

    const nombre = img.split("/").pop();

    return `/assets/img/${nombre}`;
  };

  const limpiarFiltros = () => {
    setFiltroPromocion(false);
    setFiltroBajoStock(false);
    setFiltroCategoria("todos");
    setBusqueda("");
  };

  /* =====================================================
     INTERFAZ
     ===================================================== */

  return (
    <main className="admin-module-page">
      {/* Confirmación de operaciones */}
      {confirmacion && (
        <div className="admin-toast" role="status" aria-live="polite">
          <div className="admin-toast__icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <p className="admin-toast__message">{confirmacion}</p>

          <button
            type="button"
            onClick={cerrarConfirmacion}
            className="admin-toast__close"
            title="Cerrar mensaje"
            aria-label="Cerrar mensaje"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Encabezado */}
      <header className="admin-page-heading">
        <div>
          <p className="admin-page-heading__eyebrow">
            Inventario y catálogo
          </p>

          <h1 className="admin-page-heading__title">
            Gestión de productos
          </h1>

          <p className="admin-page-heading__description">
            Administra los artículos de tu boutique, precios, existencias y
            promociones.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevo}
          className="admin-primary-button"
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
              d="M12 5v14M5 12h14"
            />
          </svg>
          Nuevo producto
        </button>
      </header>

      {/* Métricas */}
      <section className="admin-stat-grid">
        <button
          type="button"
          onClick={() => {
            setFiltroPromocion(false);
            setFiltroBajoStock(false);
          }}
          className={`admin-stat-card ${
            !filtroPromocion && !filtroBajoStock ? "is-active" : ""
          }`}
        >
          <p className="admin-stat-card__label">Total de productos</p>
          <p className="admin-stat-card__value">{metricas.total}</p>
          <p className="admin-stat-card__note">
            Productos registrados en el catálogo
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFiltroPromocion(!filtroPromocion)}
          className={`admin-stat-card admin-stat-card--promo ${
            filtroPromocion ? "is-active" : ""
          }`}
        >
          <p className="admin-stat-card__label">En promoción</p>
          <p className="admin-stat-card__value">{metricas.ofertas}</p>
          <p className="admin-stat-card__note">
            Ver productos con descuento
          </p>
        </button>

        <div className="admin-stat-card">
          <p className="admin-stat-card__label">Stock total</p>
          <p className="admin-stat-card__value">{metricas.stockTotal}</p>
          <p className="admin-stat-card__note">Unidades disponibles</p>
        </div>

        <button
          type="button"
          onClick={() => setFiltroBajoStock(!filtroBajoStock)}
          className={`admin-stat-card admin-stat-card--warning ${
            filtroBajoStock ? "is-active" : ""
          }`}
        >
          <p className="admin-stat-card__label">Stock bajo (≤ 5)</p>
          <p className="admin-stat-card__value">{metricas.bajoStock}</p>
          <p className="admin-stat-card__note">
            Ver productos con pocas unidades
          </p>
        </button>
      </section>

      {/* Error general */}
      {error && !modalOpen && (
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

          <span>{error}</span>
        </div>
      )}

      {/* Búsqueda y filtros */}
      <section className="admin-toolbar">
        <div className="admin-toolbar__search">
          <span className="admin-search-icon">
            {esBusquedaPorId ? (
              <span
                style={{
                  color: "#702d40",
                  fontFamily: "monospace",
                  fontWeight: 700,
                }}
              >
                #
              </span>
            ) : (
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
            )}
          </span>

          <input
            type="text"
            placeholder="Buscar por nombre o #ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="admin-field-control admin-search-input"
          />
        </div>

        <div className="admin-toolbar__filters">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="admin-field-control"
            style={{ width: "auto", minWidth: "135px" }}
            aria-label="Filtrar por categoría"
          >
            <option value="todos">Todas las categorías</option>

            {categoriasDisponibles.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setFiltroPromocion(!filtroPromocion)}
            className={`admin-filter-button ${
              filtroPromocion ? "is-active" : ""
            }`}
          >
            Promociones
            <span className="admin-filter-button__count">
              {metricas.ofertas}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroBajoStock(!filtroBajoStock)}
            className={`admin-filter-button admin-filter-button--warning ${
              filtroBajoStock ? "is-active" : ""
            }`}
          >
            Stock bajo
            <span className="admin-filter-button__count">
              {metricas.bajoStock}
            </span>
          </button>

          {(filtroPromocion ||
            filtroBajoStock ||
            filtroCategoria !== "todos" ||
            busqueda) && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="admin-clear-filter"
              title="Restablecer filtros"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </section>

      {/* Indicador de búsqueda por ID */}
      {esBusquedaPorId && (
        <p
          style={{
            marginTop: "-7px",
            marginBottom: "13px",
            color: "#702d40",
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          Buscando por identificador: #
          {busqueda.slice(1).trim() || "..."}
        </p>
      )}

      {/* Tabla de productos */}
      <section className="admin-table-card">
        {loading ? (
          <div className="admin-loading-state">
            <div className="admin-spinner" />
            Cargando catálogo de productos...
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="admin-empty-state">
            <p className="admin-empty-state__title">
              No se encontraron productos
            </p>
            <p>
              No hay productos registrados o no coinciden con los filtros
              seleccionados.
            </p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Promoción</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {productosPaginados.map((p) => {
                  const precioFinal =
                    p.oferta && p.descuento
                      ? p.precio - (p.precio * p.descuento) / 100
                      : p.precio;

                  const idCoincide =
                    esBusquedaPorId &&
                    busqueda.slice(1).trim() &&
                    String(p.id)
                      .toLowerCase()
                      .includes(
                        busqueda.slice(1).trim().toLowerCase()
                      );

                  const stockBajo = Number(p.stock) <= 5;

                  return (
                    <tr key={p.id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "11px",
                            minWidth: "190px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setProductoVisualizando(p)}
                            title="Ver imagen ampliada"
                            aria-label={`Ver imagen de ${p.nombre}`}
                            style={{
                              flexShrink: 0,
                              padding: 0,
                              background: "transparent",
                              borderRadius: "9px",
                              cursor: "pointer",
                            }}
                          >
                            <img
                              src={resolverRutaImagen(p.imagen)}
                              alt={p.nombre}
                              style={{
                                display: "block",
                                width: "48px",
                                height: "48px",
                                padding: "4px",
                                objectFit: "contain",
                                background: "#f8f5f1",
                                border: "1px solid #e9e2da",
                                borderRadius: "9px",
                              }}
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/80?text=FS";
                              }}
                            />
                          </button>

                          <div style={{ minWidth: 0 }}>
                            <p className="admin-table-primary-text">
                              {p.nombre}
                            </p>

                            <span
                              className={`admin-id-badge ${
                                idCoincide ? "is-highlighted" : ""
                              }`}
                            >
                              ID: #{p.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-pill admin-pill--category">
                          {p.categoria}
                        </span>
                      </td>

                      <td>
                        {p.oferta && p.descuento ? (
                          <div>
                            <span
                              style={{
                                display: "block",
                                color: "#aaa096",
                                fontSize: "10px",
                                textDecoration: "line-through",
                              }}
                            >
                              S/{Number(p.precio).toFixed(2)}
                            </span>

                            <span
                              style={{
                                color: "#702d40",
                                fontSize: "12px",
                                fontWeight: 700,
                              }}
                            >
                              S/{Number(precioFinal).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="admin-table-primary-text">
                            S/{Number(p.precio).toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`admin-pill ${
                            stockBajo
                              ? "admin-pill--warning"
                              : "admin-pill--success"
                          }`}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: stockBajo
                                ? "#b18a4e"
                                : "#5a9870",
                            }}
                          />
                          {p.stock} uds.
                        </span>
                      </td>

                      <td>
                        {p.oferta ? (
                          <span className="admin-pill admin-pill--promo">
                            -{p.descuento}% OFF
                          </span>
                        ) : (
                          <span
                            style={{
                              color: "#a49a90",
                              fontSize: "11px",
                            }}
                          >
                            Regular
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            onClick={() => abrirEditar(p)}
                            title="Editar producto"
                            aria-label={`Editar ${p.nombre}`}
                            className="admin-row-action"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m15 5 4 4M4 20l4.5-1 11-11a2.8 2.8 0 0 0-4-4l-11 11L4 20Z"
                              />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => abrirModalEliminar(p)}
                            title="Eliminar producto"
                            aria-label={`Eliminar ${p.nombre}`}
                            className="admin-row-action admin-row-action--danger"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"
                              />
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

      {!loading && productosFiltrados.length > 0 && (
        <AdminPagination
          currentPage={paginaActualSegura}
          totalItems={productosFiltrados.length}
          pageSize={registrosPorPagina}
          onPageChange={setPaginaActual}
          onPageSizeChange={(cantidad) => {
            setRegistrosPorPagina(cantidad);
            setPaginaActual(1);
          }}
        />
      )}

      {/* Modal de registro y edición */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <section
            className="admin-modal-card admin-modal-card--wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="producto-modal-title"
          >
            <header className="admin-modal-header">
              <div>
                <p className="admin-modal-header__eyebrow">
                  {editando ? "Actualización" : "Nuevo registro"}
                </p>

                <h2
                  id="producto-modal-title"
                  className="admin-modal-header__title"
                >
                  {editando
                    ? "Editar producto"
                    : "Registrar nuevo producto"}
                </h2>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                className="admin-modal-close"
                aria-label="Cerrar formulario"
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

            {errorModal && (
              <div
                className="admin-alert admin-alert--error"
                role="alert"
                style={{ margin: "16px 22px 0" }}
              >
                <svg
                  width="16"
                  height="16"
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

                <span>{errorModal}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="admin-modal-body">
              <div className="admin-form-grid">
                <div className="admin-form-field admin-form-field--full">
                  <label className="admin-form-label">
                    Nombre del artículo *
                  </label>

                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Ej. Casaca de cuero premium"
                    className="admin-field-control"
                  />
                </div>

                <div className="admin-form-field">
                  <label className="admin-form-label">
                    Categoría *
                  </label>

                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    className="admin-field-control"
                  >
                    {categoriasDisponibles.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-field">
                  <label className="admin-form-label">
                    Precio (S/) *
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    name="precio"
                    value={form.precio}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    className="admin-field-control"
                  />
                </div>

                <div className="admin-form-field">
                  <label className="admin-form-label">
                    Stock disponible *
                  </label>

                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="10"
                    className="admin-field-control"
                  />
                </div>

                <div className="admin-form-field">
                  <label className="admin-form-label">
                    Ruta o URL de imagen
                  </label>

                  <input
                    type="text"
                    name="imagen"
                    value={form.imagen}
                    onChange={handleChange}
                    placeholder="assets/img/foto.jpg"
                    className="admin-field-control"
                  />

                  <p className="admin-form-help">
                    Puedes utilizar una ruta de imagen del proyecto o una URL.
                  </p>
                </div>

                <div className="admin-form-field admin-form-field--full">
                  <div className="admin-checkbox-panel">
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                        color: "#514840",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        name="oferta"
                        checked={form.oferta}
                        onChange={handleChange}
                        style={{
                          width: "16px",
                          height: "16px",
                          accentColor: "#702d40",
                        }}
                      />

                      Activar precio de oferta o descuento
                    </label>

                    {form.oferta && (
                      <div
                        style={{
                          marginTop: "14px",
                          paddingTop: "13px",
                          borderTop: "1px solid #e9e2da",
                        }}
                      >
                        <label className="admin-form-label">
                          Porcentaje de descuento (%) *
                        </label>

                        <input
                          type="number"
                          name="descuento"
                          value={form.descuento}
                          onChange={handleChange}
                          min="1"
                          max="99"
                          placeholder="Ej. 20"
                          className="admin-field-control"
                        />

                        <p className="admin-form-help">
                          Ingresa un valor mayor a 0 y menor a 100.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="admin-secondary-button"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="admin-primary-button"
                >
                  {guardando
                    ? "Guardando..."
                    : editando
                      ? "Guardar cambios"
                      : "Crear producto"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {productoAEliminar && (
        <div className="admin-modal-overlay">
          <section
            className="admin-modal-card admin-modal-card--small"
            role="dialog"
            aria-modal="true"
            aria-labelledby="producto-delete-title"
          >
            <div className="admin-modal-body">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "15px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "53px",
                    height: "53px",
                    color: "#a33f49",
                    background: "#fbefef",
                    border: "1px solid #f0dddd",
                    borderRadius: "15px",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"
                    />
                  </svg>
                </div>
              </div>

              <h2
                id="producto-delete-title"
                style={{
                  color: "#292522",
                  fontSize: "19px",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                ¿Eliminar este producto?
              </h2>

              <p
                style={{
                  marginTop: "7px",
                  color: "#827970",
                  fontSize: "12px",
                  lineHeight: 1.6,
                  textAlign: "center",
                }}
              >
                Esta acción no se puede deshacer. El producto será retirado
                permanentemente del catálogo y del inventario.
              </p>

              <div className="admin-delete-preview">
                <img
                  src={resolverRutaImagen(productoAEliminar.imagen)}
                  alt={productoAEliminar.nombre}
                  style={{
                    width: "52px",
                    height: "52px",
                    flexShrink: 0,
                    padding: "4px",
                    objectFit: "contain",
                    background: "#ffffff",
                    border: "1px solid #e9e2da",
                    borderRadius: "9px",
                  }}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/80?text=FS";
                  }}
                />

                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="admin-table-primary-text">
                    {productoAEliminar.nombre}
                  </p>

                  <p className="admin-table-secondary-text">
                    ID: #{productoAEliminar.id} ·{" "}
                    {productoAEliminar.categoria}
                  </p>

                  <p
                    style={{
                      marginTop: "5px",
                      color: "#514840",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    S/{Number(productoAEliminar.precio).toFixed(2)} ·{" "}
                    {productoAEliminar.stock} en stock
                  </p>
                </div>
              </div>

              {errorEliminar && (
                <div
                  className="admin-alert admin-alert--error"
                  role="alert"
                  style={{ marginTop: "14px", marginBottom: 0 }}
                >
                  {errorEliminar}
                </div>
              )}

              <div
                className="admin-modal-actions"
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
              >
                <button
                  type="button"
                  disabled={eliminando}
                  onClick={cerrarModalEliminar}
                  className="admin-secondary-button"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={eliminando}
                  onClick={confirmarEliminar}
                  className="admin-danger-button"
                >
                  {eliminando ? "Eliminando..." : "Sí, eliminar"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Visor de imagen ampliada */}
      {productoVisualizando && (
        <ImageModal
          isOpen={Boolean(productoVisualizando)}
          onClose={() => setProductoVisualizando(null)}
          imagen={resolverRutaImagen(productoVisualizando.imagen)}
          nombre={productoVisualizando.nombre}
          categoria={productoVisualizando.categoria}
          precio={productoVisualizando.precio}
          descuento={productoVisualizando.descuento}
          oferta={productoVisualizando.oferta}
        />
      )}
    </main>
  );
};

export default Productos;


