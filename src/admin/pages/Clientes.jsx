
import { useEffect, useState } from "react";
import { clientesService } from "../services/clientesService";
import AdminPagination from "../components/AdminPagination";
import "../styles/modulos.css";

const initialForm = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  dni: "",
  direccion: "",
};

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Estados para la confirmación de eliminación.
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  // Paginación.
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  /* =====================================================
     CARGA DE CLIENTES
     ===================================================== */

  const cargarClientes = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await clientesService.obtenerClientes();
      setClientes(data);
    } catch (err) {
      setError("No se pudo cargar la lista de clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  /* =====================================================
     REGISTRO Y EDICIÓN
     ===================================================== */

  const abrirNuevo = () => {
    setEditando(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const abrirEditar = (cliente) => {
    setEditando(cliente.id);

    setForm({
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      email: cliente.email || "",
      telefono: cliente.telefono || "",
      dni: cliente.dni || "",
      direccion: cliente.direccion || "",
    });

    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setForm(initialForm);
    setEditando(null);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.nombre.trim() ||
      !form.apellido.trim() ||
      !form.email.trim()
    ) {
      setError("Nombre, apellido y correo son obligatorios.");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      if (editando) {
        await clientesService.actualizarCliente(editando, form);
      } else {
        await clientesService.crearCliente({
          ...form,
          fechaRegistro: new Date().toISOString(),
        });
      }

      await cargarClientes();
      cerrarModal();
    } catch (err) {
      setError("No se pudo guardar el cliente. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  /* =====================================================
     ELIMINACIÓN DE CLIENTES
     ===================================================== */

  const abrirModalEliminar = (cliente) => {
    setErrorEliminar("");
    setClienteAEliminar(cliente);
  };

  const cerrarModalEliminar = () => {
    if (eliminando) return;

    setClienteAEliminar(null);
    setErrorEliminar("");
  };

  const confirmarEliminar = async () => {
    if (!clienteAEliminar) return;

    setEliminando(true);
    setErrorEliminar("");

    try {
      await clientesService.eliminarCliente(clienteAEliminar.id);

      setClientes((prev) =>
        prev.filter((c) => c.id !== clienteAEliminar.id)
      );

      setClienteAEliminar(null);
    } catch (err) {
      setErrorEliminar(
        "No se pudo eliminar el cliente. Intenta nuevamente."
      );
    } finally {
      setEliminando(false);
    }
  };

  /* =====================================================
     BÚSQUEDA Y PAGINACIÓN
     ===================================================== */

  const clientesFiltrados = clientes.filter((c) => {
    const texto =
      `${c.nombre} ${c.apellido} ${c.email} ${c.dni}`.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  // Reiniciar la página cuando cambia la búsqueda o la cantidad.
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, registrosPorPagina]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(clientesFiltrados.length / registrosPorPagina)
  );

  const paginaActualSegura = Math.min(paginaActual, totalPaginas);

  const clientesPaginados = clientesFiltrados.slice(
    (paginaActualSegura - 1) * registrosPorPagina,
    paginaActualSegura * registrosPorPagina
  );

  // Ajustar la página si se elimina un cliente de la última página.
  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  /* =====================================================
     INTERFAZ
     ===================================================== */

  return (
    <main className="admin-module-page">
      {/* Encabezado */}
      <header className="admin-page-heading">
        <div>
          <p className="admin-page-heading__eyebrow">
            Gestión de usuarios
          </p>

          <h1 className="admin-page-heading__title">
            Gestión de clientes
          </h1>

          <p className="admin-page-heading__description">
            Administra la información y los datos de los clientes
            registrados en Fashion Store.
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

          Nuevo cliente
        </button>
      </header>

      {/* Resumen de clientes */}
      <section
        className="admin-stat-grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        }}
      >
        <div className="admin-stat-card">
          <p className="admin-stat-card__label">
            Clientes registrados
          </p>

          <p className="admin-stat-card__value">
            {clientes.length}
          </p>

          <p className="admin-stat-card__note">
            Total de clientes en el sistema
          </p>
        </div>
      </section>

      {/* Mensaje de error general */}
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

          <span>{error}</span>
        </div>
      )}

      {/* Búsqueda */}
      <section className="admin-toolbar">
        <div className="admin-toolbar__search">
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
            type="text"
            placeholder="Buscar por nombre, correo o DNI..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="admin-field-control admin-search-input"
          />
        </div>

        {busqueda && (
          <button
            type="button"
            onClick={() => setBusqueda("")}
            className="admin-clear-filter"
          >
            Limpiar búsqueda
          </button>
        )}
      </section>

      {/* Tabla de clientes */}
      <section className="admin-table-card">
        {loading ? (
          <div className="admin-loading-state">
            <div className="admin-spinner" />
            Cargando clientes...
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="admin-empty-state">
            <p className="admin-empty-state__title">
              No se encontraron clientes
            </p>

            <p>
              No hay clientes registrados todavía o no coinciden con
              la búsqueda.
            </p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Correo electrónico</th>
                  <th>Teléfono</th>
                  <th>DNI</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {clientesPaginados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>
                      <p className="admin-table-primary-text">
                        {cliente.nombre} {cliente.apellido}
                      </p>

                      <span className="admin-table-secondary-text">
                        Cliente registrado
                      </span>
                    </td>

                    <td>{cliente.email || "—"}</td>

                    <td>{cliente.telefono || "—"}</td>

                    <td>{cliente.dni || "—"}</td>

                    <td>
                      <div className="admin-row-actions">
                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() => abrirEditar(cliente)}
                          title="Editar cliente"
                          aria-label={`Editar a ${cliente.nombre} ${cliente.apellido}`}
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

                        {/* Eliminar */}
                        <button
                          type="button"
                          onClick={() => abrirModalEliminar(cliente)}
                          title="Eliminar cliente"
                          aria-label={`Eliminar a ${cliente.nombre} ${cliente.apellido}`}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {!loading && clientesFiltrados.length > 0 && (
        <AdminPagination
          currentPage={paginaActualSegura}
          totalItems={clientesFiltrados.length}
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
            className="admin-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cliente-modal-title"
          >
            <header className="admin-modal-header">
              <div>
                <p className="admin-modal-header__eyebrow">
                  {editando ? "Actualización" : "Nuevo registro"}
                </p>

                <h2
                  id="cliente-modal-title"
                  className="admin-modal-header__title"
                >
                  {editando ? "Editar cliente" : "Registrar nuevo cliente"}
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

            <form onSubmit={handleSubmit} className="admin-modal-body">
              <div className="admin-form-grid">
                <div className="admin-form-field">
                  <label className="admin-form-label">
                    Nombre *
                  </label>

                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Nombre del cliente"
                    className="admin-field-control"
                  />
                </div>

                <div className="admin-form-field">
                  <label className="admin-form-label">
                    Apellido *
                  </label>

                  <input
                    type="text"
                    name="apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    required
                    placeholder="Apellido del cliente"
                    className="admin-field-control"
                  />
                </div>

                <div className="admin-form-field admin-form-field--full">
                  <label className="admin-form-label">
                    Correo electrónico *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="correo@ejemplo.com"
                    className="admin-field-control"
                  />
                </div>

                <div className="admin-form-field">
                  <label className="admin-form-label">
                    Teléfono
                  </label>

                  <input
                    type="text"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="Número de teléfono"
                    className="admin-field-control"
                  />
                </div>

                <div className="admin-form-field">
                  <label className="admin-form-label">
                    DNI
                  </label>

                  <input
                    type="text"
                    name="dni"
                    value={form.dni}
                    onChange={handleChange}
                    maxLength={8}
                    placeholder="Número de DNI"
                    className="admin-field-control"
                  />
                </div>

                <div className="admin-form-field admin-form-field--full">
                  <label className="admin-form-label">
                    Dirección
                  </label>

                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Dirección del cliente"
                    className="admin-field-control"
                  />
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
                  {guardando ? "Guardando..." : "Guardar cliente"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {clienteAEliminar && (
        <div className="admin-modal-overlay">
          <section
            className="admin-modal-card admin-modal-card--small"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cliente-delete-title"
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
                id="cliente-delete-title"
                style={{
                  color: "#292522",
                  fontSize: "19px",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                ¿Eliminar este cliente?
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
                Esta acción no se puede deshacer. El cliente será
                eliminado permanentemente del registro.
              </p>

              <div className="admin-delete-preview">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    width: "48px",
                    height: "48px",
                    color: "#702d40",
                    background: "#f3e7e9",
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  {clienteAEliminar.nombre?.charAt(0)?.toUpperCase() || "C"}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="admin-table-primary-text">
                    {clienteAEliminar.nombre} {clienteAEliminar.apellido}
                  </p>

                  <p className="admin-table-secondary-text">
                    {clienteAEliminar.email || "Sin correo registrado"}
                  </p>

                  <p
                    style={{
                      marginTop: "5px",
                      color: "#827970",
                      fontSize: "11px",
                    }}
                  >
                    DNI: {clienteAEliminar.dni || "No registrado"}
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
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                }}
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
    </main>
  );
};

export default Clientes;


