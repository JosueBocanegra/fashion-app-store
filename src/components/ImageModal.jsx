import { useEffect, useState } from "react";
import { X, ZoomIn, ZoomOut, ShoppingBag } from "lucide-react";

const ImageModal = ({ isOpen, onClose, imagen, nombre, categoria, precio, descuento, oferta }) => {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setZoomed(false);
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const precioFinal = oferta && descuento
    ? precio - (precio * descuento) / 100
    : precio;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md transition-all duration-300 animate-[fadeIn_0.2s_ease]"
      onClick={onClose}
    >
      {/* Botón flotante cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md transition-colors cursor-pointer border border-white/10 shadow-lg"
        title="Cerrar (Esc)"
        aria-label="Cerrar modal"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Botón flotante zoom */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setZoomed(!zoomed);
        }}
        className="absolute top-4 right-18 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-md transition-colors cursor-pointer border border-white/10 shadow-lg hidden sm:flex items-center gap-1.5 text-xs"
        title={zoomed ? "Reducir" : "Ampliar zoom"}
      >
        {zoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
        <span className="pr-1">{zoomed ? "100%" : "Zoom"}</span>
      </button>

      {/* Contenedor central */}
      <div
        className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center bg-slate-900/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera modal */}
        <div className="w-full px-6 py-4 flex items-center justify-between border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white font-medium text-base sm:text-lg line-clamp-1">
                {nombre || "Detalle del producto"}
              </h3>
              {categoria && (
                <span className="text-xs text-white/50 tracking-wider uppercase">
                  Categoría: {categoria}
                </span>
              )}
            </div>
          </div>

          {precio && (
            <div className="text-right">
              {oferta && descuento ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-white/40 line-through font-mono">S/{Number(precio).toFixed(2)}</span>
                  <span className="text-lg font-bold text-pink-400 font-mono">S/{Number(precioFinal).toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-lg font-bold text-white font-mono">S/{Number(precio).toFixed(2)}</span>
              )}
            </div>
          )}
        </div>

        {/* Imagen principal con efecto zoom */}
        <div
          className={`w-full flex-1 min-h-[300px] max-h-[68vh] p-6 flex items-center justify-center overflow-auto bg-gradient-to-b from-slate-900 via-slate-950 to-black select-none ${
            zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
          }`}
          onClick={() => setZoomed(!zoomed)}
        >
          <img
            src={imagen}
            alt={nombre}
            className={`transition-all duration-300 object-contain rounded-xl ${
              zoomed
                ? "scale-150 max-h-none max-w-none shadow-2xl"
                : "max-h-[60vh] max-w-full hover:scale-102"
            }`}
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/600x450/1e293b/ffffff?text=${encodeURIComponent(nombre || "Fashion Store")}`;
            }}
          />
        </div>

        {/* Barra inferior de ayuda */}
        <div className="w-full px-6 py-3 bg-white/5 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
          <span>Haz clic sobre la imagen para alternar el zoom</span>
          <span className="hidden sm:inline">Presiona ESC para salir</span>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
