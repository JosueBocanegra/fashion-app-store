import { useEffect, useState } from "react";
import { clientesService } from "../services/clientesService";

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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim() || !form.apellido.trim() || !form.email.trim()) {
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

  const handleEliminar = async (cliente) => {
    const confirmar = window.confirm(
      `¿Eliminar a ${cliente.nombre} ${cliente.apellido}? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    try {
      await clientesService.eliminarCliente(cliente.id);
      setClientes((prev) => prev.filter((c) => c.id !== cliente.id));
    } catch (err) {
      setError("No se pudo eliminar el cliente.");
    }
  };

  const clientesFiltrados = clientes.filter((c) => {
    const texto = `${c.nombre} ${c.apellido} ${c.email} ${c.dni}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-light text-neutral-900 tracking-tight">
            Gestión de clientes
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Administra los clientes registrados en Fashion Store.
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-medium bg-[#8a5a63] hover:bg-[#754b53] transition-colors"
        >
          + Nuevo cliente
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, correo o DNI..."
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
          <p className="p-6 text-sm text-neutral-500">Cargando clientes...</p>
        ) : clientesFiltrados.length === 0 ? (
          <p className="p-6 text-sm text-neutral-500">
            No hay clientes registrados todavía.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-neutral-500 text-left uppercase text-xs tracking-wider">
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Correo</th>
                <th className="px-5 py-3">Teléfono</th>
                <th className="px-5 py-3">DNI</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="border-t border-stone-100">
                  <td className="px-5 py-3 text-neutral-800">
                    {cliente.nombre} {cliente.apellido}
                  </td>
                  <td className="px-5 py-3 text-neutral-600">{cliente.email}</td>
                  <td className="px-5 py-3 text-neutral-600">
                    {cliente.telefono || "—"}
                  </td>
                  <td className="px-5 py-3 text-neutral-600">{cliente.dni || "—"}</td>
                  <td className="px-5 py-3 text-right space-x-3">
                    <button
                      onClick={() => abrirEditar(cliente)}
                      className="text-[#8a5a63] hover:text-[#754b53] font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(cliente)}
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
              {editando ? "Editar cliente" : "Nuevo cliente"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
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
                    Apellido
                  </label>
                  <input
                    name="apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                  />
                </div>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Teléfono
                  </label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    DNI
                  </label>
                  <input
                    name="dni"
                    value={form.dni}
                    onChange={handleChange}
                    maxLength={8}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Dirección
                </label>
                <input
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                />
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

export default Clientes;