import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { publicidadService } from "../services/publicidadService";

const resolverRutaImagen = (imagen) => {
  if (!imagen) return "";

  if (/^(https?:\/\/|data:|blob:)/i.test(imagen)) {
    return imagen;
  }

  return `/${imagen.replace(/^\/+/, "")}`;
};

const PublicidadCarrusel = () => {
  const [publicidades, setPublicidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [indiceActual, setIndiceActual] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    let componenteActivo = true;

    const cargarPublicidades = async () => {
      try {
        const data = await publicidadService.obtenerPublicidad();

        if (componenteActivo) {
          setPublicidades(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error(
          "Error al cargar las publicidades del sitio:",
          error
        );
      } finally {
        if (componenteActivo) {
          setLoading(false);
        }
      }
    };

    cargarPublicidades();

    return () => {
      componenteActivo = false;
    };
  }, []);

  const publicidadesVisibles = useMemo(() => {
    return publicidades.filter(
      (publicidad) =>
        Boolean(publicidad.estado) &&
        Boolean(publicidad.imagen)
    );
  }, [publicidades]);

  // Evita mantener un índice que ya no existe si cambia la lista.
  useEffect(() => {
    setIndiceActual((actual) =>
      publicidadesVisibles.length === 0
        ? 0
        : Math.min(actual, publicidadesVisibles.length - 1)
    );
  }, [publicidadesVisibles.length]);

  // Cambio automático cada 5 segundos.
  useEffect(() => {
    if (publicidadesVisibles.length <= 1 || pausado) {
      return;
    }

    const intervalo = window.setInterval(() => {
      setIndiceActual((actual) =>
        (actual + 1) % publicidadesVisibles.length
      );
    }, 5000);

    return () => window.clearInterval(intervalo);
  }, [publicidadesVisibles.length, pausado]);

  const mostrarAnterior = () => {
    setIndiceActual((actual) =>
      actual === 0
        ? publicidadesVisibles.length - 1
        : actual - 1
    );
  };

  const mostrarSiguiente = () => {
    setIndiceActual(
      (actual) => (actual + 1) % publicidadesVisibles.length
    );
  };

  if (loading || publicidadesVisibles.length === 0) {
    return null;
  }

  const publicidadActual = publicidadesVisibles[indiceActual];

  return (
    <section
      aria-label="Publicidades de Fashion Store"
      aria-roledescription="carrusel"
      className="relative mb-10 group"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setPausado(false);
        }
      }}
    >
      {/* Imagen promocional */}
      <div className="relative w-full h-[220px] sm:h-[300px]
                      lg:h-[380px] overflow-hidden rounded-3xl
                      shadow-xl bg-stone-100"
      >
        <img
          key={publicidadActual.id}
          src={resolverRutaImagen(publicidadActual.imagen)}
          alt={
            publicidadActual.titulo ||
            publicidadActual.descripcion ||
            "Publicidad de Fashion Store"
          }
          className="w-full h-full object-cover"
          draggable="false"
        />

        {/* Controles de navegación */}
        {publicidadesVisibles.length > 1 && (
          <>
            <button
              type="button"
              onClick={mostrarAnterior}
              aria-label="Publicidad anterior"
              className="absolute left-3 sm:left-5 top-1/2
                         -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12
                         rounded-full bg-black/35 text-white
                         flex items-center justify-center
                         hover:bg-black/60 transition-colors
                         cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              type="button"
              onClick={mostrarSiguiente}
              aria-label="Publicidad siguiente"
              className="absolute right-3 sm:right-5 top-1/2
                         -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12
                         rounded-full bg-black/35 text-white
                         flex items-center justify-center
                         hover:bg-black/60 transition-colors
                         cursor-pointer"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Indicadores */}
        {publicidadesVisibles.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0
                          flex justify-center items-center gap-2"
          >
            {publicidadesVisibles.map((publicidad, index) => (
              <button
                key={publicidad.id}
                type="button"
                onClick={() => setIndiceActual(index)}
                aria-label={`Mostrar publicidad ${index + 1}`}
                aria-current={
                  indiceActual === index ? "true" : undefined
                }
                className={`h-2.5 rounded-full transition-all
                            cursor-pointer ${
                              indiceActual === index
                                ? "w-7 bg-white"
                                : "w-2.5 bg-white/60 hover:bg-white"
                            }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PublicidadCarrusel;


