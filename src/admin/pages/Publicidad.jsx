
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Image,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Power,
  ShoppingBag,
  Store,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { publicidadService } from "../services/publicidadService";
import { convertirImagenOptimizada } from "../../services/imagenService";

import "../styles/modulos.css";

const formularioInicial = {
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

const normalizarConfiguracion = (configuracion) => {
  let logos = Array.isArray(configuracion?.logos)
    ? configuracion.logos
    : [];

  let logoActivoId = configuracion?.logoActivoId ?? null;

  // Compatibilidad con configuraciones anteriores.
  if (logos.length === 0 && configuracion?.logo) {
    const logoAnterior = {
      id: "logo-anterior",
      nombre: "Logo anterior",
      imagen: configuracion.logo,
      fechaCreacion: new Date().toISOString(),
    };

    logos = [logoAnterior];
    logoActivoId = logoAnterior.id;
  }

  return {
    ...configuracion,
    logos,
    logoActivoId,
  };
};

const formatearFecha = (fecha) => {
  if (!fecha) return "Fecha no disponible";

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Publicidad = () => {
  // Datos principales
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
  const [form, setForm] = useState(formularioInicial);
  const [imagenPreview, setImagenPreview] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [guardandoPublicidad, setGuardandoPublicidad] = useState(false);
  const [procesandoImagenPublicidad, setProcesandoImagenPublicidad] =
    useState(false);

  // Operaciones de publicidad
  const [actualizandoId, setActualizandoId] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);

  // Formulario de logotipos
  const [nombreLogo, setNombreLogo] = useState("");
  const [imagenLogo, setImagenLogo] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [errorLogo, setErrorLogo] = useState("");
  const [mensajeLogo, setMensajeLogo] = useState("");
  const [guardandoLogo, setGuardandoLogo] = useState(false);
  const [procesandoImagenLogo, setProcesandoImagenLogo] = useState(false);

  // Confirmaciones y notificaciones
  const [confirmacionEliminar, setConfirmacionEliminar] = useState(null);
  const [errorConfirmacion, setErrorConfirmacion] = useState("");
  const [toast, setToast] = useState(null);

  const logos = Array.isArray(configuracion?.logos)
    ? configuracion.logos
    : [];

  const logoActivo = logos.find(
    (logo) => String(logo.id) === String(configuracion?.logoActivoId)
  );

  const totalActivas = publicidades.filter((item) =>
    Boolean(item.estado)
  ).length;

  const totalInactivas = publicidades.length - totalActivas;

  // Carga inicial
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

  // Notificaciones
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

  // Formulario de publicidad
  const abrirNuevaPublicidad = () => {
    setEditando(null);
    setForm(formularioInicial);
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
    if (guardandoPublicidad || procesandoImagenPublicidad) return;

    setModalOpen(false);
    setEditando(null);
    setForm(formularioInicial);
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

  // Seleccionar imagen de publicidad
  const handleSeleccionarImagenPublicidad = async (e) => {
    const input = e.currentTarget;
    const archivo = input.files?.[0];

    if (!archivo) return;

    setErrorFormulario("");
    setProcesandoImagenPublicidad(true);

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
      mostrarNotificacion("La imagen se procesó correctamente.");
    } catch (err) {
      setErrorFormulario(
        err.message || "No se pudo procesar la imagen."
      );
    } finally {
      input.value = "";
      setProcesandoImagenPublicidad(false);
    }
  };

  // Guardar publicidad
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
      estado: editando ? Boolean(editando.estado) : false,
      fechaCreacion: editando?.fechaCreacion || new Date().toISOString(),
    };

    try {
      if (editando) {
        const actualizada = await publicidadService.actualizarPublicidad(
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

        mostrarNotificacion(
          "La publicidad se actualizó correctamente."
        );
      } else {
        const nueva = await publicidadService.crearPublicidad(
          publicidadData
        );

        setPublicidades((prev) => [...prev, nueva]);

        mostrarNotificacion(
          "La publicidad se registró correctamente. Está inactiva."
        );
      }

      setModalOpen(false);
      setEditando(null);
      setForm(formularioInicial);
      setImagenPreview("");
      setErrorFormulario("");
    } catch (err) {
      console.error("Error guardando publicidad:", err);

      setErrorFormulario(
        "No se pudo guardar la publicidad. Verifica el servidor."
      );
    } finally {
      setGuardandoPublicidad(false);
    }
  };

  // Activar y desactivar publicidad
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

      mostrarNotificacion(
        nuevoEstado
          ? "La publicidad se activó correctamente."
          : "La publicidad se desactivó correctamente."
      );
    } catch (err) {
      console.error("Error cambiando estado:", err);
      setError("No se pudo cambiar el estado de la publicidad.");
    } finally {
      setActualizandoId(null);
    }
  };

  // Guardar configuración de logotipos
  const guardarConfiguracionLogos = async (
    nuevaLista,
    nuevoLogoActivoId
  ) => {
    const resultado = await publicidadService.actualizarLogos(
      nuevaLista,
      nuevoLogoActivoId
    );

    const configuracionActualizada = normalizarConfiguracion(resultado);

    setConfiguracion(configuracionActualizada);

    const logoActual = configuracionActualizada.logos.find(
      (logo) =>
        String(logo.id) ===
        String(configuracionActualizada.logoActivoId)
    );

    // Actualizar el logo en Navbar y Sidebar.
    window.dispatchEvent(
      new CustomEvent("logo-tienda-actualizado", {
        detail: {
          logo: logoActual?.imagen || "",
        },
      })
    );

    return configuracionActualizada;
  };

  // Seleccionar imagen de logotipo
  const handleSeleccionarLogo = async (e) => {
    const input = e.currentTarget;
    const archivo = input.files?.[0];

    if (!archivo) return;

    setErrorLogo("");
    setMensajeLogo("");
    setProcesandoImagenLogo(true);

    try {
      const imagen = await convertirImagenOptimizada(archivo, {
        maxWidth: 700,
        maxHeight: 300,
        quality: 0.88,
      });

      setImagenLogo(imagen);
      setLogoPreview(imagen);

      mostrarNotificacion(
        "La imagen del logotipo se procesó correctamente."
      );
    } catch (err) {
      setErrorLogo(
        err.message || "No se pudo procesar la imagen."
      );
    } finally {
      input.value = "";
      setProcesandoImagenLogo(false);
    }
  };

  // Registrar logotipo
  const handleGuardarLogo = async () => {
    if (!nombreLogo.trim()) {
      setErrorLogo("Debes ingresar un nombre para el logotipo.");
      return;
    }

    if (!imagenLogo) {
      setErrorLogo("Debes seleccionar una imagen para el logotipo.");
      return;
    }

    if (guardandoLogo || procesandoImagenLogo) return;

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

      // El nuevo logotipo no reemplaza automáticamente al activo.
      await guardarConfiguracionLogos(
        [...logos, nuevoLogo],
        configuracion.logoActivoId || null
      );

      setNombreLogo("");
      setImagenLogo("");
      setLogoPreview("");

      const mensaje =
        "El logotipo se guardó correctamente. Puedes activarlo cuando lo necesites.";

      setMensajeLogo(mensaje);
      mostrarNotificacion("El logotipo se registró correctamente.");
    } catch (err) {
      console.error("Error guardando logo:", err);
      setErrorLogo("No se pudo guardar el logotipo.");
    } finally {
      setGuardandoLogo(false);
    }
  };

  // Activar logotipo
  const handleActivarLogo = async (logo) => {
    if (guardandoLogo || procesandoImagenLogo) return;

    if (String(configuracion.logoActivoId) === String(logo.id)) {
      return;
    }

    setGuardandoLogo(true);
    setErrorLogo("");
    setMensajeLogo("");

    try {
      await guardarConfiguracionLogos(logos, logo.id);

      const mensaje = `El logotipo "${logo.nombre}" ahora está activo en la tienda.`;

      setMensajeLogo(mensaje);
      mostrarNotificacion("El logotipo se activó correctamente.");
    } catch (err) {
      console.error("Error activando logo:", err);
      setErrorLogo("No se pudo activar el logotipo.");
    } finally {
      setGuardandoLogo(false);
    }
  };

  // Desactivar logotipo
  const handleDesactivarLogo = async () => {
    if (guardandoLogo || procesandoImagenLogo) return;

    setGuardandoLogo(true);
    setErrorLogo("");
    setMensajeLogo("");

    try {
      await guardarConfiguracionLogos(logos, null);

      const mensaje =
        "Se desactivó el logotipo. Se mostrará la identidad predeterminada.";

      setMensajeLogo(mensaje);
      mostrarNotificacion("Se desactivó el logotipo actual.");
    } catch (err) {
      console.error("Error desactivando logo:", err);
      setErrorLogo("No se pudo desactivar el logotipo.");
    } finally {
      setGuardandoLogo(false);
    }
  };

  // Confirmación de eliminación
  const abrirConfirmacionEliminar = (tipo, elemento) => {
    setConfirmacionEliminar({
      tipo,
      elemento,
    });

    setErrorConfirmacion("");
  };

  const cerrarConfirmacionEliminar = () => {
    if (eliminandoId !== null || guardandoLogo) return;

    setConfirmacionEliminar(null);
    setErrorConfirmacion("");
  };

  const confirmarEliminar = async () => {
    if (!confirmacionEliminar) return;

    const { tipo, elemento } = confirmacionEliminar;
    setErrorConfirmacion("");

    if (tipo === "publicidad") {
      if (eliminandoId !== null) return;

      setEliminandoId(elemento.id);

      try {
        await publicidadService.eliminarPublicidad(elemento.id);

        setPublicidades((prev) =>
          prev.filter(
            (item) => String(item.id) !== String(elemento.id)
          )
        );

        setConfirmacionEliminar(null);
        mostrarNotificacion("La publicidad se eliminó correctamente.");
      } catch (err) {
        console.error("Error eliminando publicidad:", err);

        setErrorConfirmacion(
          "No se pudo eliminar la publicidad. Intenta nuevamente."
        );
      } finally {
        setEliminandoId(null);
      }

      return;
    }

    if (tipo === "logo") {
      if (guardandoLogo) return;

      setGuardandoLogo(true);

      try {
        const nuevaLista = logos.filter(
          (item) => String(item.id) !== String(elemento.id)
        );

        const nuevoLogoActivoId =
          String(configuracion.logoActivoId) === String(elemento.id)
            ? null
            : configuracion.logoActivoId;

        await guardarConfiguracionLogos(
          nuevaLista,
          nuevoLogoActivoId
        );

        setConfirmacionEliminar(null);

        const mensaje = "El logotipo se eliminó correctamente.";
        setMensajeLogo(mensaje);
        mostrarNotificacion(mensaje);
      } catch (err) {
        console.error("Error eliminando logo:", err);

        setErrorConfirmacion(
          "No se pudo eliminar el logotipo. Intenta nuevamente."
        );
      } finally {
        setGuardandoLogo(false);
      }
    }
  };

  const confirmacionEsPublicidad =
    confirmacionEliminar?.tipo === "publicidad";

  const confirmacionEnProceso = confirmacionEliminar
    ? confirmacionEsPublicidad
      ? String(eliminandoId) ===
        String(confirmacionEliminar.elemento.id)
      : guardandoLogo
    : false;

  return (
    <div className="admin-module-page">
      {/* Encabezado */}
      <section className="admin-page-heading">
        <div>
          <p className="admin-page-heading__eyebrow">
            Administración de tienda
          </p>

          <h1 className="admin-page-heading__title">
            Publicidad y logotipos
          </h1>

          <p className="admin-page-heading__description">
            Gestiona la identidad visual y las imágenes promocionales
            que se muestran en Fashion Store.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevaPublicidad}
          className="admin-primary-button"
        >
          <ImagePlus size={16} />
          Nueva publicidad
        </button>
      </section>

      {/* Error general */}
      {error && (
        <div className="admin-alert admin-alert--error" role="alert">
          <AlertTriangle size={17} className="shrink-0" />
          <span>{error}</span>

          <button
            type="button"
            onClick={cargarDatos}
            className="ml-auto shrink-0 text-xs font-semibold underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Indicadores */}
      <section className="admin-stat-grid">
        <article className="admin-stat-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="admin-stat-card__label">
                Publicidades registradas
              </p>
              <p className="admin-stat-card__value">
                {publicidades.length}
              </p>
              <p className="admin-stat-card__note">
                Total de anuncios
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F1EB] text-[#702D40]">
              <Image size={21} />
            </div>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="admin-stat-card__label">
                Publicidades activas
              </p>
              <p className="admin-stat-card__value">
                {totalActivas}
              </p>
              <p className="admin-stat-card__note">
                Visibles en el carrusel
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDF5EF] text-[#47775B]">
              <CheckCircle2 size={21} />
            </div>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="admin-stat-card__label">
                Publicidades inactivas
              </p>
              <p className="admin-stat-card__value">
                {totalInactivas}
              </p>
              <p className="admin-stat-card__note">
                Anuncios guardados
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF3E7] text-[#906A2E]">
              <Power size={21} />
            </div>
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="admin-stat-card__label">
                Logotipos guardados
              </p>
              <p className="admin-stat-card__value">
                {logos.length}
              </p>
              <p className="admin-stat-card__note">
                Versiones almacenadas
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F1EB] text-[#827970]">
              <Store size={21} />
            </div>
          </div>
        </article>
      </section>

      {/* Gestión de logotipos */}
      <section className="admin-table-card">
        <div className="flex flex-col gap-2 border-b border-[#EEE8E1] px-5 py-5 sm:px-6">
          <div className="flex items-center gap-2">
            <Store size={19} className="text-[#702D40]" />

            <h2 className="text-base font-semibold text-[#292522]">
              Identidad de la tienda
            </h2>
          </div>

          <p className="text-xs leading-relaxed text-[#827970]">
            Guarda diferentes versiones del logotipo y selecciona cuál
            deseas mostrar en el sitio web y en el panel administrativo.
          </p>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          {/* Logotipo activo */}
          <div className="flex flex-col gap-5 rounded-xl border border-[#E9E2DA] bg-[#F8F5F1] p-4 md:flex-row md:items-center">
            <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E9E2DA] bg-white p-4 md:w-60">
              {logoActivo ? (
                <img
                  src={resolverRutaImagen(logoActivo.imagen)}
                  alt={logoActivo.nombre}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="flex items-center gap-2 text-[#292522]">
                  <ShoppingBag size={30} className="text-[#702D40]" />
                  <span className="text-lg font-semibold">
                    Fashion Store
                  </span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#827970]">
                Identidad visible actualmente
              </p>

              <h3 className="mt-1 text-sm font-semibold text-[#292522]">
                {logoActivo?.nombre || "Logo predeterminado"}
              </h3>

              <p className="mt-1 max-w-xl text-xs leading-relaxed text-[#827970]">
                {logoActivo
                  ? "Este logotipo se utiliza en el sitio web y en el panel administrativo."
                  : "Actualmente se muestra la identidad predeterminada de Fashion Store."}
              </p>

              {logoActivo && (
                <button
                  type="button"
                  onClick={handleDesactivarLogo}
                  disabled={guardandoLogo}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#906A2E] hover:text-[#75531F] disabled:opacity-50"
                >
                  <Power size={14} />
                  Desactivar logo actual
                </button>
              )}
            </div>

            {logoActivo ? (
              <span className="admin-pill admin-pill--success self-start md:self-center">
                <CheckCircle2 size={13} />
                Activo
              </span>
            ) : (
              <span className="admin-pill admin-pill--neutral self-start md:self-center">
                Predeterminado
              </span>
            )}
          </div>

          {/* Registrar logotipo */}
          <div className="rounded-xl border border-[#E9E2DA] p-4 sm:p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[#292522]">
                Registrar nuevo logotipo
              </h3>

              <p className="mt-1 text-xs text-[#827970]">
                Puedes guardar varios logotipos sin cambiar automáticamente
                el que está activo.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="admin-form-field">
                <label htmlFor="nombre-logo" className="admin-form-label">
                  Nombre del logotipo
                </label>

                <input
                  id="nombre-logo"
                  type="text"
                  value={nombreLogo}
                  onChange={(e) => {
                    setNombreLogo(e.target.value);
                    setErrorLogo("");
                    setMensajeLogo("");
                  }}
                  placeholder="Ej. Logo principal, logo navideño..."
                  maxLength={60}
                  className="admin-field-control"
                  disabled={guardandoLogo}
                />
              </div>

              <div className="admin-form-field">
                <label className="admin-form-label">
                  Imagen del logotipo
                </label>

                <label
                  className={`admin-secondary-button w-full cursor-pointer ${
                    procesandoImagenLogo ? "opacity-60" : ""
                  }`}
                >
                  {procesandoImagenLogo ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <Upload size={15} />
                  )}

                  {procesandoImagenLogo
                    ? "Procesando imagen..."
                    : "Seleccionar imagen"}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleSeleccionarLogo}
                    disabled={guardandoLogo || procesandoImagenLogo}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {logoPreview && (
              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#E9E2DA] bg-[#F8F5F1] p-3 sm:flex-row sm:items-center">
                <div className="flex h-20 w-full shrink-0 items-center justify-center rounded-lg border border-[#E9E2DA] bg-white p-3 sm:w-36">
                  <img
                    src={resolverRutaImagen(logoPreview)}
                    alt="Vista previa del logotipo"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#39332E]">
                    Vista previa
                  </p>

                  <p className="mt-1 text-[11px] text-[#827970]">
                    Este logotipo todavía no está guardado.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setImagenLogo("");
                    setLogoPreview("");
                  }}
                  disabled={guardandoLogo}
                  className="admin-row-action admin-row-action--danger self-end sm:self-center"
                  aria-label="Quitar imagen seleccionada"
                  title="Quitar imagen"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 border-t border-[#EEE8E1] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] leading-relaxed text-[#9A9087]">
                Formatos permitidos: JPG, PNG o WEBP. Tamaño máximo: 5 MB.
              </p>

              <button
                type="button"
                onClick={handleGuardarLogo}
                disabled={
                  loading ||
                  !nombreLogo.trim() ||
                  !imagenLogo ||
                  guardandoLogo ||
                  procesandoImagenLogo
                }
                className="admin-primary-button"
              >
                {guardandoLogo ? (
                  <>
                    <LoaderCircle size={15} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <ImagePlus size={15} />
                    Guardar logotipo
                  </>
                )}
              </button>
            </div>

            {errorLogo && (
              <div className="admin-alert admin-alert--error mt-4" role="alert">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{errorLogo}</span>
              </div>
            )}

            {mensajeLogo && (
              <div className="admin-alert admin-alert--success mt-4" role="status">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{mensajeLogo}</span>
              </div>
            )}
          </div>

          {/* Galería de logotipos */}
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-[#292522]">
                  Logotipos almacenados
                </h3>

                <p className="mt-1 text-[11px] text-[#827970]">
                  Activa el logotipo que deseas utilizar.
                </p>
              </div>

              <span className="admin-pill admin-pill--neutral">
                {logos.length} registrados
              </span>
            </div>

            {logos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#D9D0C6] bg-[#FAF8F5] p-8 text-center">
                <Store size={30} className="mx-auto mb-3 text-[#B7A493]" />

                <p className="text-sm font-semibold text-[#514840]">
                  Todavía no hay logotipos registrados.
                </p>

                <p className="mt-1 text-xs text-[#9A9087]">
                  Selecciona una imagen y guárdala para comenzar tu colección.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {logos.map((logo) => {
                  const activo =
                    String(logo.id) ===
                    String(configuracion.logoActivoId);

                  return (
                    <article
                      key={logo.id}
                      className={`overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-sm ${
                        activo
                          ? "border-[#B7A493] ring-1 ring-[#B7A493]/30"
                          : "border-[#E9E2DA]"
                      }`}
                    >
                      <div className="relative flex h-32 items-center justify-center bg-[#F8F5F1] p-5">
                        <img
                          src={resolverRutaImagen(logo.imagen)}
                          alt={logo.nombre}
                          className="max-h-full max-w-full object-contain"
                        />

                        {activo && (
                          <span className="absolute right-2 top-2 admin-pill admin-pill--success">
                            <CheckCircle2 size={12} />
                            Activo
                          </span>
                        )}
                      </div>

                      <div className="p-3.5">
                        <h4 className="truncate text-xs font-semibold text-[#292522]">
                          {logo.nombre}
                        </h4>

                        <p className="mt-1 text-[10px] text-[#9A9087]">
                          Registrado: {formatearFecha(logo.fechaCreacion)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {activo ? (
                            <button
                              type="button"
                              onClick={handleDesactivarLogo}
                              disabled={guardandoLogo}
                              className="admin-filter-button flex-1"
                            >
                              <Power size={13} />
                              Desactivar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleActivarLogo(logo)}
                              disabled={guardandoLogo}
                              className="admin-filter-button flex-1"
                            >
                              <CheckCircle2 size={13} />
                              Activar
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              abrirConfirmacionEliminar("logo", logo)
                            }
                            disabled={guardandoLogo}
                            className="admin-row-action admin-row-action--danger"
                            title="Eliminar logotipo"
                            aria-label={`Eliminar logotipo ${logo.nombre}`}
                          >
                            <Trash2 size={15} />
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

      {/* Gestión de publicidades */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="admin-page-heading__eyebrow">
              Contenido promocional
            </p>

            <h2 className="text-lg font-semibold tracking-tight text-[#292522]">
              Publicidades del sitio
            </h2>

            <p className="mt-1 text-xs text-[#827970]">
              Administra las imágenes que aparecerán en el carrusel de la página principal.
            </p>
          </div>

          <span className="text-[11px] text-[#827970]">
            {totalActivas} de {publicidades.length} activas
          </span>
        </div>

        {loading ? (
          <div className="admin-table-card">
            <div className="admin-loading-state">
              <div className="admin-spinner" />
              Cargando publicidades...
            </div>
          </div>
        ) : publicidades.length === 0 ? (
          <div className="admin-table-card">
            <div className="admin-empty-state">
              <ImagePlus
                size={34}
                className="mx-auto mb-3 text-[#B7A493]"
              />

              <p className="admin-empty-state__title">
                Todavía no has cargado publicidades.
              </p>

              <p>
                Carga una imagen para comenzar a crear tu carrusel promocional.
              </p>

              <button
                type="button"
                onClick={abrirNuevaPublicidad}
                className="admin-primary-button mt-4"
              >
                <ImagePlus size={15} />
                Cargar primera publicidad
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {publicidades.map((publicidad) => {
              const activa = Boolean(publicidad.estado);

              const ocupada =
                String(actualizandoId) === String(publicidad.id) ||
                String(eliminandoId) === String(publicidad.id);

              const hayOperacionEnCurso =
                actualizandoId !== null || eliminandoId !== null;

              return (
                <article
                  key={publicidad.id}
                  className="overflow-hidden rounded-2xl border border-[#E9E2DA] bg-white shadow-[0_3px_12px_rgba(41,37,34,0.025)] transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#F5F1EB]">
                    {publicidad.imagen ? (
                      <img
                        src={resolverRutaImagen(publicidad.imagen)}
                        alt={publicidad.titulo || "Publicidad"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#B7A493]">
                        <ImagePlus size={34} />
                      </div>
                    )}

                    <span
                      className={`absolute right-3 top-3 admin-pill ${
                        activa
                          ? "admin-pill--success"
                          : "admin-pill--neutral"
                      }`}
                    >
                      {activa ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <Power size={12} />
                      )}
                      {activa ? "Activa" : "Inactiva"}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-[#292522]">
                          {publicidad.titulo || "Publicidad sin nombre"}
                        </h3>

                        <p className="mt-1 text-[10px] text-[#9A9087]">
                          Registrada: {formatearFecha(publicidad.fechaCreacion)}
                        </p>
                      </div>

                      <span
                        className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                          activa ? "bg-[#47775B]" : "bg-[#B7A493]"
                        }`}
                        title={activa ? "Publicidad activa" : "Publicidad inactiva"}
                      />
                    </div>

                    <p className="mt-3 min-h-[38px] text-xs leading-relaxed text-[#827970]">
                      {publicidad.descripcion || "Sin descripción adicional."}
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#F0EBE5] pt-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleCambiarEstadoPublicidad(publicidad)
                        }
                        disabled={ocupada || hayOperacionEnCurso}
                        className={`flex min-h-9 items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          activa
                            ? "bg-[#FAF3E7] text-[#906A2E] hover:bg-[#F3E8D3]"
                            : "bg-[#EDF5EF] text-[#47775B] hover:bg-[#DDEEE1]"
                        }`}
                      >
                        {actualizandoId !== null && ocupada ? (
                          <LoaderCircle size={13} className="animate-spin" />
                        ) : (
                          <Power size={13} />
                        )}

                        {actualizandoId !== null && ocupada
                          ? "..."
                          : activa
                            ? "Desactivar"
                            : "Activar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => abrirEditarPublicidad(publicidad)}
                        disabled={hayOperacionEnCurso}
                        className="flex min-h-9 items-center justify-center gap-1 rounded-lg bg-[#F8F0F1] px-2 text-[10px] font-semibold text-[#702D40] transition-colors hover:bg-[#F0E1E4] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil size={13} />
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          abrirConfirmacionEliminar("publicidad", publicidad)
                        }
                        disabled={hayOperacionEnCurso}
                        className="flex min-h-9 items-center justify-center gap-1 rounded-lg bg-[#FCF1F1] px-2 text-[10px] font-semibold text-[#923E45] transition-colors hover:bg-[#F6E2E3] disabled:cursor-not-allowed disabled:opacity-50"
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
      </section>

      {/* Modal de registro y edición */}
      {modalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={(e) => {
            if (
              e.target === e.currentTarget &&
              !guardandoPublicidad &&
              !procesandoImagenPublicidad
            ) {
              cerrarModalPublicidad();
            }
          }}
        >
          <section
            className="admin-modal-card admin-modal-card--wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="publicidad-modal-title"
          >
            <header className="admin-modal-header">
              <div>
                <p className="admin-modal-header__eyebrow">
                  Contenido promocional
                </p>

                <h2
                  id="publicidad-modal-title"
                  className="admin-modal-header__title"
                >
                  {editando ? "Editar publicidad" : "Registrar publicidad"}
                </h2>
              </div>

              <button
                type="button"
                onClick={cerrarModalPublicidad}
                disabled={guardandoPublicidad || procesandoImagenPublicidad}
                className="admin-modal-close"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleGuardarPublicidad}>
              <div className="admin-modal-body">
                {errorFormulario && (
                  <div className="admin-alert admin-alert--error" role="alert">
                    <AlertTriangle size={17} className="shrink-0" />
                    <span>{errorFormulario}</span>
                  </div>
                )}

                <div className="admin-form-grid">
                  <div className="admin-form-field admin-form-field--full">
                    <label
                      htmlFor="publicidad-titulo"
                      className="admin-form-label"
                    >
                      Nombre de la publicidad
                    </label>

                    <input
                      id="publicidad-titulo"
                      name="titulo"
                      value={form.titulo}
                      onChange={handleChangePublicidad}
                      required
                      maxLength={100}
                      placeholder="Ej. Nueva colección de verano"
                      className="admin-field-control"
                      disabled={guardandoPublicidad}
                    />
                  </div>

                  <div className="admin-form-field admin-form-field--full">
                    <label
                      htmlFor="publicidad-descripcion"
                      className="admin-form-label"
                    >
                      Descripción
                      <span className="ml-1 font-normal text-[#9A9087]">
                        (opcional)
                      </span>
                    </label>

                    <textarea
                      id="publicidad-descripcion"
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChangePublicidad}
                      rows={3}
                      maxLength={300}
                      placeholder="Información adicional sobre esta publicidad..."
                      className="admin-field-control resize-none"
                      disabled={guardandoPublicidad}
                    />

                    <p className="admin-form-help text-right">
                      {form.descripcion.length}/300 caracteres
                    </p>
                  </div>

                  <div className="admin-form-field admin-form-field--full">
                    <label className="admin-form-label">
                      Imagen promocional
                    </label>

                    {imagenPreview ? (
                      <div className="relative overflow-hidden rounded-xl border border-[#E9E2DA] bg-[#F8F5F1]">
                        <img
                          src={resolverRutaImagen(imagenPreview)}
                          alt="Vista previa de la publicidad"
                          className="aspect-[16/9] max-h-[320px] w-full object-contain"
                        />

                        <label
                          className={`absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#E9E2DA] bg-white/95 px-3 py-2 text-xs font-semibold text-[#39332E] shadow-sm transition-colors hover:bg-white ${
                            procesandoImagenPublicidad
                              ? "pointer-events-none opacity-60"
                              : ""
                          }`}
                        >
                          {procesandoImagenPublicidad ? (
                            <LoaderCircle size={14} className="animate-spin" />
                          ) : (
                            <Upload size={14} />
                          )}

                          {procesandoImagenPublicidad
                            ? "Procesando..."
                            : "Cambiar imagen"}

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleSeleccionarImagenPublicidad}
                            disabled={
                              guardandoPublicidad ||
                              procesandoImagenPublicidad
                            }
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <label
                        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#D9D0C6] bg-[#FAF8F5] p-8 text-center transition-colors hover:bg-[#F5F1EB] ${
                          procesandoImagenPublicidad
                            ? "pointer-events-none opacity-60"
                            : ""
                        }`}
                      >
                        {procesandoImagenPublicidad ? (
                          <LoaderCircle
                            size={32}
                            className="animate-spin text-[#702D40]"
                          />
                        ) : (
                          <ImagePlus size={34} className="text-[#702D40]" />
                        )}

                        <span className="text-sm font-semibold text-[#39332E]">
                          {procesandoImagenPublicidad
                            ? "Procesando imagen..."
                            : "Seleccionar imagen"}
                        </span>

                        <span className="text-xs text-[#9A9087]">
                          JPG, PNG o WEBP. Tamaño máximo de 5 MB.
                        </span>

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleSeleccionarImagenPublicidad}
                          disabled={
                            guardandoPublicidad ||
                            procesandoImagenPublicidad
                          }
                          className="hidden"
                        />
                      </label>
                    )}

                    <p className="admin-form-help">
                      La imagen se optimizará automáticamente antes de guardarse.
                      Se recomienda utilizar una proporción horizontal de 16:9.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#E9E2DA] bg-[#F8F5F1] p-3.5">
                  <Power size={16} className="mt-0.5 shrink-0 text-[#827970]" />

                  <div>
                    <p className="text-xs font-semibold text-[#39332E]">
                      Estado de publicación
                    </p>

                    <p className="mt-1 text-[11px] leading-relaxed text-[#827970]">
                      {editando
                        ? `Estado actual: ${editando.estado ? "Activa" : "Inactiva"}. Se conservará al guardar.`
                        : "La nueva publicidad se guardará inactiva. Podrás activarla desde su tarjeta cuando lo necesites."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="admin-modal-body pt-0">
                <div className="admin-modal-actions">
                  <button
                    type="button"
                    onClick={cerrarModalPublicidad}
                    disabled={guardandoPublicidad || procesandoImagenPublicidad}
                    className="admin-secondary-button"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={guardandoPublicidad || procesandoImagenPublicidad}
                    className="admin-primary-button"
                  >
                    {guardandoPublicidad ? (
                      <>
                        <LoaderCircle size={16} className="animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        {editando ? "Guardar cambios" : "Registrar publicidad"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmacionEliminar && (
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
            aria-labelledby="publicidad-eliminar-title"
          >
            <header className="admin-modal-header">
              <div>
                <p className="admin-modal-header__eyebrow">
                  Confirmación
                </p>

                <h2
                  id="publicidad-eliminar-title"
                  className="admin-modal-header__title"
                >
                  Eliminar{" "}
                  {confirmacionEliminar.tipo === "logo"
                    ? "logotipo"
                    : "publicidad"}
                </h2>
              </div>

              <button
                type="button"
                onClick={cerrarConfirmacionEliminar}
                disabled={confirmacionEnProceso}
                className="admin-modal-close"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </header>

            <div className="admin-modal-body">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FCF1F1] text-[#923E45]">
                  <AlertTriangle size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#292522]">
                    ¿Estás seguro de eliminar este elemento?
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-[#827970]">
                    Esta acción no se puede deshacer.
                    {confirmacionEliminar.tipo === "logo" &&
                    String(configuracion.logoActivoId) ===
                      String(confirmacionEliminar.elemento.id)
                      ? " Al eliminar el logotipo activo se mostrará nuevamente la identidad predeterminada."
                      : ""}
                  </p>
                </div>
              </div>

              <div className="admin-delete-preview">
                {confirmacionEliminar.tipo === "logo" ? (
                  <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border border-[#E9E2DA] bg-white p-2">
                    <img
                      src={resolverRutaImagen(
                        confirmacionEliminar.elemento.imagen
                      )}
                      alt={confirmacionEliminar.elemento.nombre}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
                    <img
                      src={resolverRutaImagen(
                        confirmacionEliminar.elemento.imagen
                      )}
                      alt={confirmacionEliminar.elemento.titulo}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#39332E]">
                    {confirmacionEliminar.tipo === "logo"
                      ? confirmacionEliminar.elemento.nombre
                      : confirmacionEliminar.elemento.titulo}
                  </p>

                  <p className="mt-1 text-[10px] text-[#9A9087]">
                    {confirmacionEliminar.tipo === "logo"
                      ? "Logotipo"
                      : "Publicidad"}
                  </p>
                </div>
              </div>

              {errorConfirmacion && (
                <div
                  className="admin-alert admin-alert--error mt-4"
                  role="alert"
                >
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{errorConfirmacion}</span>
                </div>
              )}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={cerrarConfirmacionEliminar}
                  disabled={confirmacionEnProceso}
                  className="admin-secondary-button"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={confirmarEliminar}
                  disabled={confirmacionEnProceso}
                  className="admin-danger-button"
                >
                  {confirmacionEnProceso ? (
                    <>
                      <LoaderCircle size={15} className="animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      Confirmar eliminación
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
        <div className="admin-toast" role="status">
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

export default Publicidad;


