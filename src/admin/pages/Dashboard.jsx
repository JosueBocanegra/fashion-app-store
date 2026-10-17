import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Package,
  Users,
  UserCheck,
  Shirt,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { productosService } from "../services/productosService";
import { usuariosService } from "../services/usuariosService";
import { clientesService } from "../services/clientesService";
import { ventasService } from "../services/ventasService";

// Array de módulos (recuperado de tu versión original, ahora con iconos)
const modulos = [
  {
    nombre: "Productos",
    desc: "Gestiona el catálogo de prendas",
    ruta: "/admin/productos",
    Icono: Shirt,
  },
  {
    nombre: "Usuarios",
    desc: "Administra los usuarios del sistema",
    ruta: "/admin/usuarios",
    Icono: Users,
  },
  {
    nombre: "Clientes",
    desc: "Consulta y edita clientes registrados",
    ruta: "/admin/clientes",
    Icono: UserCheck,
  },
  {
    nombre: "Ventas",
    desc: "Revisa y registra pedidos",
    ruta: "/admin/ventas",
    Icono: ShoppingCart,
  },
];

const Dashboard = () => {
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [prods, users, clients, sales] = await Promise.all([
          productosService.obtenerProductos(),
          usuariosService.obtenerUsuarios(),
          clientesService.obtenerClientes(),
          ventasService.obtenerVentas(),
        ]);
        setProductos(Array.isArray(prods) ? prods : []);
        setUsuarios(Array.isArray(users) ? users : []);
        setClientes(Array.isArray(clients) ? clients : []);
        setVentas(Array.isArray(sales) ? sales : []);
      } catch (err) {
        console.error("Error cargando datos del dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
    const interval = setInterval(cargarDatos, 10000); // actualiza cada 10 s
    return () => clearInterval(interval);
  }, []);

  // --- Cálculos derivados ---
  const ventasTotales = useMemo(
    () => ventas.reduce((sum, v) => sum + (v.total || 0), 0),
    [ventas]
  );

  const stockTotal = useMemo(
    () => productos.reduce((sum, p) => sum + (Number(p.stock) || 0), 0),
    [productos]
  );

  const ventasPorMes = useMemo(() => {
    const meses = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];
    const mapa = {};
    ventas.forEach((v) => {
      const mes = new Date(v.fecha).getMonth();
      mapa[mes] = (mapa[mes] || 0) + (v.total || 0);
    });
    return meses.map((nombre, idx) => ({ mes: nombre, total: mapa[idx] || 0 }));
  }, [ventas]);

  const productosMasVendidos = useMemo(() => {
    const conteo = {};
    ventas.forEach((v) => {
      (v.items || []).forEach((item) => {
        const key = item.nombre || item.productoId;
        conteo[key] = (conteo[key] || 0) + (item.cantidad || 0);
      });
    });
    return Object.entries(conteo)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }, [ventas]);

  const pedidosRecientes = useMemo(
    () =>
      [...ventas]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5),
    [ventas]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-500">
        Cargando dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <header>
        <h1 className="text-2xl font-semibold text-neutral-800">Resumen</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Hola,{" "}
          {JSON.parse(localStorage.getItem("adminUser") || "{}").nombre ||
            "Administrador"}{" "}
        </p>
      </header>

      {/* 1. Tarjetas de estadísticas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          titulo="Ventas totales"
          valor={`$${ventasTotales.toLocaleString("es-PE")}`}
          Icono={DollarSign}
          colorIcono="bg-[#8a5a63]/10 text-[#8a5a63]"
        />
        <StatCard
          titulo="Productos en stock"
          valor={stockTotal}
          Icono={Package}
          colorIcono="bg-blue-50 text-blue-700"
        />
        <StatCard
          titulo="Usuarios registrados"
          valor={usuarios.length}
          Icono={Users}
          colorIcono="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          titulo="Clientes"
          valor={clientes.length}
          Icono={UserCheck}
          colorIcono="bg-amber-50 text-amber-700"
        />
      </section>

      {/* 2. Gráficos */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas por mes */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <h2 className="font-semibold text-neutral-800 mb-4">
            Ventas por mes
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={ventasPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="mes" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => `$${value}`} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#8a5a63"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Productos más vendidos */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <h2 className="font-semibold text-neutral-800 mb-4">
            Productos más vendidos
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={productosMasVendidos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" fontSize={12} />
              <YAxis
                dataKey="nombre"
                type="category"
                width={120}
                fontSize={12}
              />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#8a5a63" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 3. Pedidos recientes */}
      <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
        <h2 className="font-semibold text-neutral-800 mb-4">
          Pedidos recientes
        </h2>
        {pedidosRecientes.length === 0 ? (
          <p className="text-sm text-neutral-400">Aún no hay pedidos.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {pedidosRecientes.map((pedido) => (
              <li
                key={pedido.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-800">
                    Pedido #{pedido.id}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {new Date(pedido.fecha).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#8a5a63]">
                  ${pedido.total}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 4. Módulos del sistema */}
      <section>
        <h2 className="font-semibold text-neutral-800 mb-4">
          Módulos del sistema
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modulos.map(({ nombre, desc, ruta, Icono }) => (
            <Link
              key={ruta}
              to={ruta}
              className="block bg-white rounded-2xl border border-stone-200 p-5 hover:border-[#8a5a63]/50 hover:shadow-md transition group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#8a5a63]/10 text-[#8a5a63] flex items-center justify-center mb-3 group-hover:bg-[#8a5a63] group-hover:text-white transition-colors">
                <Icono size={20} strokeWidth={2} />
              </div>
              <h3 className="font-semibold text-neutral-800 group-hover:text-[#8a5a63]">
                {nombre}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">{desc}</p>
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-[#8a5a63]">
                Gestionar <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- Componente de tarjeta de estadística ---
const StatCard = ({ titulo, valor, Icono, colorIcono }) => (
  <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex items-start gap-4">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorIcono}`}
    >
      <Icono size={22} strokeWidth={2} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-neutral-500">{titulo}</p>
      <p className="text-xl font-bold text-neutral-800 truncate">{valor}</p>
    </div>
  </div>
);

export default Dashboard;


