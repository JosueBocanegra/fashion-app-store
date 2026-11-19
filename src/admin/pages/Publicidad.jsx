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
  CheckCircle2,
} from "lucide-react";

import { publicidadService } from "../services/publicidadService";
import { convertirImagenOptimizada } from "../../services/imagenService";

const formularioPublicidadInicial = {
  titulo: "",
  descripcion: "",
  imagen: "",
};

const resolverRutaImagen = (imagen) => {
  if (!imagen) return "";

  if (/^(https?:\/\/|data:|blob:)/i.test(imagen)) {
    return imagen;
  }

  return `/${imagen.replace(/^\/+/, "")}`;
};

const generarId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `logo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

// Permite conservar un logo registrado anteriormente
// cuando se realiza la migración de la configuración.
const normalizarConfiguracion = (configuracion) => {
  const logos = Array.isArray(configuracion?.logos)
    ? configuracion.logos
    : [];

  let logosNormalizados = logos;
  let logoActivoId = configuracion?.logoActivoId ?? null;

  if (logosNormalizados.length === 0 && configuracion?.logo) {
    const logoAnterior = {
      id: "logo-anterior",
      nombre: "Logo anterior",
      imagen: configuracion.logo,
      fechaCreacion: new Date().toISOString(),
    };

    logosNormalizados = [logoAnterior];
    logoActivoId = logoAnterior.id;
  }

  return {
    ...configuracion,
    logos: logosNormalizados,
    logoActivoId,
  };
};

const Publicidad = () => {
  const [publicidades, setPublicidades] = useState([]);

  const [configuracion, setConfiguracion] = useState({
    logos: [],
    logoActivoId: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Formulario de publicidad
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formularioPublicidadInicial);
  const [imagenPreview, setImagenPreview] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [guardandoPublicidad, setGuardandoPublicidad] = useState(false);

  // Operaciones de publicidades
  const [actualizandoId, setActualizandoId] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);

  // Búsqueda y filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Formulario de logotipos
  const [nombreLogo, setNombreLogo] = useState("");
  const [imagenLogo, setImagenLogo] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [errorLogo, setErrorLogo] = useState("");
  const [mensajeLogo, setMensajeLogo] = useState("");
  const [guardandoLogo, setGuardandoLogo] = useState(false);

  // Carga inicial de publicidades y configuración.
  const cargarDatos = async () => {
    setLoading(true);
    setError("");

    try {
      const [publicidadesData, configuracionData] = await Promise.all([
        publicidadService.obtenerPublicidad(),
        publicidadService.obtenerConfiguracionTienda(),
      ]);

      setPublicidades(
        Array.isArray(publicidadesData) ? publicidadesData : []
      );

      setConfiguracion(normalizarConfiguracion(configuracionData));
    } catch (err) {
      console.error("Error cargando publicidad:", err);

      setError(
        "No se pudo cargar la información. Verifica que JSON Server esté ejecutándose."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --------------------------------------------------
  // PUBLICIDADES
  // --------------------------------------------------

  const abrirNuevaPublicidad = () => {
    setEditando(null);
    setForm(formularioPublicidadInicial);
    setImagenPreview("");
    setErrorFormulario("");
    setModalOpen(true);
  };

  const abrirEditarPublicidad = (publicidad) => {
    setEditando(publicidad);

    setForm({
      titulo: publicidad.titulo || "",
      descripcion: publicidad.descripcion || "",
      imagen: publicidad.imagen || "",
    });

    setImagenPreview(publicidad.imagen || "");
    setErrorFormulario("");
    setModalOpen(true);
  };

  const cerrarModalPublicidad = () => {
    setModalOpen(false);
    setEditando(null);
    setForm(formularioPublicidadInicial);
    setImagenPreview("");
    setErrorFormulario("");
  };

  const handleChangePublicidad = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorFormulario("");
  };

  const handleSeleccionarImagenPublicidad = async (e) => {
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

  const handleGuardarPublicidad = async (e) => {
    e.preventDefault();

    if (!form.titulo.trim()) {
      setErrorFormulario("El nombre de la publicidad es obligatorio.");
      return;
    }

    if (!form.imagen) {
      setErrorFormulario("Debes seleccionar una imagen.");
      return;
    }

    setGuardandoPublicidad(true);
    setErrorFormulario("");

    const publicidadData = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      imagen: form.imagen,

      // Las nuevas publicidades se registran inactivas.
      // Al editar se conserva el estado que ya tenían.
      estado: editando ? Boolean(editando.estado) : false,

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

      cerrarModalPublicidad();
    } catch (err) {
      console.error("Error guardando publicidad:", err);

      setErrorFormulario(
        "No se pudo guardar la publicidad. Verifica el servidor."
      );
    } finally {
      setGuardandoPublicidad(false);
    }
  };

  const handleCambiarEstadoPublicidad = async (publicidad) => {
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

  const handleEliminarPublicidad = async (publicidad) => {
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

  // --------------------------------------------------
  // LOGOTIPOS
  // --------------------------------------------------

  const logos = configuracion?.logos || [];

  const logoActivo = logos.find(
    (logo) =>
      String(logo.id) === String(configuracion?.logoActivoId)
  );

  // Actualiza la configuración y comunica el nuevo logo
  // a los componentes que lo utilizan.
  const guardarConfiguracionLogos = async (nuevaLista, nuevoLogoActivoId) => {
    const resultado = await publicidadService.actualizarLogos(
      nuevaLista,
      nuevoLogoActivoId
    );

    const configuracionActualizada =
      normalizarConfiguracion(resultado);

    setConfiguracion(configuracionActualizada);

    const logoActual = configuracionActualizada.logos.find(
      (logo) =>
        String(logo.id) ===
        String(configuracionActualizada.logoActivoId)
    );

    window.dispatchEvent(
      new CustomEvent("logo-tienda-actualizado", {
        detail: {
          logo: logoActual?.imagen || "",
        },
      })
    );

    return configuracionActualizada;
  };

  const handleSeleccionarLogo = async (e) => {
    const archivo = e.target.files?.[0];

    if (!archivo) return;

    setErrorLogo("");
    setMensajeLogo("");

    try {
      const imagen = await convertirImagenOptimizada(archivo, {
        maxWidth: 700,
        maxHeight: 300,
        quality: 0.88,
      });

      setImagenLogo(imagen);
      setLogoPreview(imagen);
    } catch (err) {
      setErrorLogo(err.message);
    } finally {
      e.target.value = "";
    }
  };

  const handleGuardarLogo = async () => {
    if (!nombreLogo.trim()) {
      setErrorLogo("Debes ingresar un nombre para el logotipo.");
      return;
    }

    if (!imagenLogo) {
      setErrorLogo("Debes seleccionar una imagen para el logotipo.");
      return;
    }

    setGuardandoLogo(true);
    setErrorLogo("");
    setMensajeLogo("");

    try {
      const nuevoLogo = {
        id: generarId(),
        nombre: nombreLogo.trim(),
        imagen: imagenLogo,
        fechaCreacion: new Date().toISOString(),
      };

      await guardarConfiguracionLogos(
        [...logos, nuevoLogo],
        configuracion.logoActivoId || null
      );

      setNombreLogo("");
      setImagenLogo("");
      setLogoPreview("");

      setMensajeLogo(
        "El logotipo se guardó correctamente. Puedes activarlo cuando lo necesites."
      );
    } catch (err) {
      console.error("Error guardando logo:", err);
      setErrorLogo("No se pudo guardar el logotipo.");
    } finally {
      setGuardandoLogo(false);
    }
  };

  const handleActivarLogo = async (logo) => {
    if (guardandoLogo) return;

    if (
      String(configuracion.logoActivoId) === String(logo.id)
    ) {
      return;
    }

    setGuardandoLogo(true);
    setErrorLogo("");
    setMensajeLogo("");

    try {
      await guardarConfiguracionLogos(logos, logo.id);

      setMensajeLogo(
        `El logotipo "${logo.nombre}" ahora está activo en la tienda.`
      );
    } catch (err) {
      console.error("Error activando logo:", err);
      setErrorLogo("No se pudo activar el logotipo.");
    } finally {
      setGuardandoLogo(false);
    }
  };

  const handleDesactivarLogo = async () => {
    if (guardandoLogo) return;

    setGuardandoLogo(true);
    setErrorLogo("");
    setMensajeLogo("");

    try {
      await guardarConfiguracionLogos(logos, null);

      setMensajeLogo(
        "Se desactivó el logotipo. Se mostrará la identidad predeterminada."
      );
    } catch (err) {
      console.error("Error desactivando logo:", err);
      setErrorLogo("No se pudo desactivar el logotipo.");
    } finally {
      setGuardandoLogo(false);
    }
  };

  const handleEliminarLogo = async (logo) => {
    const confirmar = window.confirm(
      `¿Eliminar el logotipo "${logo.nombre}"? Esta acción no se puede deshacer.`
    );

    if (!confirmar || guardandoLogo) return;

    setGuardandoLogo(true);
    setErrorLogo("");
    setMensajeLogo("");

    try {
      const nuevaLista = logos.filter(
        (item) => String(item.id) !== String(logo.id)
      );

      const nuevoLogoActivoId =
        String(configuracion.logoActivoId) === String(logo.id)
          ? null
          : configuracion.logoActivoId;

      await guardarConfiguracionLogos(
        nuevaLista,
        nuevoLogoActivoId
      );

      setMensajeLogo("El logotipo se eliminó correctamente.");
    } catch (err) {
      console.error("Error eliminando logo:", err);
      setErrorLogo("No se pudo eliminar el logotipo.");
    } finally {
      setGuardandoLogo(false);
    }
  };

  // --------------------------------------------------
  // FILTROS Y CONTADORES
  // --------------------------------------------------

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

  // --------------------------------------------------
  // VISTA
  // --------------------------------------------------

  return (
    <div className="space-y-8">

      {/* Encabezado general */}
      <div>
        <h1 className="text-2xl font-light text-neutral-900 tracking-tight">
          Gestión de publicidad
        </h1>

        <p className="text-neutral-500 text-sm mt-1">
          Administra los logotipos y las imágenes promocionales de Fashion Store.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-3.5">
          {error}
        </div>
      )}

      {/* =================================================
          SECCIÓN 1: LOGOTIPOS
      ================================================== */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">

        <div className="px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Store size={19} className="text-[#8a5a63]" />

            <h2 className="font-semibold text-neutral-800">
              Logotipos de la tienda
            </h2>
          </div>

          <p className="text-xs text-neutral-500 mt-1">
            Guarda diferentes versiones del logo y selecciona cuál deseas utilizar.
          </p>
        </div>

        <div className="p-5 space-y-6">

          {/* Logo actualmente activo */}
          <div className="flex flex-col md:flex-row md:items-center gap-5 p-4 rounded-xl bg-stone-50 border border-stone-200">

            <div className="w-full md:w-56 h-24 rounded-lg bg-white border border-stone-200 flex items-center justify-center overflow-hidden p-4">
              {logoActivo ? (
                <img
                  src={resolverRutaImagen(logoActivo.imagen)}
                  alt={logoActivo.nombre}
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
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Identidad visible actualmente
              </span>

              <h3 className="text-sm font-semibold text-neutral-800 mt-1">
                {logoActivo?.nombre || "Logo predeterminado"}
              </h3>

              <p className="text-xs text-neutral-500 mt-1">
                {logoActivo
                  ? "Este logotipo se muestra en el sitio web y en el panel administrativo."
                  : "Actualmente se muestra el identificador predeterminado de Fashion Store."}
              </p>

              {logoActivo && (
                <button
                  type="button"
                  onClick={handleDesactivarLogo}
                  disabled={guardandoLogo}
                  className="mt-3 text-xs font-semibold text-amber-700 hover:text-amber-800 disabled:opacity-50 cursor-pointer"
                >
                  Desactivar logo actual
                </button>
              )}
            </div>

            {logoActivo && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1.5 text-xs font-semibold">
                <CheckCircle2 size={14} />
                Activo
              </span>
            )}
          </div>

          {/* Formulario para añadir logos */}
          <div className="border border-stone-200 rounded-xl p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-800">
                Registrar nuevo logotipo
              </h3>

              <p className="text-xs text-neutral-500 mt-1">
                Puedes almacenar varios logos sin cambiar el que se está utilizando actualmente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                  Nombre del logotipo
                </label>

                <input
                  type="text"
                  value={nombreLogo}
                  onChange={(e) => setNombreLogo(e.target.value)}
                  placeholder="Ej. Logo principal, logo navideño..."
                  maxLength={60}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                  Imagen del logotipo
                </label>

                <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-neutral-700 text-xs font-semibold cursor-pointer transition-colors">
                  <Upload size={15} />
                  Seleccionar imagen

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleSeleccionarLogo}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {logoPreview && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-stone-50 border border-stone-200">
                <div className="w-36 h-16 bg-white rounded-md border border-stone-200 p-2 flex items-center justify-center">
                  <img
                    src={resolverRutaImagen(logoPreview)}
                    alt="Vista previa del logotipo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-xs font-semibold text-neutral-700">
                    Vista previa
                  </p>

                  <p className="text-xs text-neutral-500 mt-1">
                    Este logo todavía no está guardado.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setImagenLogo("");
                    setLogoPreview("");
                  }}
                  className="text-neutral-400 hover:text-rose-600 cursor-pointer"
                  aria-label="Quitar imagen seleccionada"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-[11px] text-neutral-400">
                Formatos permitidos: JPG, PNG o WEBP. Máximo 5 MB.
              </p>

              <button
                type="button"
                onClick={handleGuardarLogo}
                disabled={
                  loading ||
                  !nombreLogo.trim() ||
                  !imagenLogo ||
                  guardandoLogo
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white text-xs font-semibold bg-[#8a5a63] hover:bg-[#754b53] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ImagePlus size={15} />
                {guardandoLogo ? "Guardando..." : "Guardar logotipo"}
              </button>
            </div>

            {errorLogo && (
              <p className="text-xs text-rose-600">
                {errorLogo}
              </p>
            )}

            {mensajeLogo && (
              <p className="text-xs text-emerald-700">
                {mensajeLogo}
              </p>
            )}
          </div>

          {/* Galería de logos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-800">
                Logotipos almacenados
              </h3>

              <span className="text-xs text-neutral-500">
                {logos.length} registrados
              </span>
            </div>

            {logos.length === 0 ? (
              <div className="border border-dashed border-stone-300 rounded-xl p-8 text-center">
                <Store size={30} className="mx-auto text-stone-300 mb-2" />

                <p className="text-sm font-medium text-neutral-700">
                  Todavía no hay logotipos registrados.
                </p>

                <p className="text-xs text-neutral-400 mt-1">
                  Selecciona una imagen y guárdala para comenzar tu colección.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {logos.map((logo) => {
                  const activo =
                    String(logo.id) ===
                    String(configuracion.logoActivoId);

                  return (
                    <article
                      key={logo.id}
                      className={`border rounded-xl overflow-hidden ${
                        activo
                          ? "border-emerald-300 ring-1 ring-emerald-100"
                          : "border-stone-200"
                      }`}
                    >
                      <div className="h-28 bg-stone-50 p-4 flex items-center justify-center relative">
                        <img
                          src={resolverRutaImagen(logo.imagen)}
                          alt={logo.nombre}
                          className="max-w-full max-h-full object-contain"
                        />

                        {activo && (
                          <span className="absolute top-2 right-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full text-[10px] font-semibold">
                            Activo
                          </span>
                        )}
                      </div>

                      <div className="p-3">
                        <h4 className="text-sm font-semibold text-neutral-800 truncate">
                          {logo.nombre}
                        </h4>

                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {activo ? (
                            <button
                              type="button"
                              onClick={handleDesactivarLogo}
                              disabled={guardandoLogo}
                              className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold disabled:opacity-50 cursor-pointer"
                            >
                              <Power size={13} />
                              Desactivar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleActivarLogo(logo)}
                              disabled={guardandoLogo}
                              className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold disabled:opacity-50 cursor-pointer"
                            >
                              <CheckCircle2 size={13} />
                              Activar
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleEliminarLogo(logo)}
                            disabled={guardandoLogo}
                            className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2 size={13} />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =================================================
          SECCIÓN 2: PUBLICIDADES
      ================================================== */}
      <section>

        {/* Encabezado y botón de carga de publicidad */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-800">
              Publicidades del sitio
            </h2>

            <p className="text-xs text-neutral-500 mt-1">
              Administra las imágenes que aparecerán en el carrusel de la página principal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500">
              {totalActivas} de {publicidades.length} activas
            </span>

            <button
              type="button"
              onClick={abrirNuevaPublicidad}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium bg-[#8a5a63] hover:bg-[#754b53] transition-colors cursor-pointer"
            >
              <ImagePlus size={17} />
              Cargar publicidad
            </button>
          </div>
        </div>

        {/* Búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full sm:max-w-sm px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#8a5a63] focus:ring-4 focus:ring-[#8a5a63]/10 transition"
          />

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:border-[#8a5a63] cursor-pointer"
          >
            <option value="todos">Todas las publicidades</option>
            <option value="activas">Solo activas</option>
            <option value="inactivas">Solo inactivas</option>
          </select>
        </div>

        {/* Galería de publicidades */}
        {loading ? (
          <div className="bg-white border border-stone-200 rounded-xl p-10 text-center text-sm text-neutral-500">
            Cargando información...
          </div>
        ) : publicidadesFiltradas.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-10 text-center">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {publicidadesFiltradas.map((publicidad) => {
              const activa = Boolean(publicidad.estado);

              const ocupada =
                actualizandoId === publicidad.id ||
                eliminandoId === publicidad.id;

              return (
                <article
                  key={publicidad.id}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[16/9] bg-stone-100">
                    {publicidad.imagen ? (
                      <img
                        src={resolverRutaImagen(publicidad.imagen)}
                        alt={publicidad.titulo || "Publicidad"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <ImagePlus size={34} />
                      </div>
                    )}

                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        activa
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-white/95 text-neutral-600 border-stone-200"
                      }`}
                    >
                      {activa ? "Activa" : "Inactiva"}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-neutral-800 truncate">
                      {publicidad.titulo || "Publicidad sin nombre"}
                    </h3>

                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2 min-h-8">
                      {publicidad.descripcion || "Sin descripción"}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleCambiarEstadoPublicidad(publicidad)
                        }
                        disabled={
                          ocupada ||
                          actualizandoId !== null ||
                          eliminandoId !== null
                        }
                        className={`col-span-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          activa
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        <Power size={14} />
                        {actualizandoId === publicidad.id
                          ? "..."
                          : activa
                            ? "Desactivar"
                            : "Activar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => abrirEditarPublicidad(publicidad)}
                        disabled={
                          ocupada ||
                          actualizandoId !== null ||
                          eliminandoId !== null
                        }
                        className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold text-[#8a5a63] bg-[#8a5a63]/10 hover:bg-[#8a5a63]/15 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Pencil size={14} />
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEliminarPublicidad(publicidad)}
                        disabled={
                          ocupada ||
                          actualizandoId !== null ||
                          eliminandoId !== null
                        }
                        className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50"
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

      {/* =================================================
          MODAL DE PUBLICIDAD
      ================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-xl max-h-[92vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  {editando ? "Editar publicidad" : "Cargar publicidad"}
                </h2>

                <p className="text-xs text-neutral-500 mt-1">
                  Selecciona la imagen y completa la información del anuncio.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModalPublicidad}
                disabled={guardandoPublicidad}
                aria-label="Cerrar"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-stone-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGuardarPublicidad} className="p-6 space-y-4">

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Nombre de la publicidad
                </label>

                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChangePublicidad}
                  required
                  maxLength={100}
                  placeholder="Ej. Nueva colección de verano"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Descripción (opcional)
                </label>

                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChangePublicidad}
                  rows="3"
                  maxLength={300}
                  placeholder="Información adicional sobre esta publicidad..."
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm resize-none focus:outline-none focus:border-[#8a5a63] focus:ring-2 focus:ring-[#8a5a63]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  Imagen promocional
                </label>

                {imagenPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                    <img
                      src={resolverRutaImagen(imagenPreview)}
                      alt="Vista previa de la publicidad"
                      className="w-full aspect-[16/9] object-cover"
                    />

                    <label className="absolute bottom-3 right-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/95 text-neutral-800 text-xs font-semibold shadow cursor-pointer hover:bg-white transition-colors">
                      <Upload size={14} />
                      Cambiar imagen

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleSeleccionarImagenPublicidad}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-stone-300 rounded-xl p-8 bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer">
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
                      onChange={handleSeleccionarImagenPublicidad}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {errorFormulario && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg p-3">
                  {errorFormulario}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-neutral-500 bg-stone-50 border border-stone-200 rounded-lg p-3">
                <Power size={15} />

                {editando
                  ? `Estado actual: ${editando.estado ? "Activa" : "Inactiva"}. Se conservará al guardar.`
                  : "La nueva publicidad se guardará inactiva. Podrás activarla desde su tarjeta."}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={cerrarModalPublicidad}
                  disabled={guardandoPublicidad}
                  className="px-4 py-2 rounded-lg text-sm text-neutral-600 hover:bg-stone-100 disabled:opacity-50 cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardandoPublicidad}
                  className="px-4 py-2 rounded-lg text-sm text-white bg-[#8a5a63] hover:bg-[#754b53] disabled:opacity-60 cursor-pointer"
                >
                  {guardandoPublicidad ? "Guardando..." : "Guardar publicidad"}
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


