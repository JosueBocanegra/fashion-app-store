import { useEffect, useState } from "react";
import { usuariosService } from "../services/usuariosService";

const initialForm = {
  nombre: "",
  email: "",
  password: "",
  rol: "empleado",
};

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const cargarUsuarios = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await usuariosService.obtenerUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(initialForm);
    setError("");
    setModalOpen(true);
  };

  const abrirEditar = (usuario) => {
    setEditando(usuario.id);

    setForm({
      nombre: usuario.nombre || "",
      email: usuario.email || "",
      password: usuario.password || "",
      rol: usuario.rol || "empleado",
    });

    setError("");
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
      !form.email.trim() ||
      (!editando && !form.password.trim())
    ) {
      setError("Nombre, correo y contraseña son obligatorios.");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      if (editando) {
        await usuariosService.actualizarUsuario(editando, form);
      } else {
        await usuariosService.crearUsuario(form);
      }

      await cargarUsuarios();
      cerrarModal();
    } catch (err) {
      setError("No se pudo guardar el usuario. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (usuario) => {
    const confirmar = window.confirm(
      `¿Eliminar al usuario ${usuario.nombre}? Esta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    try {
      await usuariosService.eliminarUsuario(usuario.id);

      setUsuarios((prev) =>
        prev.filter((u) => u.id !== usuario.id)
      );
    } catch (err) {
      setError("No se pudo eliminar el usuario.");
    }
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto = `${usuario.nombre} ${usuario.email} ${usuario.rol}`.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-light text-neutral-900 tracking-tight">
            Gestión de usuarios
          </h1>

          <p className="text-neutral-500 text-sm mt-1">
            Administra los trabajadores que tienen acceso al panel administrativo.
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-medium bg-[#8a5a63] hover:bg-[#754b53] transition-colors"
        >
          + Nuevo usuario
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, correo o rol..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full sm:w-80 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#8a5a63] focus:ring-4 focus:ring-[#8a5a63]/10 transition"
        />
      </div>

      {error && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-3.5">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-neutral-500">
            Cargando usuarios...
          </p>
        ) : usuariosFiltrados.length === 0 ? (
          <p className="p-6 text-sm text-neutral-500">
            No hay usuarios registrados todavía.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-neutral-500 text-left uppercase text-xs tracking-wider">
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Correo</th>
                <th className="px-5 py-3">Rol</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-t border-stone-100"
                >
                  <td className="px-5 py-3 text-neutral-800">
                    {usuario.nombre}
                  </td>

                  <td className="px-5 py-3 text-neutral-600">
                    {usuario.email}
                  </td>

                  <td className="px-5 py-3 text-neutral-600 capitalize">
                    {usuario.rol}
                  </td>

                  <td className="px-5 py-3 text-right space-x-3">
                    <button
                      onClick={() => abrirEditar(usuario)}
                      className="text-[#8a5a63] hover:text-[#754b53] font-medium"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleEliminar(usuario)}
                      className="text-rose-600 hover:text-rose-800 font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-medium text-neutral-900 mb-4">
              {editando ? "Editar usuario" : "Nuevo usuario"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Nombre
                </label>

                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Correo electrónico
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Contraseña
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required={!editando}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Rol
                </label>

                <select
                  name="rol"
                  value={form.rol}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                >
                  <option value="empleado">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 rounded-lg text-sm text-neutral-600 hover:bg-stone-100"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 rounded-lg text-sm text-white bg-[#8a5a63] hover:bg-[#754b53] disabled:opacity-60"
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;