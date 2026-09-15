import { useEffect, useState } from "react";
import { publicidadService } from "../services/publicidadService";

const initialForm = {
  titulo: "",
  descripcion: "",
  imagen: "",
  descuento: "",
  fechaInicio: "",
  fechaFin: "",
  estado: true,
};

const Publicidad = () => {
  const [publicidades, setPublicidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const cargarPublicidades = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await publicidadService.obtenerPublicidad();
      setPublicidades(data);
    } catch (err) {
      setError("No se pudo cargar la publicidad.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPublicidades();
  }, []);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(initialForm);
    setError("");
    setModalOpen(true);
  };

  const abrirEditar = (publicidad) => {
    setEditando(publicidad.id);

    setForm({
      titulo: publicidad.titulo || "",
      descripcion: publicidad.descripcion || "",
      imagen: publicidad.imagen || "",
      descuento: publicidad.descuento ?? "",
      fechaInicio: publicidad.fechaInicio || "",
      fechaFin: publicidad.fechaFin || "",
      estado: publicidad.estado ?? true,
    });

    setError("");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditando(null);
    setForm(initialForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.titulo.trim() || !form.descripcion.trim()) {
      setError("El título y la descripción son obligatorios.");
      return;
    }

    setGuardando(true);
    setError("");

    const publicidadData = {
      ...form,
      descuento: form.descuento === "" ? 0 : Number(form.descuento),
    };

    try {
      if (editando) {
        await publicidadService.actualizarPublicidad(
          editando,
          publicidadData
        );
      } else {
        await publicidadService.crearPublicidad(publicidadData);
      }

      await cargarPublicidades();
      cerrarModal();
    } catch (err) {
      setError("No se pudo guardar la publicidad.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (publicidad) => {
    const confirmar = window.confirm(
      `¿Eliminar la publicidad "${publicidad.titulo}"?`
    );

    if (!confirmar) return;

    try {
      await publicidadService.eliminarPublicidad(publicidad.id);

      setPublicidades((prev) =>
        prev.filter((item) => item.id !== publicidad.id)
      );
    } catch (err) {
      setError("No se pudo eliminar la publicidad.");
    }
  };

  const publicidadesFiltradas = publicidades.filter((publicidad) => {
    const texto = `${publicidad.titulo} ${publicidad.descripcion}`.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-light text-neutral-900 tracking-tight">
            Gestión de publicidad
          </h1>

          <p className="text-neutral-500 text-sm mt-1">
            Administra las promociones y anuncios de la tienda.
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-medium bg-[#8a5a63] hover:bg-[#754b53] transition-colors"
        >
          + Nueva publicidad
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por título o descripción..."
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
            Cargando publicidad...
          </p>
        ) : publicidadesFiltradas.length === 0 ? (
          <p className="p-6 text-sm text-neutral-500">
            No hay publicidad registrada.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-neutral-500 text-left uppercase text-xs tracking-wider">
                <th className="px-5 py-3">Título</th>
                <th className="px-5 py-3">Descripción</th>
                <th className="px-5 py-3">Descuento</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {publicidadesFiltradas.map((publicidad) => (
                <tr
                  key={publicidad.id}
                  className="border-t border-stone-100"
                >
                  <td className="px-5 py-3 text-neutral-800 font-medium">
                    {publicidad.titulo}
                  </td>

                  <td className="px-5 py-3 text-neutral-600">
                    {publicidad.descripcion}
                  </td>

                  <td className="px-5 py-3 text-neutral-600">
                    {publicidad.descuento || 0}%
                  </td>

                  <td className="px-5 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs ${
                        publicidad.estado
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {publicidad.estado ? "Activa" : "Inactiva"}
                    </span>
                  </td>

                  <td className="px-5 py-3 text-right space-x-3">
                    <button
                      onClick={() => abrirEditar(publicidad)}
                      className="text-[#8a5a63] hover:text-[#754b53] font-medium"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleEliminar(publicidad)}
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
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-lg font-medium text-neutral-900 mb-4">
              {editando ? "Editar publicidad" : "Nueva publicidad"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Título
                </label>

                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Descripción
                </label>

                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm resize-none focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  URL o ruta de imagen
                </label>

                <input
                  name="imagen"
                  value={form.imagen}
                  onChange={handleChange}
                  placeholder="assets/img/oferta.jpg"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Descuento (%)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  name="descuento"
                  value={form.descuento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Fecha de inicio
                  </label>

                  <input
                    type="date"
                    name="fechaInicio"
                    value={form.fechaInicio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Fecha de fin
                  </label>

                  <input
                    type="date"
                    name="fechaFin"
                    value={form.fechaFin}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  name="estado"
                  checked={form.estado}
                  onChange={handleChange}
                />
                Publicidad activa
              </label>

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

export default Publicidad;