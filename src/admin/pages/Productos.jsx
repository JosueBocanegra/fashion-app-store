import { useEffect, useState, useMemo } from "react";
import { productosService } from "../services/productosService";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");

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
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditando(null);
    setForm(initialForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }
    if (form.precio === "" || Number(form.precio) <= 0) {
      setError("El precio debe ser un número mayor a 0.");
      return;
    }
    if (form.stock === "" || Number(form.stock) < 0) {
      setError("El stock no puede ser negativo.");
      return;
    }

    setGuardando(true);
    setError("");

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
    } catch (err) {
      setError("Ocurrió un error al guardar el producto. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (producto) => {
    const confirmar = window.confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`);
    if (!confirmar) return;

    try {
      await productosService.eliminarProducto(producto.id);
      await cargarProductos();
    } catch (err) {
      setError("No se pudo eliminar el producto.");
    }
  };

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideBusqueda =
        p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.categoria?.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria =
        filtroCategoria === "todos" || p.categoria === filtroCategoria;
      return coincideBusqueda && coincideCategoria;
    });
  }, [productos, busqueda, filtroCategoria]);

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

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Total Productos</p>
          <p className="text-2xl font-light text-neutral-900 mt-1">{metricas.total}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider text-rose-500 font-medium">En Promoción</p>
          <p className="text-2xl font-light text-rose-600 mt-1">{metricas.ofertas}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Stock Total</p>
          <p className="text-2xl font-light text-neutral-900 mt-1">{metricas.stockTotal} <span className="text-xs text-neutral-400">uds.</span></p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider text-amber-500 font-medium">Stock Bajo (≤ 5)</p>
          <p className="text-2xl font-light text-amber-600 mt-1">{metricas.bajoStock}</p>
        </div>
      </div>

      {/* Alerta de error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-3.5">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-800 placeholder-neutral-400
                       focus:outline-none focus:border-[#8a5a63] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-neutral-500 font-medium">Categoría:</span>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-neutral-700
                       focus:outline-none focus:border-[#8a5a63] cursor-pointer"
          >
            <option value="todos">Todas las categorías</option>
            {categoriasDisponibles.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
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

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolverRutaImagen(p.imagen)}
                            alt={p.nombre}
                            className="w-11 h-11 rounded-lg object-contain bg-stone-100 border border-stone-200 p-1 flex-shrink-0"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/80?text=FS";
                            }}
                          />
                          <div>
                            <p className="font-medium text-neutral-900 line-clamp-1">{p.nombre}</p>
                            <p className="text-[11px] text-neutral-400 font-mono">ID: {p.id}</p>
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
                            onClick={() => handleEliminar(p)}
                            title="Eliminar producto"
                            className="p-1.5 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
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
    </div>
  );
};

export default Productos;
