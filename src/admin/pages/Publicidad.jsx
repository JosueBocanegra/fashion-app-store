
import { useEffect, useState } from "react";
import {
  ImagePlus,
  Store,
  Upload,
  Trash2,
  Pencil,
  Power,
  X,
  ShoppingBag,
} from "lucide-react";

import { publicidadService } from "../services/publicidadService";
import { convertirImagenOptimizada } from "../../services/imagenService";

const initialForm = {
  titulo: "",
  descripcion: "",
  imagen: "",
  descuento: "",
  fechaInicio: "",
  fechaFin: "",
};

const resolverRutaImagen = (imagen) => {
  if (!imagen) return "";

  if (/^(https?:\/\/|data:|blob:)/i.test(imagen)) {
    return imagen;
  }

  return `/${imagen.replace(/^\/+/, "")}`;
};

const formatearFecha = (fecha) => {
  if (!fecha) return "Sin fecha";

  const partes = fecha.split("-");

  if (partes.length !== 3) return fecha;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const Publicidad = () => {
  const [publicidades, setPublicidades] = useState([]);
  const [configuracion, setConfiguracion] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal de publicidad
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [imagenPreview, setImagenPreview] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Estado de operaciones individuales
  const [actualizandoId, setActualizandoId] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);

  // Búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Logo
  const [logoPreview, setLogoPreview] = useState("");
  const [logoSeleccionado, setLogoSeleccionado] = useState("");
  const [guardandoLogo, setGuardandoLogo] = useState(false);
  const [errorLogo, setErrorLogo] = useState("");
  const [mensajeLogo, setMensajeLogo] = useState("");

  // Carga de publicidades y configuración.
  const cargarDatos = async () => {
    setLoading(true);
    setError("");

    try {
      const [publicidadesData, configuracionData] = await Promise.all([
        publicidadService.obtenerPublicidad(),
        publicidadService.obtenerConfiguracionTienda(),
      ]);

      const listaPublicidades = Array.isArray(publicidadesData)
        ? publicidadesData
        : [];

      setPublicidades(listaPublicidades);
      setConfiguracion(configuracionData || {});
      setLogoPreview(configuracionData?.logo || "");
    } catch (err) {
      console.error("Error cargando publicidad:", err);

      setError(
        "No se pudo cargar la información. Verifica que JSON Server esté ejecutándose y que exista la colección configuracion en db.json."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Apertura del modal para una publicidad nueva.
  const abrirNuevo = () => {
    setEditando(null);
    setForm(initialForm);
    setImagenPreview("");
    setErrorFormulario("");
    setModalOpen(true);
  };

  // Apertura del modal para editar una publicidad existente.
  const abrirEditar = (publicidad) => {
    setEditando(publicidad);

    setForm({
      titulo: publicidad.titulo || "",
      descripcion: publicidad.descripcion || "",
      imagen: publicidad.imagen || "",
      descuento: publicidad.descuento ?? "",
      fechaInicio: publicidad.fechaInicio || "",
      fechaFin: publicidad.fechaFin || "",
    });

    setImagenPreview(publicidad.imagen || "");
    setErrorFormulario("");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    if (guardando) return;

    setModalOpen(false);
    setEditando(null);
    setForm(initialForm);
    setImagenPreview("");
    setErrorFormulario("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorFormulario("");
  };

  // Procesamiento y previsualización de una imagen de publicidad.
  const handleSeleccionarImagen = async (e) => {
    const archivo = e.target.files?.[0];

    if (!archivo) return;

    setErrorFormulario("");

    try {
      const imagen = await convertirImagenOptimizada(archivo, {
        maxWidth: 1600,
        maxHeight: 900,
        quality: 0.82,
      });

      setForm((prev) => ({
        ...prev,
        imagen,
      }));

      setImagenPreview(imagen);
    } catch (err) {
      setErrorFormulario(err.message);
    } finally {
      e.target.value = "";
    }
  };

  // Guardar publicidad nueva o editar una existente.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.titulo.trim()) {
      setErrorFormulario("El título de la publicidad es obligatorio.");
      return;
    }

    if (!form.imagen) {
      setErrorFormulario("Debes seleccionar una imagen.");
      return;
    }

    if (
      form.fechaInicio &&
      form.fechaFin &&
      form.fechaFin < form.fechaInicio
    ) {
      setErrorFormulario(
        "La fecha de fin no puede ser anterior a la fecha de inicio."
      );
      return;
    }

    setGuardando(true);
    setErrorFormulario("");

    const publicidadData = {
      ...form,
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      descuento:
        form.descuento === ""
          ? 0
          : Number(form.descuento),

      // Las nuevas publicidades empiezan desactivadas.
      // Las existentes conservan su estado actual.
      estado: editando
        ? Boolean(
            publicidades.find(
              (item) => String(item.id) === String(editando.id)
            )?.estado
          )
        : false,

      fechaCreacion:
        editando?.fechaCreacion || new Date().toISOString(),
    };

    try {
      if (editando) {
        const actualizada =
          await publicidadService.actualizarPublicidad(
            editando.id,
            publicidadData
          );

        setPublicidades((prev) =>
          prev.map((item) =>
            String(item.id) === String(editando.id)
              ? actualizada
              : item
          )
        );
      } else {
        const nueva = await publicidadService.crearPublicidad(
          publicidadData
        );

        setPublicidades((prev) => [...prev, nueva]);
      }

      cerrarModal();
    } catch (err) {
      console.error("Error guardando publicidad:", err);

      setErrorFormulario(
        "No se pudo guardar la publicidad. Verifica el servidor."
      );
    } finally {
      setGuardando(false);
    }
  };

  // Activar o desactivar una publicidad.
  const handleCambiarEstado = async (publicidad) => {
    if (actualizandoId !== null || eliminandoId !== null) return;

    const nuevoEstado = !Boolean(publicidad.estado);

    setActualizandoId(publicidad.id);
    setError("");

    try {
      const actualizada =
        await publicidadService.cambiarEstadoPublicidad(
          publicidad.id,
          nuevoEstado
        );

      setPublicidades((prev) =>
        prev.map((item) =>
          String(item.id) === String(publicidad.id)
            ? {
                ...item,
                ...actualizada,
                estado: nuevoEstado,
              }
            : item
        )
      );
    } catch (err) {
      console.error("Error cambiando estado:", err);
      setError("No se pudo cambiar el estado de la publicidad.");
    } finally {
      setActualizandoId(null);
    }
  };

  // Eliminar una publicidad.
  const handleEliminar = async (publicidad) => {
    const confirmar = window.confirm(
      `¿Eliminar la publicidad "${publicidad.titulo}"? Esta acción no se puede deshacer.`
    );

    if (!confirmar || eliminandoId !== null) return;

    setEliminandoId(publicidad.id);
    setError("");

    try {
      await publicidadService.eliminarPublicidad(publicidad.id);

      setPublicidades((prev) =>
        prev.filter(
          (item) => String(item.id) !== String(publicidad.id)
        )
      );
    } catch (err) {
      console.error("Error eliminando publicidad:", err);
      setError("No se pudo eliminar la publicidad.");
    } finally {
      setEliminandoId(null);
    }
  };

  // Seleccionar el nuevo logo de la tienda.
  const handleSeleccionarLogo = async (e) => {
    const archivo = e.target.files?.[0];

    if (!archivo) return;

    setErrorLogo("");
    setMensajeLogo("");

    try {
      const logo = await convertirImagenOptimizada(archivo, {
        maxWidth: 700,
        maxHeight: 300,
        quality: 0.88,
      });

      setLogoSeleccionado(logo);
      setLogoPreview(logo);
    } catch (err) {
      setErrorLogo(err.message);
    } finally {
      e.target.value = "";
    }
  };

  // Guardar o reemplazar el logo actual.
  const handleGuardarLogo = async () => {
    if (!logoSeleccionado) {
      setErrorLogo("Primero selecciona una imagen para el logo.");
      return;
    }

    setGuardandoLogo(true);
    setErrorLogo("");
    setMensajeLogo("");

    try {
      const resultado = await publicidadService.actualizarLogo(
        logoSeleccionado
      );

      setConfiguracion(resultado);
      setLogoPreview(resultado.logo || "");
      setLogoSeleccionado("");

      setMensajeLogo("El logo de la tienda se actualizó correctamente.");
    } catch (err) {
      console.error("Error actualizando logo:", err);
      setErrorLogo("No se pudo actualizar el logo de la tienda.");
    } finally {
      setGuardandoLogo(false);
    }
  };

  // Restaurar el identificador visual predeterminado.
  const handleRestaurarLogo = async () => {
    const confirmar = window.confirm(
      "¿Restaurar el logo predeterminado de Fashion Store?"
    );

    if (!confirmar || guardandoLogo) return;

    setGuardandoLogo(true);
    setErrorLogo("");
    setMensajeLogo("");

    try {
      const resultado = await publicidadService.actualizarLogo("");

      setConfiguracion(resultado);
      setLogoPreview("");
      setLogoSeleccionado("");

      setMensajeLogo(
        "Se restauró el identificador visual predeterminado."
      );
    } catch (err) {
      console.error("Error restaurando logo:", err);
      setErrorLogo("No se pudo restaurar el logo.");
    } finally {
      setGuardandoLogo(false);
    }
  };

  // Filtros de búsqueda y estado.
  const publicidadesFiltradas = publicidades.filter((publicidad) => {
    const texto = `${publicidad.titulo || ""} ${
      publicidad.descripcion || ""
    }`.toLocaleLowerCase("es");

    const coincideBusqueda = texto.includes(
      busqueda.toLocaleLowerCase("es")
    );

    const estado = Boolean(publicidad.estado);

    const coincideEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "activas" && estado) ||
      (filtroEstado === "inactivas" && !estado);

    return coincideBusqueda && coincideEstado;
  });

  const totalActivas = publicidades.filter(
    (item) => Boolean(item.estado)
  ).length;

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center
                      sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-light text-neutral-900 tracking-tight">
            Gestión de publicidad
          </h1>

          <p className="text-neutral-500 text-sm mt-1">
            Administra las imágenes promocionales y la identidad visual de la tienda.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevo}
          className="inline-flex items-center justify-center gap-2
                     px-4 py-2.5 rounded-xl text-white text-sm
                     font-medium bg-[#8a5a63] hover:bg-[#754b53]
                     transition-colors cursor-pointer"
        >
          <ImagePlus size={17} />
          Cargar publicidad
        </button>
      </div>

      {/* Error general */}
      {error && (
        <div className="bg-rose-50 border border-rose-200
                        text-rose-800 text-sm rounded-xl p-3.5"
        >
          {error}
        </div>
      )}

      {/* IDENTIDAD DE LA TIENDA */}
      <section className="bg-white rounded-2xl border border-stone-200
                          shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Store size={19} className="text-[#8a5a63]" />

            <h2 className="font-semibold text-neutral-800">
              Identidad de la tienda
            </h2>
          </div>

          <p className="text-xs text-neutral-500 mt-1">
            Gestiona el logo que identifica a Fashion Store en el sitio web.
          </p>
        </div>

        <div className="p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="w-full md:w-64 h-28 rounded-xl
                            border border-dashed border-stone-300
                            bg-stone-50 flex items-center justify-center
                            overflow-hidden p-4"
            >
              {logoPreview ? (
                <img
                  src={resolverRutaImagen(logoPreview)}
                  alt="Logo de Fashion Store"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="flex items-center gap-2 text-neutral-700">
                  <ShoppingBag className="w-8 h-8 text-[#8a5a63]" />

                  <span className="text-lg font-bold">
                    Fashion Store
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-neutral-800">
                Logo actual
              </h3>

              <p className="text-xs text-neutral-500 mt-1 max-w-lg">
                Solo puede existir un logo vigente. Al guardar otro,
                reemplazará al anterior en el sitio web.
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                <label
                  className="inline-flex items-center gap-2 px-4 py-2
                             rounded-lg bg-stone-100 hover:bg-stone-200
                             text-neutral-700 text-xs font-semibold
                             transition-colors cursor-pointer"
                >
                  <Upload size={15} />
                  Seleccionar logo

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleSeleccionarLogo}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleGuardarLogo}
                  disabled={!logoSeleccionado || guardandoLogo}
                  className="px-4 py-2 rounded-lg text-white text-xs
                             font-semibold bg-[#8a5a63] hover:bg-[#754b53]
                             transition-colors cursor-pointer
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardandoLogo ? "Guardando..." : "Guardar logo"}
                </button>

                {configuracion?.logo && (
                  <button
                    type="button"
                    onClick={handleRestaurarLogo}
                    disabled={guardandoLogo}
                    className="px-4 py-2 rounded-lg text-xs font-semibold
                               text-neutral-600 hover:bg-stone-100
                               transition-colors cursor-pointer
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Restaurar predeterminado
                  </button>
                )}
              </div>

              {logoSeleccionado && (
                <p className="text-xs text-neutral-500 mt-2">
                  Nuevo logo seleccionado. Pulsa «Guardar logo» para aplicarlo.
                </p>
              )}

              {errorLogo && (
                <p className="text-xs text-rose-600 mt-2">
                  {errorLogo}
                </p>
              )}

              {mensajeLogo && (
                <p className="text-xs text-emerald-700 mt-2">
                  {mensajeLogo}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PUBLICIDADES */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end
                        sm:justify-between gap-3 mb-4"
        >
          <div>
            <h2 className="text-lg font-semibold text-neutral-800">
              Publicidades del sitio
            </h2>

            <p className="text-xs text-neutral-500 mt-1">
              Administra las imágenes que aparecerán en el carrusel de la página principal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-neutral-500">
              {totalActivas} de {publicidades.length} activas
            </div>
          </div>
        </div>

        {/* Búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full sm:max-w-sm px-4 py-2.5 bg-white
                       border border-stone-200 rounded-xl text-sm
                       text-neutral-800 placeholder-neutral-400
                       focus:outline-none focus:border-[#8a5a63]
                       focus:ring-4 focus:ring-[#8a5a63]/10 transition"
          />

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2.5 bg-white border border-stone-200
                       rounded-xl text-sm text-neutral-700
                       focus:outline-none focus:border-[#8a5a63]
                       cursor-pointer"
          >
            <option value="todos">Todas las publicidades</option>
            <option value="activas">Solo activas</option>
            <option value="inactivas">Solo inactivas</option>
          </select>
        </div>

        {/* Galería */}
        {loading ? (
          <div className="bg-white border border-stone-200 rounded-xl
                          p-10 text-center text-sm text-neutral-500"
          >
            Cargando publicidades...
          </div>
        ) : publicidadesFiltradas.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl
                          p-10 text-center"
          >
            <ImagePlus size={32} className="mx-auto text-stone-300 mb-3" />

            <p className="text-sm font-medium text-neutral-700">
              {publicidades.length === 0
                ? "Todavía no has cargado publicidades."
                : "No se encontraron publicidades."}
            </p>

            <p className="text-xs text-neutral-400 mt-1">
              Carga una imagen para comenzar a crear tu carrusel promocional.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2
                          xl:grid-cols-3 gap-5"
          >
            {publicidadesFiltradas.map((publicidad) => {
              const activa = Boolean(publicidad.estado);
              const ocupada =
                actualizandoId === publicidad.id ||
                eliminandoId === publicidad.id;

              return (
                <article
                  key={publicidad.id}
                  className="bg-white border border-stone-200
                             rounded-2xl overflow-hidden shadow-sm
                             hover:shadow-md transition-shadow"
                >
                  {/* Imagen */}
                  <div className="relative aspect-[16/9] bg-stone-100">
                    {publicidad.imagen ? (
                      <img
                        src={resolverRutaImagen(publicidad.imagen)}
                        alt={publicidad.titulo || "Publicidad"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center
                                      justify-center text-neutral-400"
                      >
                        <ImagePlus size={34} />
                      </div>
                    )}

                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1
                                  rounded-full text-[11px] font-semibold
                                  border ${
                                    activa
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-white/95 text-neutral-600 border-stone-200"
                                  }`}
                    >
                      {activa ? "Activa" : "Inactiva"}
                    </span>

                    {Number(publicidad.descuento) > 0 && (
                      <span className="absolute bottom-3 left-3
                                       bg-[#8a5a63] text-white
                                       px-3 py-1 rounded-full
                                       text-xs font-semibold"
                      >
                        {publicidad.descuento}% OFF
                      </span>
                    )}
                  </div>

                  {/* Información */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-neutral-800
                                   truncate"
                    >
                      {publicidad.titulo || "Publicidad sin título"}
                    </h3>

                    <p className="text-xs text-neutral-500 mt-1
                                  line-clamp-2 min-h-8"
                    >
                      {publicidad.descripcion || "Sin descripción"}
                    </p>

                    {(publicidad.fechaInicio || publicidad.fechaFin) && (
                      <p className="text-[11px] text-neutral-400 mt-3">
                        Vigencia: {formatearFecha(publicidad.fechaInicio)}
                        {" - "}
                        {formatearFecha(publicidad.fechaFin)}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => handleCambiarEstado(publicidad)}
                        disabled={ocupada || actualizandoId !== null || eliminandoId !== null}
                        className={`col-span-1 flex items-center
                                    justify-center gap-1.5 px-2 py-2
                                    rounded-lg text-xs font-semibold
                                    transition-colors cursor-pointer
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    ${
                                      activa
                                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    }`}
                      >
                        {activa ? <Power size={14} /> : <Power size={14} />}
                        {actualizandoId === publicidad.id
                          ? "..."
                          : activa
                            ? "Desactivar"
                            : "Activar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => abrirEditar(publicidad)}
                        disabled={ocupada || actualizandoId !== null || eliminandoId !== null}
                        className="flex items-center justify-center gap-1.5
                                   px-2 py-2 rounded-lg text-xs font-semibold
                                   text-[#8a5a63] bg-[#8a5a63]/10
                                   hover:bg-[#8a5a63]/15 transition-colors
                                   cursor-pointer disabled:opacity-50
                                   disabled:cursor-not-allowed"
                      >
                        <Pencil size={14} />
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEliminar(publicidad)}
                        disabled={ocupada || actualizandoId !== null || eliminandoId !== null}
                        className="flex items-center justify-center gap-1.5
                                   px-2 py-2 rounded-lg text-xs font-semibold
                                   text-rose-600 bg-rose-50 hover:bg-rose-100
                                   transition-colors cursor-pointer
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal de carga / edición */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45
                        flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl
                          border border-stone-200 w-full max-w-xl
                          max-h-[92vh] overflow-y-auto"
          >
            {/* Encabezado */}
            <div className="flex items-center justify-between
                            px-6 py-4 border-b border-stone-100"
            >
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  {editando ? "Editar publicidad" : "Cargar publicidad"}
                </h2>

                <p className="text-xs text-neutral-500 mt-1">
                  Selecciona una imagen y completa su información.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                disabled={guardando}
                aria-label="Cerrar"
                className="w-9 h-9 rounded-lg flex items-center
                           justify-center text-neutral-500
                           hover:bg-stone-100 transition-colors
                           cursor-pointer disabled:opacity-50
                           disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Selector de imagen */}
              <div>
                <label className="block text-xs font-semibold
                                  text-neutral-700 mb-2"
                >
                  Imagen promocional
                </label>

                {imagenPreview ? (
                  <div className="relative rounded-xl overflow-hidden
                                  border border-stone-200 bg-stone-50"
                  >
                    <img
                      src={resolverRutaImagen(imagenPreview)}
                      alt="Vista previa de publicidad"
                      className="w-full aspect-[16/9] object-cover"
                    />

                    <label
                      className="absolute bottom-3 right-3 inline-flex
                                 items-center gap-2 px-3 py-2 rounded-lg
                                 bg-white/95 text-neutral-800 text-xs
                                 font-semibold shadow cursor-pointer
                                 hover:bg-white transition-colors"
                    >
                      <Upload size={14} />
                      Cambiar imagen

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleSeleccionarImagen}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center justify-center
                               gap-2 border-2 border-dashed
                               border-stone-300 rounded-xl p-8
                               bg-stone-50 hover:bg-stone-100
                               transition-colors cursor-pointer"
                  >
                    <ImagePlus size={34} className="text-[#8a5a63]" />

                    <span className="text-sm font-semibold text-neutral-700">
                      Seleccionar imagen
                    </span>

                    <span className="text-xs text-neutral-400">
                      JPG, PNG o WEBP. Máximo 5 MB.
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleSeleccionarImagen}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Título */}
              <div>
                <label className="block text-xs font-medium
                                  text-neutral-600 mb-1"
                >
                  Título
                </label>

                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="Ej. Nueva colección de verano"
                  className="w-full px-3 py-2.5 border
                             border-stone-200 rounded-lg text-sm
                             focus:outline-none focus:border-[#8a5a63]
                             focus:ring-2 focus:ring-[#8a5a63]/10"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-medium
                                  text-neutral-600 mb-1"
                >
                  Descripción (opcional)
                </label>

                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows="2"
                  maxLength={250}
                  placeholder="Texto breve para acompañar la imagen..."
                  className="w-full px-3 py-2.5 border
                             border-stone-200 rounded-lg text-sm
                             resize-none focus:outline-none
                             focus:border-[#8a5a63]
                             focus:ring-2 focus:ring-[#8a5a63]/10"
                />
              </div>

              {/* Descuento */}
              <div>
                <label className="block text-xs font-medium
                                  text-neutral-600 mb-1"
                >
                  Descuento (%) (opcional)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  name="descuento"
                  value={form.descuento}
                  onChange={handleChange}
                  placeholder="Ej. 20"
                  className="w-full px-3 py-2.5 border
                             border-stone-200 rounded-lg text-sm
                             focus:outline-none focus:border-[#8a5a63]
                             focus:ring-2 focus:ring-[#8a5a63]/10"
                />
              </div>

              {/* Vigencia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium
                                    text-neutral-600 mb-1"
                  >
                    Fecha de inicio (opcional)
                  </label>

                  <input
                    type="date"
                    name="fechaInicio"
                    value={form.fechaInicio}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border
                               border-stone-200 rounded-lg text-sm
                               focus:outline-none focus:border-[#8a5a63]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium
                                    text-neutral-600 mb-1"
                  >
                    Fecha de fin (opcional)
                  </label>

                  <input
                    type="date"
                    name="fechaFin"
                    value={form.fechaFin}
                    onChange={handleChange}
                    min={form.fechaInicio || undefined}
                    className="w-full px-3 py-2.5 border
                               border-stone-200 rounded-lg text-sm
                               focus:outline-none focus:border-[#8a5a63]"
                  />
                </div>
              </div>

              {!editando && (
                <p className="text-xs text-amber-700 bg-amber-50
                              border border-amber-100 rounded-lg p-3"
                >
                  La nueva publicidad se guardará inicialmente desactivada.
                  Podrás activarla desde su tarjeta cuando esté lista para mostrarse.
                </p>
              )}

              {errorFormulario && (
                <p className="text-xs text-rose-700 bg-rose-50
                              border border-rose-100 rounded-lg p-3"
                >
                  {errorFormulario}
                </p>
              )}

              {/* Acciones */}
              <div className="flex justify-end gap-3 pt-3
                              border-t border-stone-100"
              >
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={guardando}
                  className="px-4 py-2.5 rounded-lg text-sm
                             text-neutral-600 hover:bg-stone-100
                             transition-colors cursor-pointer
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2.5 rounded-lg text-sm
                             font-semibold text-white bg-[#8a5a63]
                             hover:bg-[#754b53] transition-colors
                             cursor-pointer disabled:opacity-60
                             disabled:cursor-not-allowed"
                >
                  {guardando
                    ? "Guardando..."
                    : editando
                      ? "Guardar cambios"
                      : "Guardar publicidad"}
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


