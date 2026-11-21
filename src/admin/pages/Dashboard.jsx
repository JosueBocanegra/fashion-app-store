import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  DollarSign,
  Package,
  Users,
  UserCheck,
  Shirt,
  ShoppingCart,
  ArrowRight,
  CalendarDays,
  TrendingUp,
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

// Módulos de acceso rápido: se conservan las rutas existentes.
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
    desc: "Revisa los pedidos de la tienda",
    ruta: "/admin/ventas",
    Icono: ShoppingCart,
  },
];

// Formato de moneda utilizado en Fashion Store.
const formatoMoneda = (valor) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(valor) || 0);

// Formato de fecha para los pedidos.
const formatoFecha = (fecha) => {
  const fechaPedido = new Date(fecha);

  if (Number.isNaN(fechaPedido.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fechaPedido);
};

// Presentación visual de los estados existentes.
const obtenerEstiloEstado = (estado) => {
  const estadoNormalizado = String(
    estado || "Pendiente"
  ).trim().toLowerCase();

  switch (estadoNormalizado) {
    case "en proceso":
      return {
        etiqueta: "En proceso",
        clases: "bg-[#F5F1EB] text-[#705B49] border-[#E5D9CB]",
      };

    case "completado":
      return {
        etiqueta: "Completado",
        clases: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };

    case "cancelado":
      return {
        etiqueta: "Cancelado",
        clases: "bg-rose-50 text-rose-700 border-rose-200",
      };

    case "pendiente":
    default:
      return {
        etiqueta: "Pendiente",
        clases: "bg-amber-50 text-amber-700 border-amber-200",
      };
  }
};

// Recupera el nombre del administrador.
const obtenerNombreAdministrador = () => {
  try {
    const usuario = JSON.parse(
      localStorage.getItem("adminUser") || "{}"
    );

    return usuario.nombre || "Administrador";
  } catch {
    return "Administrador";
  }
};

const Dashboard = () => {
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Se conservan las consultas y la actualización automática.
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

    const interval = setInterval(cargarDatos, 10000);

    return () => clearInterval(interval);
  }, []);

  // Cálculos originales de estadísticas.
  const ventasTotales = useMemo(
    () => ventas.reduce((sum, v) => sum + (v.total || 0), 0),
    [ventas]
  );

  const stockTotal = useMemo(
    () => productos.reduce(
      (sum, p) => sum + (Number(p.stock) || 0),
      0
    ),
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

    return meses.map((nombre, idx) => ({
      mes: nombre,
      total: mapa[idx] || 0,
    }));
  }, [ventas]);

  const productosMasVendidos = useMemo(() => {
    const conteo = {};

    ventas.forEach((v) => {
      (v.items || []).forEach((item) => {
        const key = item.nombre || item.productoId;

        conteo[key] =
          (conteo[key] || 0) + (item.cantidad || 0);
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
        .sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        )
        .slice(0, 5),
    [ventas]
  );

  const nombreAdmin = obtenerNombreAdministrador();

  const fechaActual = new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Estado de carga.
  if (loading) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-[3px] border-[#E8E0D7] border-t-[#702D40] animate-spin" />
        <p className="text-sm text-[#8A8178]">
          Cargando información del negocio...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* -----------------------------------------
          ENCABEZADO DEL DASHBOARD
      ------------------------------------------ */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B7A493] mb-2">
            Panel de control
          </p>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#292522]">
            Resumen general
          </h1>

          <p className="text-sm text-[#8A8178] mt-2">
            Bienvenido, {nombreAdmin}. Aquí tienes el estado de tu tienda.
          </p>
        </div>

        <div className="inline-flex items-center gap-2.5 self-start sm:self-auto px-3.5 py-2.5 rounded-lg bg-white border border-[#E8E0D7]">
          <CalendarDays size={16} className="text-[#702D40]" />

          <span className="text-xs font-medium text-[#6F665E] capitalize">
            {fechaActual}
          </span>
        </div>

      </header>

      {/* -----------------------------------------
          INDICADORES PRINCIPALES
      ------------------------------------------ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[#292522]">
              Indicadores del negocio
            </h2>

            <p className="text-xs text-[#9A9187] mt-1">
              Información general registrada en el sistema
            </p>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-[#8A8178]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Datos actualizados automáticamente
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          <StatCard
            titulo="Ventas totales"
            valor={formatoMoneda(ventasTotales)}
            detalle={`${ventas.length} pedidos registrados`}
            Icono={DollarSign}
          />

          <StatCard
            titulo="Productos en stock"
            valor={stockTotal.toLocaleString("es-PE")}
            detalle="Unidades disponibles"
            Icono={Package}
          />

          <StatCard
            titulo="Usuarios registrados"
            valor={usuarios.length.toLocaleString("es-PE")}
            detalle="Cuentas administrativas"
            Icono={Users}
          />

          <StatCard
            titulo="Clientes"
            valor={clientes.length.toLocaleString("es-PE")}
            detalle="Clientes registrados"
            Icono={UserCheck}
          />

        </div>
      </section>

      {/* -----------------------------------------
          GRÁFICOS
      ------------------------------------------ */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Ventas por mes */}
        <div className="bg-white rounded-2xl border border-[#E8E0D7] shadow-sm p-5 sm:p-6">

          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-sm font-semibold text-[#292522]">
                Ventas por mes
              </h2>

              <p className="text-xs text-[#9A9187] mt-1">
                Distribución de los importes registrados
              </p>
            </div>

            <div className="w-9 h-9 rounded-lg bg-[#F5F1EB] flex items-center justify-center">
              <TrendingUp size={18} className="text-[#702D40]" />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={ventasPorMes}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="4 4"
                stroke="#EEE8E1"
              />

              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#92877D", fontSize: 11 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#92877D", fontSize: 11 }}
                tickFormatter={(value) =>
                  value >= 1000
                    ? `S/${(value / 1000).toFixed(0)}k`
                    : `S/${value}`
                }
                width={55}
              />

              <Tooltip
                formatter={(value) => [
                  formatoMoneda(value),
                  "Ventas",
                ]}
                contentStyle={{
                  border: "1px solid #E8E0D7",
                  borderRadius: "10px",
                  boxShadow: "0 8px 24px rgba(41,37,34,0.08)",
                  fontSize: "12px",
                }}
                labelStyle={{
                  color: "#292522",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              />

              <Line
                type="monotone"
                dataKey="total"
                stroke="#702D40"
                strokeWidth={2.5}
                dot={{
                  r: 3,
                  fill: "#FFFFFF",
                  stroke: "#702D40",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: "#702D40",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
              />

            </LineChart>
          </ResponsiveContainer>

        </div>

        {/* Productos más vendidos */}
        <div className="bg-white rounded-2xl border border-[#E8E0D7] shadow-sm p-5 sm:p-6">

          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="text-sm font-semibold text-[#292522]">
                Productos más vendidos
              </h2>

              <p className="text-xs text-[#9A9187] mt-1">
                Cinco productos con mayor cantidad vendida
              </p>
            </div>

            <div className="w-9 h-9 rounded-lg bg-[#F5F1EB] flex items-center justify-center">
              <Package size={18} className="text-[#702D40]" />
            </div>
          </div>

          {productosMasVendidos.length === 0 ? (
            <div className="h-[280px] flex flex-col items-center justify-center text-center">
              <Package size={28} className="text-[#C9BFB4] mb-3" />

              <p className="text-sm font-medium text-[#6F665E]">
                Sin información disponible
              </p>

              <p className="text-xs text-[#A69A8E] mt-1">
                Todavía no hay productos vendidos.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={productosMasVendidos}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              >
                <CartesianGrid
                  horizontal={false}
                  strokeDasharray="4 4"
                  stroke="#EEE8E1"
                />

                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#92877D", fontSize: 11 }}
                />

                <YAxis
                  dataKey="nombre"
                  type="category"
                  width={112}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6F665E", fontSize: 10 }}
                />

                <Tooltip
                  formatter={(value) => [
                    value,
                    "Unidades vendidas",
                  ]}
                  contentStyle={{
                    border: "1px solid #E8E0D7",
                    borderRadius: "10px",
                    boxShadow: "0 8px 24px rgba(41,37,34,0.08)",
                    fontSize: "12px",
                  }}
                />

                <Bar
                  dataKey="cantidad"
                  fill="#702D40"
                  radius={[0, 7, 7, 0]}
                  barSize={19}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

        </div>

      </section>

      {/* -----------------------------------------
          PEDIDOS RECIENTES
      ------------------------------------------ */}
      <section className="bg-white rounded-2xl border border-[#E8E0D7] shadow-sm overflow-hidden">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-5 border-b border-[#EEE8E1]">

          <div>
            <h2 className="text-sm font-semibold text-[#292522]">
              Pedidos recientes
            </h2>

            <p className="text-xs text-[#9A9187] mt-1">
              Últimas cinco ventas registradas
            </p>
          </div>

          <Link
            to="/admin/ventas"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#702D40] hover:text-[#522030] transition-colors"
          >
            Ver todas las ventas
            <ArrowRight size={14} />
          </Link>

        </div>

        {pedidosRecientes.length === 0 ? (
          <div className="py-12 px-5 text-center">
            <ShoppingCart
              size={30}
              className="mx-auto text-[#C9BFB4] mb-3"
            />

            <p className="text-sm font-medium text-[#6F665E]">
              Aún no hay pedidos registrados
            </p>

            <p className="text-xs text-[#A69A8E] mt-1">
              Las ventas recientes aparecerán en esta sección.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">

              <thead>
                <tr className="bg-[#FAF8F5] text-[10px] uppercase tracking-wider text-[#92877D]">
                  <th className="px-6 py-3.5 font-semibold">
                    Pedido
                  </th>

                  <th className="px-6 py-3.5 font-semibold">
                    Fecha
                  </th>

                  <th className="px-6 py-3.5 font-semibold">
                    Artículos
                  </th>

                  <th className="px-6 py-3.5 font-semibold">
                    Estado
                  </th>

                  <th className="px-6 py-3.5 font-semibold text-right">
                    Importe
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F0EBE5]">

                {pedidosRecientes.map((pedido) => {
                  const estado = obtenerEstiloEstado(
                    pedido.estado
                  );

                  const cantidadArticulos = Array.isArray(
                    pedido.items
                  )
                    ? pedido.items.length
                    : 0;

                  return (
                    <tr
                      key={pedido.id}
                      className="hover:bg-[#FCFAF8] transition-colors"
                    >

                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-[#292522]">
                          #{pedido.id}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs text-[#6F665E]">
                          {formatoFecha(pedido.fecha)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs text-[#6F665E]">
                          {cantidadArticulos}{" "}
                          {cantidadArticulos === 1
                            ? "artículo"
                            : "artículos"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${estado.clases}`}
                        >
                          {estado.etiqueta}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-semibold text-[#292522]">
                          {formatoMoneda(pedido.total)}
                        </span>
                      </td>

                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>
        )}

      </section>

      {/* -----------------------------------------
          ACCESOS A LOS MÓDULOS
      ------------------------------------------ */}
      <section>

        <div className="mb-4">
          <h2 className="text-sm font-semibold text-[#292522]">
            Módulos del sistema
          </h2>

          <p className="text-xs text-[#9A9187] mt-1">
            Accede directamente a las principales áreas de gestión.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {modulos.map(({ nombre, desc, ruta, Icono }) => (
            <Link
              key={ruta}
              to={ruta}
              className="group bg-white rounded-xl border border-[#E8E0D7] p-5 hover:border-[#B7A493] hover:shadow-md transition-all duration-200"
            >

              <div className="flex items-start justify-between gap-3">

                <div className="w-10 h-10 rounded-lg bg-[#F5F1EB] flex items-center justify-center group-hover:bg-[#702D40] transition-colors">
                  <Icono
                    size={19}
                    strokeWidth={1.8}
                    className="text-[#702D40] group-hover:text-white transition-colors"
                  />
                </div>

                <ArrowRight
                  size={16}
                  className="text-[#B7A493] group-hover:text-[#702D40] group-hover:translate-x-1 transition-all"
                />

              </div>

              <h3 className="text-sm font-semibold text-[#292522] mt-4">
                {nombre}
              </h3>

              <p className="text-xs text-[#8A8178] mt-1 leading-relaxed">
                {desc}
              </p>

            </Link>
          ))}

        </div>

      </section>

    </div>
  );
};

// -----------------------------------------
// TARJETA DE ESTADÍSTICA
// -----------------------------------------
const StatCard = ({ titulo, valor, detalle, Icono }) => (
  <article className="bg-white rounded-xl border border-[#E8E0D7] p-5 shadow-sm hover:shadow-md transition-shadow">

    <div className="flex items-start justify-between gap-3">

      <div className="min-w-0">
        <p className="text-[11px] font-medium text-[#8A8178]">
          {titulo}
        </p>

        <p className="text-xl sm:text-2xl font-semibold tracking-tight text-[#292522] mt-2 truncate">
          {valor}
        </p>
      </div>

      <div className="w-10 h-10 rounded-lg bg-[#F5F1EB] flex items-center justify-center shrink-0">
        <Icono size={19} strokeWidth={1.8} className="text-[#702D40]" />
      </div>

    </div>

    <p className="text-[10px] text-[#A69A8E] mt-4 pt-3 border-t border-[#F0EBE5]">
      {detalle}
    </p>

  </article>
);

export default Dashboard;


