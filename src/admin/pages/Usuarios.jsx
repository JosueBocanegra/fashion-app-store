import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Mail,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { usuariosService } from "../services/usuariosService";
import AdminPagination from "../components/AdminPagination";
import "../styles/modulos.css";

const initialForm = {
  nombre: "",
  email: "",
  password: "",
  rol: "empleado",
};

const obtenerEtiquetaRol = (rol) => {
  const valor = String(rol || "").trim().toLowerCase();

  if (valor === "admin") return "Administrador";
  if (valor === "empleado") return "Empleado";

  return valor
    ? valor.charAt(0).toUpperCase() + valor.slice(1)
    : "Sin rol";
};

const obtenerIniciales = (nombre) => {
  const partes = String(nombre || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (partes.length === 0) return "US";

  return partes
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();
};

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Formulario de registro y edición.
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Búsqueda y paginación.
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  // Confirmación de eliminación.
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  // Notificación.
  const [toast, setToast] = useState(null);

  /* =====================================================
     CARGA DE USUARIOS
     ===================================================== */

  const cargarUsuarios = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await usuariosService.obtenerUsuarios();

      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  /* =====================================================
     NOTIFICACIONES
     ===================================================== */

  useEffect(() => {
    if (!toast) return;

    const temporizador = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => window.clearTimeout(temporizador);
  }, [toast]);

  const mostrarNotificacion = (mensaje) => {
    setToast({
      mensaje,
      id: Date.now(),
    });
  };

  /* =====================================================
     APERTURA Y CIERRE DEL MODAL
     ===================================================== */

  const abrirNuevo = () => {
    setEditando(null);
    setForm(initialForm);
    setErrorModal("");
    setMostrarPassword(false);
    setModalOpen(true);
  };

  const abrirEditar = (usuario) => {
    setEditando(usuario.id);

    setForm({
      nombre: usuario.nombre || "",
      email: usuario.email || "",
      password: "",
      rol: usuario.rol || "empleado",
    });

    setErrorModal("");
    setMostrarPassword(false);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    if (guardando) return;

    setModalOpen(false);
    setForm(initialForm);
    setEditando(null);
    setErrorModal("");
    setMostrarPassword(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================================
     REGISTRO Y ACTUALIZACIÓN
     ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorModal("");

    const nombre = form.nombre.trim();
    const email = form.email.trim();
    const passwordNueva = form.password.trim();

    if (!nombre || !email) {
      setErrorModal("Ingresa el nombre y el correo electrónico.");
      return;
    }

    if (editando === null && !passwordNueva) {
      setErrorModal("La contraseña es obligatoria para crear un usuario.");
      return;
    }

    setGuardando(true);

    try {
      if (editando !== null) {
        const usuarioOriginal = usuarios.find(
          (usuario) => String(usuario.id) === String(editando)
        );

        if (!usuarioOriginal) {
          setErrorModal("No se encontró el usuario que deseas editar.");
          return;
        }

        // Si no se escribe una contraseña nueva,
        // se conserva la contraseña que ya tiene el usuario.
        const passwordFinal =
          passwordNueva || usuarioOriginal.password || "";

        if (!passwordFinal) {
          setErrorModal("Ingresa una contraseña para este usuario.");
          return;
        }

        const usuarioActualizado = await usuariosService.actualizarUsuario(
          editando,
          {
            nombre,
            email,
            password: passwordFinal,
            rol: form.rol,
          }
        );

        setUsuarios((prev) =>
          prev.map((usuario) =>
            String(usuario.id) === String(editando)
              ? {
                  ...usuario,
                  nombre,
                  email,
                  password: passwordFinal,
                  rol: form.rol,
                  ...(usuarioActualizado || {}),
                }
              : usuario
          )
        );

        mostrarNotificacion("Los datos del usuario se actualizaron correctamente.");
      } else {
        const nuevoUsuario = await usuariosService.crearUsuario({
          nombre,
          email,
          password: passwordNueva,
          rol: form.rol,
        });

        setUsuarios((prev) => [
          nuevoUsuario,
          ...prev,
        ]);

        setPaginaActual(1);

        mostrarNotificacion("El usuario se registró correctamente.");
      }

      setModalOpen(false);
      setForm(initialForm);
      setEditando(null);
      setMostrarPassword(false);
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      setErrorModal("No se pudo guardar el usuario. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  /* =====================================================
     ELIMINACIÓN DE USUARIOS
     ===================================================== */

  const abrirConfirmacionEliminar = (usuario) => {
    setUsuarioAEliminar(usuario);
    setErrorEliminar("");
  };

  const cerrarConfirmacionEliminar = () => {
    if (eliminando) return;

    setUsuarioAEliminar(null);
    setErrorEliminar("");
  };

  const confirmarEliminar = async () => {
    if (!usuarioAEliminar) return;

    setEliminando(true);
    setErrorEliminar("");

    try {
      await usuariosService.eliminarUsuario(usuarioAEliminar.id);

      setUsuarios((prev) =>
        prev.filter(
          (usuario) =>
            String(usuario.id) !== String(usuarioAEliminar.id)
        )
      );

      setUsuarioAEliminar(null);

      mostrarNotificacion("El usuario se eliminó correctamente.");
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setErrorEliminar("No se pudo eliminar el usuario. Intenta nuevamente.");
    } finally {
      setEliminando(false);
    }
  };

  /* =====================================================
     BÚSQUEDA
     ===================================================== */

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto = [
      usuario.nombre,
      usuario.email,
      usuario.rol,
    ]
      .join(" ")
      .toLocaleLowerCase("es");

    return texto.includes(busqueda.trim().toLocaleLowerCase("es"));
  });

  /* =====================================================
     PAGINACIÓN
     ===================================================== */

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, registrosPorPagina]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(usuariosFiltrados.length / registrosPorPagina)
  );

  const paginaActualSegura = Math.min(
    paginaActual,
    totalPaginas
  );

  const usuariosPaginados = usuariosFiltrados.slice(
    (paginaActualSegura - 1) * registrosPorPagina,
    paginaActualSegura * registrosPorPagina
  );

  // Ajustar la página cuando se elimina un usuario.
  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  /* =====================================================
     INDICADORES
     ===================================================== */

  const totalAdministradores = usuarios.filter(
    (usuario) => usuario.rol === "admin"
  ).length;

  const totalEmpleados = usuarios.filter(
    (usuario) => usuario.rol === "empleado"
  ).length;

  /* =====================================================
     INTERFAZ
     ===================================================== */

  return (
    <div className="admin-module-page">

      {/* Encabezado */}
      <section className="admin-page-heading">
        <div>
          <p className="admin-page-heading__eyebrow">
            Administración
          </p>

          <h1 className="admin-page-heading__title">
            Gestión de usuarios
          </h1>

          <p className="admin-page-heading__description">
            Administra las cuentas y los roles del personal que accede al sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevo}
          className="admin-primary-button"
        >
          <UserPlus size={16} />
          <span>Nuevo usuario</span>
        </button>
      </section>

      {/* Indicadores */}
      <section className="admin-stat-grid">

        <article className="admin-stat-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="admin-stat-card__label">
                Usuarios registrados
              </p>

              <p className="admin-stat-card__value">
                {usuarios.length}
              </p>

              <p className="admin-stat-card__note">
                Total de cuentas del sistema
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F1EB] text-[#702D40]">
              <Users size={21} />
            </div>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="admin-stat-card__label">
                Administradores
              </p>

              <p className="admin-stat-card__value">
                {totalAdministradores}
              </p>

              <p className="admin-stat-card__note">
                Cuentas con rol administrador
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EEF0] text-[#702D40]">
              <ShieldCheck size={21} />
            </div>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="admin-stat-card__label">
                Empleados
              </p>

              <p className="admin-stat-card__value">
                {totalEmpleados}
              </p>

              <p className="admin-stat-card__note">
                Cuentas con rol empleado
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F4F0EB] text-[#81786F]">
              <UserRound size={21} />
            </div>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="admin-stat-card__label">
                Resultados
              </p>

              <p className="admin-stat-card__value">
                {usuariosFiltrados.length}
              </p>

              <p className="admin-stat-card__note">
                Usuarios según la búsqueda
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F1EB] text-[#827970]">
              <Search size={21} />
            </div>
          </div>
        </article>

      </section>

      {/* Búsqueda */}
      <section className="admin-toolbar">
        <div className="admin-toolbar__search">
          <Search
            size={16}
            className="admin-search-icon"
          />

          <input
            id="usuarios-busqueda"
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, correo o rol..."
            className="admin-field-control admin-search-input"
            aria-label="Buscar usuarios"
          />
        </div>

        <div className="admin-toolbar__filters">
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda("")}
              className="admin-clear-filter"
            >
              Limpiar búsqueda
            </button>
          )}

          <span className="text-[11px] text-[#827970]">
            {usuariosFiltrados.length}{" "}
            {usuariosFiltrados.length === 1
              ? "usuario encontrado"
              : "usuarios encontrados"}
          </span>
        </div>
      </section>

      {/* Tabla */}
      <section className="admin-table-card">

        {loading ? (
          <div className="admin-loading-state">
            <div className="admin-spinner" />
            Cargando usuarios...
          </div>
        ) : error ? (
          <div className="admin-empty-state">
            <div className="admin-empty-state__title">
              No se pudo cargar la información
            </div>

            <p className="mb-4">
              {error}
            </p>

            <button
              type="button"
              onClick={cargarUsuarios}
              className="admin-primary-button"
            >
              Reintentar
            </button>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="admin-empty-state">
            <Users
              size={34}
              className="mx-auto mb-3 text-[#B7A493]"
            />

            <p className="admin-empty-state__title">
              {busqueda
                ? "No se encontraron usuarios"
                : "Todavía no hay usuarios registrados"}
            </p>

            <p>
              {busqueda
                ? "Prueba con otro nombre, correo o rol."
                : "Registra un nuevo usuario para comenzar."}
            </p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo electrónico</th>
                  <th>Rol asignado</th>
                  <th style={{ textAlign: "right" }}>
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {usuariosPaginados.map((usuario) => (
                  <tr key={usuario.id}>

                    {/* Usuario */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2E7E9] text-[12px] font-semibold text-[#702D40]">
                          {obtenerIniciales(usuario.nombre)}
                        </div>

                        <div className="min-w-0">
                          <p className="admin-table-primary-text">
                            {usuario.nombre}
                          </p>

                          <span className="admin-table-secondary-text">
                            Cuenta de acceso
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Correo */}
                    <td>
                      <div className="flex items-center gap-2">
                        <Mail
                          size={14}
                          className="shrink-0 text-[#B7A493]"
                        />

                        <span className="break-all">
                          {usuario.email}
                        </span>
                      </div>
                    </td>

                    {/* Rol */}
                    <td>
                      <span
                        className={`admin-pill ${
                          usuario.rol === "admin"
                            ? "admin-pill--promo"
                            : "admin-pill--neutral"
                        }`}
                      >
                        {usuario.rol === "admin" && (
                          <ShieldCheck size={12} />
                        )}

                        {usuario.rol === "empleado" && (
                          <UserRound size={12} />
                        )}

                        {obtenerEtiquetaRol(usuario.rol)}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          onClick={() => abrirEditar(usuario)}
                          className="admin-row-action"
                          title="Editar usuario"
                          aria-label={`Editar usuario ${usuario.nombre}`}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => abrirConfirmacionEliminar(usuario)}
                          className="admin-row-action admin-row-action--danger"
                          title="Eliminar usuario"
                          aria-label={`Eliminar usuario ${usuario.nombre}`}
                        >
                          <Trash2 size={16} />
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

      {/* Paginación */}
      {!loading && !error && usuariosFiltrados.length > 0 && (
        <AdminPagination
          currentPage={paginaActualSegura}
          totalItems={usuariosFiltrados.length}
          pageSize={registrosPorPagina}
          onPageChange={setPaginaActual}
          onPageSizeChange={(cantidad) => {
            setRegistrosPorPagina(cantidad);
            setPaginaActual(1);
          }}
        />
      )}

      {/* =================================================
          MODAL DE REGISTRO Y EDICIÓN
          ================================================= */}

      {modalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              cerrarModal();
            }
          }}
        >
          <section
            className="admin-modal-card admin-modal-card--small"
            role="dialog"
            aria-modal="true"
            aria-labelledby="usuario-modal-title"
          >

            {/* Encabezado */}
            <header className="admin-modal-header">
              <div>
                <p className="admin-modal-header__eyebrow">
                  Gestión de personal
                </p>

                <h2
                  id="usuario-modal-title"
                  className="admin-modal-header__title"
                >
                  {editando !== null
                    ? "Editar usuario"
                    : "Registrar usuario"}
                </h2>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                disabled={guardando}
                className="admin-modal-close"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleSubmit}>

              <div className="admin-modal-body">

                {errorModal && (
                  <div
                    className="admin-alert admin-alert--error"
                    role="alert"
                  >
                    <AlertTriangle
                      size={17}
                      className="shrink-0"
                    />

                    <span>{errorModal}</span>
                  </div>
                )}

                <div className="admin-form-grid">

                  {/* Nombre */}
                  <div className="admin-form-field admin-form-field--full">
                    <label
                      htmlFor="usuario-nombre"
                      className="admin-form-label"
                    >
                      Nombre completo
                    </label>

                    <input
                      id="usuario-nombre"
                      name="nombre"
                      type="text"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Ingresa el nombre del usuario"
                      className="admin-field-control"
                      autoComplete="name"
                      required
                    />
                  </div>

                  {/* Correo */}
                  <div className="admin-form-field admin-form-field--full">
                    <label
                      htmlFor="usuario-email"
                      className="admin-form-label"
                    >
                      Correo electrónico
                    </label>

                    <input
                      id="usuario-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="ejemplo@correo.com"
                      className="admin-field-control"
                      autoComplete="email"
                      required
                    />
                  </div>

                  {/* Contraseña */}
                  <div className="admin-form-field admin-form-field--full">
                    <label
                      htmlFor="usuario-password"
                      className="admin-form-label"
                    >
                      {editando !== null
                        ? "Nueva contraseña"
                        : "Contraseña"}
                    </label>

                    <div className="relative">
                      <KeyRound
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B7A493] pointer-events-none"
                      />

                      <input
                        id="usuario-password"
                        name="password"
                        type={mostrarPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleChange}
                        placeholder={
                          editando !== null
                            ? "Dejar vacío para conservar la actual"
                            : "Ingresa una contraseña"
                        }
                        className="admin-field-control"
                        style={{
                          paddingLeft: "38px",
                          paddingRight: "43px",
                        }}
                        autoComplete="new-password"
                        required={editando === null}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setMostrarPassword((prev) => !prev)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9087] hover:text-[#702D40]"
                        aria-label={
                          mostrarPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {mostrarPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    <p className="admin-form-help">
                      {editando !== null
                        ? "Si no ingresas una contraseña nueva, se conservará la actual."
                        : "Esta contraseña será utilizada para acceder al panel administrativo."}
                    </p>
                  </div>

                  {/* Rol */}
                  <div className="admin-form-field admin-form-field--full">
                    <label
                      htmlFor="usuario-rol"
                      className="admin-form-label"
                    >
                      Rol del usuario
                    </label>

                    <select
                      id="usuario-rol"
                      name="rol"
                      value={form.rol}
                      onChange={handleChange}
                      className="admin-field-control"
                    >
                      <option value="empleado">
                        Empleado
                      </option>

                      <option value="admin">
                        Administrador
                      </option>
                    </select>

                    <p className="admin-form-help">
                      Selecciona el tipo de cuenta que tendrá el usuario.
                    </p>
                  </div>

                </div>
              </div>

              {/* Acciones */}
              <div className="admin-modal-body pt-0">
                <div className="admin-modal-actions">
                  <button
                    type="button"
                    onClick={cerrarModal}
                    disabled={guardando}
                    className="admin-secondary-button"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={guardando}
                    className="admin-primary-button"
                  >
                    {guardando ? (
                      <>
                        <LoaderCircle
                          size={16}
                          className="animate-spin"
                        />

                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />

                        {editando !== null
                          ? "Guardar cambios"
                          : "Registrar usuario"}
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </section>
        </div>
      )}

      {/* =================================================
          MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
          ================================================= */}

      {usuarioAEliminar && (
        <div
          className="admin-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              cerrarConfirmacionEliminar();
            }
          }}
        >
          <section
            className="admin-modal-card admin-modal-card--small"
            role="dialog"
            aria-modal="true"
            aria-labelledby="usuario-eliminar-title"
          >

            <header className="admin-modal-header">
              <div>
                <p className="admin-modal-header__eyebrow">
                  Confirmación
                </p>

                <h2
                  id="usuario-eliminar-title"
                  className="admin-modal-header__title"
                >
                  Eliminar usuario
                </h2>
              </div>

              <button
                type="button"
                onClick={cerrarConfirmacionEliminar}
                disabled={eliminando}
                className="admin-modal-close"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </header>

            <div className="admin-modal-body">

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FBF0EC] text-[#A33F49]">
                  <AlertTriangle size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#292522]">
                    ¿Estás seguro de eliminar este usuario?
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-[#827970]">
                    Se eliminará su cuenta del sistema. Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>

              <div className="admin-delete-preview">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2E7E9] text-[12px] font-semibold text-[#702D40]">
                  {obtenerIniciales(usuarioAEliminar.nombre)}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#292522]">
                    {usuarioAEliminar.nombre}
                  </p>

                  <p className="mt-1 break-all text-[11px] text-[#827970]">
                    {usuarioAEliminar.email}
                  </p>

                  <span
                    className={`admin-pill mt-2 ${
                      usuarioAEliminar.rol === "admin"
                        ? "admin-pill--promo"
                        : "admin-pill--neutral"
                    }`}
                  >
                    {obtenerEtiquetaRol(usuarioAEliminar.rol)}
                  </span>
                </div>
              </div>

              {errorEliminar && (
                <div
                  className="admin-alert admin-alert--error mt-4"
                  role="alert"
                >
                  <AlertTriangle
                    size={17}
                    className="shrink-0"
                  />

                  <span>{errorEliminar}</span>
                </div>
              )}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={cerrarConfirmacionEliminar}
                  disabled={eliminando}
                  className="admin-secondary-button"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={confirmarEliminar}
                  disabled={eliminando}
                  className="admin-danger-button"
                >
                  {eliminando ? (
                    <>
                      <LoaderCircle
                        size={15}
                        className="animate-spin"
                      />

                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      Eliminar usuario
                    </>
                  )}
                </button>
              </div>

            </div>
          </section>
        </div>
      )}

      {/* Notificación */}
      {toast && (
        <div
          key={toast.id}
          className="admin-toast"
          role="status"
        >
          <div className="admin-toast__icon">
            <CheckCircle2 size={17} />
          </div>

          <p className="admin-toast__message">
            {toast.mensaje}
          </p>

          <button
            type="button"
            onClick={() => setToast(null)}
            className="admin-toast__close"
            aria-label="Cerrar notificación"
          >
            <X size={16} />
          </button>
        </div>
      )}

    </div>
  );
};

export default Usuarios;


