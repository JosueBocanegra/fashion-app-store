import { useEffect, useState, useMemo } from "react";
import { productosService } from "../services/productosService";
import ImageModal from "../../components/ImageModal";

const initialForm = {
  nombre: "",
  precio: "",
  categoria: "Hombre",
  stock: "",
  imagen: "assets/img/casacaCueroHombre.jpg",
  oferta: false,
  descuento: 0,
};

const categoriasDisponibles = ["Hombre", "Mujer", "Niños", "Accesorios", "Calzado"];

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorModal, setErrorModal] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroPromocion, setFiltroPromocion] = useState(false);
  const [filtroBajoStock, setFiltroBajoStock] = useState(false);
  const [productoVisualizando, setProductoVisualizando] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");
  const [confirmacion, setConfirmacion] = useState(() => {
    return sessionStorage.getItem("producto_confirmacion") || null;
  });

  useEffect(() => {
    if (!confirmacion) return;
    const timer = setTimeout(() => {
      setConfirmacion(null);
      sessionStorage.removeItem("producto_confirmacion");
    }, 4500);
    return () => clearTimeout(timer);
  }, [confirmacion]);

  const cerrarConfirmacion = () => {
    setConfirmacion(null);
    sessionStorage.removeItem("producto_confirmacion");
  };

  const cargarProductos = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await productosService.obtenerProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("No se pudo cargar el listado de productos. Asegúrate de tener json-server activo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(initialForm);
    setError("");
    setErrorModal("");
    setModalOpen(true);
  };

  const abrirEditar = (producto) => {
    setEditando(producto.id);
    setForm({
      nombre: producto.nombre || "",
      precio: producto.precio ?? "",
      categoria: producto.categoria || "Hombre",
      stock: producto.stock ?? "",
      imagen: producto.imagen || "",
      oferta: Boolean(producto.oferta),
      descuento: producto.descuento ?? 0,
    });
    setError("");
    setErrorModal("");
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditando(null);
    setErrorModal("");
    setForm(initialForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (errorModal) setErrorModal("");
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      setErrorModal("El nombre del producto es obligatorio.");
      return;
    }
    if (form.precio === "" || Number(form.precio) <= 0) {
      setErrorModal("El precio debe ser un número válido mayor a 0.");
      return;
    }
    if (form.stock === "" || Number(form.stock) < 0) {
      setErrorModal("El stock no puede ser un valor negativo.");
      return;
    }
    if (form.oferta && (form.descuento === "" || Number(form.descuento) <= 0 || Number(form.descuento) >= 100)) {
      setErrorModal("El porcentaje de descuento debe ser mayor a 0% y menor a 100%.");
      return;
    }

    setGuardando(true);
    setErrorModal("");

    const payload = {
      nombre: form.nombre.trim(),
      precio: Number(form.precio),
      categoria: form.categoria,
      stock: Number(form.stock),
      imagen: form.imagen.trim() || "assets/img/casacaCueroHombre.jpg",
      oferta: form.oferta,
      descuento: form.oferta ? Number(form.descuento || 0) : 0,
    };

    try {
      const eraNuevo = !editando;
      if (editando) {
        await productosService.actualizarProducto(editando, payload);
      } else {
        await productosService.crearProducto({
          id: String(Date.now()),
          ...payload,
        });
      }
      await cargarProductos();
      cerrarModal();

      // Guardar en sessionStorage para persistir ante cualquier recarga
      const mensaje = eraNuevo ? "El producto se ha agregado correctamente." : "El producto se ha actualizado correctamente.";
      sessionStorage.setItem("producto_confirmacion", mensaje);
      setConfirmacion(mensaje);
    } catch (err) {
      setErrorModal("No se pudo guardar el producto. Asegúrate de que el servidor esté activo.");
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalEliminar = (producto) => {
    setErrorEliminar("");
    setProductoAEliminar(producto);
  };

  const cerrarModalEliminar = () => {
    if (eliminando) return;
    setProductoAEliminar(null);
    setErrorEliminar("");
  };

  const confirmarEliminar = async () => {
    if (!productoAEliminar) return;

    setEliminando(true);
    setErrorEliminar("");

    try {
      await productosService.eliminarProducto(productoAEliminar.id);
      const mensaje = `El producto "${productoAEliminar.nombre}" se ha eliminado correctamente.`;
      sessionStorage.setItem("producto_confirmacion", mensaje);
      setConfirmacion(mensaje);
      setProductoAEliminar(null);
      await cargarProductos();
    } catch (err) {
      setErrorEliminar("No se pudo eliminar el producto. Verifica que json-server esté en ejecución.");
    } finally {
      setEliminando(false);
    }
  };

  const esBusquedaPorId = busqueda.trim().startsWith("#");

  const productosFiltrados = useMemo(() => {
    const query = busqueda.trim();
    const esPorId = query.startsWith("#");
    const idBuscado = esPorId ? query.slice(1).trim().toLowerCase() : "";

    return productos.filter((p) => {
      let coincideBusqueda = true;

      if (query) {
        if (esPorId) {
          // Búsqueda específica por ID al colocar '#'
          coincideBusqueda = idBuscado
            ? String(p.id).toLowerCase().includes(idBuscado)
            : true;
        } else {
          const termino = query.toLowerCase();
          coincideBusqueda =
            p.nombre?.toLowerCase().includes(termino) ||
            p.categoria?.toLowerCase().includes(termino) ||
            String(p.id).toLowerCase() === termino;
        }
      }

      const coincideCategoria =
        filtroCategoria === "todos" || p.categoria === filtroCategoria;
      const coincidePromocion = !filtroPromocion || p.oferta === true;
      const coincideBajoStock = !filtroBajoStock || Number(p.stock) <= 5;

      return coincideBusqueda && coincideCategoria && coincidePromocion && coincideBajoStock;
    });
  }, [productos, busqueda, filtroCategoria, filtroPromocion, filtroBajoStock]);

  const metricas = useMemo(() => {
    const total = productos.length;
    const ofertas = productos.filter((p) => p.oferta).length;
    const stockTotal = productos.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
    const bajoStock = productos.filter((p) => (Number(p.stock) || 0) <= 5).length;
    return { total, ofertas, stockTotal, bajoStock };
  }, [productos]);

  const resolverRutaImagen = (img) => {
    if (!img) return "https://via.placeholder.com/80?text=Sin+Foto";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    const nombre = img.split("/").pop();
    return `/assets/img/${nombre}`;
  };

  return (
    <div>
      {/* Tarjeta de Confirmación Visual simple (solo mensaje) */}
      {confirmacion && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full bg-white rounded-2xl border border-emerald-200 shadow-xl p-4 animate-[slideIn_0.3s_ease] transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <p className="text-sm font-medium text-neutral-800">
                {confirmacion}
              </p>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={cerrarConfirmacion}
              className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-stone-100 transition cursor-pointer flex-shrink-0"
              title="Cerrar mensaje"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Barra de progreso de auto-cierre */}
          <div className="mt-2.5 w-full bg-emerald-100 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-full animate-[shrink_4.5s_linear_forwards]" />
          </div>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] tracking-[0.35em] uppercase text-neutral-500 mb-1.5">
            Inventario & Catálogo
          </p>
          <h2 className="text-3xl font-light text-neutral-900 tracking-tight">
            Gestión de Productos
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Administra los artículos de tu boutique, precios, existencias y promociones.
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white
                     bg-[#8a5a63] hover:bg-[#754b53] focus:outline-none focus:ring-4 focus:ring-[#8a5a63]/25
                     shadow-md shadow-[#8a5a63]/15 transition-all duration-200 self-start sm:self-auto cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo producto
        </button>
      </div>

      {/* Tarjetas de Métricas (Interactuables como filtros rápidos) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          type="button"
          onClick={() => {
            setFiltroPromocion(false);
            setFiltroBajoStock(false);
          }}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            !filtroPromocion && !filtroBajoStock
              ? "bg-stone-50 border-stone-400 shadow-sm"
              : "bg-white border-stone-200/80 hover:border-stone-300"
          }`}
        >
          <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">Total Productos</p>
          <p className="text-2xl font-light text-neutral-900 mt-1">{metricas.total}</p>
        </button>

        <button
          type="button"
          onClick={() => setFiltroPromocion(!filtroPromocion)}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            filtroPromocion
              ? "bg-rose-50 border-rose-400 ring-2 ring-rose-500/20 shadow-sm"
              : "bg-white border-stone-200/80 hover:border-rose-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-rose-600 font-medium">En Promoción</p>
            {filtroPromocion && <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded-full">Activo</span>}
          </div>
          <p className="text-2xl font-light text-rose-600 mt-1">{metricas.ofertas}</p>
        </button>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Stock Total</p>
          <p className="text-2xl font-light text-neutral-900 mt-1">{metricas.stockTotal} <span className="text-xs text-neutral-400">uds.</span></p>
        </div>

        <button
          type="button"
          onClick={() => setFiltroBajoStock(!filtroBajoStock)}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            filtroBajoStock
              ? "bg-amber-50 border-amber-400 ring-2 ring-amber-500/20 shadow-sm"
              : "bg-white border-stone-200/80 hover:border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-amber-600 font-medium">Stock Bajo (≤ 5)</p>
            {filtroBajoStock && <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded-full">Activo</span>}
          </div>
          <p className="text-2xl font-light text-amber-600 mt-1">{metricas.bajoStock}</p>
        </button>
      </div>

      {/* Alerta de error general (solo fuera del modal) */}
      {error && !modalOpen && (
        <div className="mb-6 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-3.5">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Barra de Búsqueda y Filtros en una sola línea compacta */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs mb-6 flex flex-wrap items-center gap-3 justify-between">
        {/* Búsqueda por texto o #ID */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              {esBusquedaPorId ? (
                <span className="font-mono text-sm font-bold text-[#8a5a63]">#</span>
              ) : (
                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre o #ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`w-full pl-10 pr-8 py-2 bg-stone-50 border rounded-xl text-sm text-neutral-800 placeholder-neutral-400
                         focus:outline-none focus:bg-white transition ${
                           esBusquedaPorId
                             ? "border-[#8a5a63] ring-2 ring-[#8a5a63]/15 font-mono"
                             : "border-stone-200 focus:border-[#8a5a63]"
                         }`}
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition cursor-pointer"
                title="Borrar búsqueda"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {esBusquedaPorId && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-medium bg-[#8a5a63]/10 text-[#8a5a63] border border-[#8a5a63]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8a5a63] animate-pulse" />
              <span>ID: {busqueda.slice(1) ? `#${busqueda.slice(1).trim()}` : "..."}</span>
            </div>
          )}
        </div>

        {/* Filtros: Categoría, En Promoción, Stock Bajo y Reset en la misma línea */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector Categoría */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-500 font-medium">Categoría:</span>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-700
                         focus:outline-none focus:border-[#8a5a63] cursor-pointer"
            >
              <option value="todos">Todas</option>
              {categoriasDisponibles.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <span className="h-5 w-px bg-stone-200 hidden sm:inline-block mx-0.5" />

          {/* Botón Filtro En Promoción */}
          <button
            type="button"
            onClick={() => setFiltroPromocion(!filtroPromocion)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              filtroPromocion
                ? "bg-rose-600 text-white shadow-xs shadow-rose-200"
                : "bg-stone-50 border border-stone-200 text-neutral-700 hover:bg-stone-100"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filtroPromocion ? "bg-white" : "bg-rose-500"}`} />
            <span>En Promoción</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filtroPromocion ? "bg-white/25 text-white" : "bg-rose-100 text-rose-700"}`}>
              {metricas.ofertas}
            </span>
          </button>

          {/* Botón Filtro Stock Bajo */}
          <button
            type="button"
            onClick={() => setFiltroBajoStock(!filtroBajoStock)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              filtroBajoStock
                ? "bg-amber-600 text-white shadow-xs shadow-amber-200"
                : "bg-stone-50 border border-stone-200 text-neutral-700 hover:bg-stone-100"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filtroBajoStock ? "bg-white" : "bg-amber-500"}`} />
            <span>Stock Bajo (≤ 5)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filtroBajoStock ? "bg-white/25 text-white" : "bg-amber-100 text-amber-700"}`}>
              {metricas.bajoStock}
            </span>
          </button>

          {/* Botón Limpiar Filtros */}
          {(filtroPromocion || filtroBajoStock || filtroCategoria !== "todos" || busqueda) && (
            <button
              type="button"
              onClick={() => {
                setFiltroPromocion(false);
                setFiltroBajoStock(false);
                setFiltroCategoria("todos");
                setBusqueda("");
              }}
              title="Restablecer filtros"
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400 text-sm">
            <svg className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8a5a63]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Cargando catálogo de productos...
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 text-sm">
            No se encontraron productos registrados o que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/75 text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                  <th className="py-3.5 px-4">Producto</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Precio</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Promoción</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm text-neutral-700">
                {productosFiltrados.map((p) => {
                  const precioFinal = p.oferta && p.descuento
                    ? p.precio - (p.precio * p.descuento) / 100
                    : p.precio;

                  const idCoincide = esBusquedaPorId && busqueda.slice(1).trim() && String(p.id).toLowerCase().includes(busqueda.slice(1).trim().toLowerCase());

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setProductoVisualizando(p)}
                            className="relative group/img flex-shrink-0 cursor-pointer rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#8a5a63]"
                            title="Haz clic para ver imagen ampliada"
                          >
                            <img
                              src={resolverRutaImagen(p.imagen)}
                              alt={p.nombre}
                              className="w-12 h-12 rounded-lg object-contain bg-stone-100 border border-stone-200 p-1 group-hover/img:scale-105 transition-transform"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/80?text=FS";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                              </svg>
                            </div>
                          </button>
                          <div>
                            <p className="font-medium text-neutral-900 line-clamp-1">{p.nombre}</p>
                            <span
                              className={`text-[11px] font-mono px-1.5 py-0.5 rounded transition-colors inline-block mt-0.5 ${
                                idCoincide
                                  ? "bg-[#8a5a63] text-white font-bold"
                                  : "text-neutral-500 bg-stone-100"
                              }`}
                            >
                              ID: #{p.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-neutral-700 border border-stone-200">
                          {p.categoria}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {p.oferta && p.descuento ? (
                          <div>
                            <span className="text-xs text-neutral-400 line-through mr-1.5">S/{Number(p.precio).toFixed(2)}</span>
                            <span className="text-sm font-semibold text-rose-600">S/{Number(precioFinal).toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="font-medium text-neutral-800">S/{Number(p.precio).toFixed(2)}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            Number(p.stock) <= 5
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${Number(p.stock) <= 5 ? "bg-amber-500" : "bg-emerald-500"}`} />
                          {p.stock} uds.
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {p.oferta ? (
                          <span className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            -{p.descuento}% OFF
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400">Regular</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => abrirEditar(p)}
                            title="Editar producto"
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => abrirModalEliminar(p)}
                            title="Eliminar producto"
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer active:scale-95 group/del"
                          >
                            <svg className="w-4 h-4 transition-transform group-hover/del:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-[fadeIn_0.2s_ease]">
            {/* Cabecera del modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-neutral-400">
                  {editando ? "Actualización" : "Nuevo registro"}
                </p>
                <h3 className="text-xl font-light text-neutral-900 tracking-tight">
                  {editando ? "Editar Producto" : "Registrar Nuevo Producto"}
                </h3>
              </div>
              <button
                onClick={cerrarModal}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-stone-100 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mensaje de error de validación o guardado dentro del modal */}
            {errorModal && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5 animate-[fadeIn_0.2s_ease]">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
                </svg>
                <span className="leading-relaxed font-medium">{errorModal}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nombre del artículo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ej. Casaca de cuero premium"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-800
                             focus:outline-none focus:border-[#8a5a63] focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-800
                               focus:outline-none focus:border-[#8a5a63] focus:bg-white transition cursor-pointer"
                  >
                    {categoriasDisponibles.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Precio (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio"
                    value={form.precio}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-800
                               focus:outline-none focus:border-[#8a5a63] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Stock disponible *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-800
                               focus:outline-none focus:border-[#8a5a63] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Ruta o URL de Imagen
                  </label>
                  <input
                    type="text"
                    name="imagen"
                    value={form.imagen}
                    onChange={handleChange}
                    placeholder="assets/img/foto.jpg"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-800
                               focus:outline-none focus:border-[#8a5a63] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Oferta y Descuento */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3">
                <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="oferta"
                    checked={form.oferta}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-[#8a5a63] focus:ring-[#8a5a63]"
                  />
                  <span className="font-medium">Activar precio de oferta / descuento</span>
                </label>

                {form.oferta && (
                  <div className="pt-2 border-t border-stone-200/60">
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Porcentaje de descuento (%)
                    </label>
                    <input
                      type="number"
                      name="descuento"
                      value={form.descuento}
                      onChange={handleChange}
                      min="1"
                      max="99"
                      placeholder="Ej. 20"
                      className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-sm text-neutral-800
                                 focus:outline-none focus:border-[#8a5a63] transition"
                    />
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 rounded-xl hover:bg-stone-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 text-sm font-medium text-white bg-[#8a5a63] hover:bg-[#754b53] rounded-xl
                             shadow-md shadow-[#8a5a63]/15 transition disabled:opacity-60 cursor-pointer"
                >
                  {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gráfico de Confirmación de Eliminación */}
      {productoAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-3xl shadow-2xl border border-stone-200/80 max-w-md w-full p-6 overflow-hidden relative"
            role="dialog"
            aria-modal="true"
          >
            {/* Glow decorativo sutil en esquina */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center text-center">
              {/* Ícono de advertencia / papelera */}
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-inner">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                ¿Eliminar este producto?
              </h3>
              <p className="text-sm text-neutral-500 mt-1 max-w-xs leading-relaxed">
                Esta acción no se puede deshacer. El producto será retirado permanentemente del catálogo y del inventario.
              </p>

              {/* Tarjeta de previsualización del producto */}
              <div className="w-full mt-5 p-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl text-left flex items-center gap-3.5">
                <img
                  src={resolverRutaImagen(productoAEliminar.imagen)}
                  alt={productoAEliminar.nombre}
                  className="w-14 h-14 rounded-xl object-contain bg-white border border-stone-200 p-1 flex-shrink-0"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/80?text=FS";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-200/70 text-neutral-700">
                      #{productoAEliminar.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-stone-200 text-neutral-600 font-medium">
                      {productoAEliminar.categoria}
                    </span>
                  </div>
                  <p className="font-semibold text-neutral-900 text-sm mt-1 truncate">
                    {productoAEliminar.nombre}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-neutral-800">
                      S/{Number(productoAEliminar.precio).toFixed(2)}
                    </span>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs text-neutral-500">
                      {productoAEliminar.stock} en stock
                    </span>
                  </div>
                </div>
              </div>

              {/* Error en caso falle */}
              {errorEliminar && (
                <div className="w-full mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium text-left flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{errorEliminar}</span>
                </div>
              )}

              {/* Botones de acción */}
              <div className="grid grid-cols-2 gap-3 w-full mt-6">
                <button
                  type="button"
                  disabled={eliminando}
                  onClick={cerrarModalEliminar}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-neutral-700 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 transition cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={eliminando}
                  onClick={confirmarEliminar}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-md shadow-rose-600/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {eliminando ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    <span>Sí, eliminar</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver imagen ampliada */}
      {productoVisualizando && (
        <ImageModal
          isOpen={Boolean(productoVisualizando)}
          onClose={() => setProductoVisualizando(null)}
          imagen={resolverRutaImagen(productoVisualizando.imagen)}
          nombre={productoVisualizando.nombre}
          categoria={productoVisualizando.categoria}
          precio={productoVisualizando.precio}
          descuento={productoVisualizando.descuento}
          oferta={productoVisualizando.oferta}
        />
      )}
    </div>
  );
};

export default Productos;
