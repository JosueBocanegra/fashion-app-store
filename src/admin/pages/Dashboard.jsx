import { Link } from "react-router-dom";

const modulos = [
  { nombre: "Productos", ruta: "/admin/productos", desc: "Catálogo, precios, stock y ofertas" },
  { nombre: "Clientes", ruta: "/admin/clientes", desc: "Directorio de clientes registrados" },
  { nombre: "Usuarios", ruta: "/admin/usuarios", desc: "Gestión de roles y colaboradores" },
  { nombre: "Publicidad", ruta: "/admin/publicidad", desc: "Campañas y banners promocionales" },
];

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("adminUser") || "{}");

  const hoy = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.35em] uppercase text-neutral-500 mb-2">
          Resumen
        </p>
        <h2 className="text-3xl font-light text-neutral-900 tracking-tight">
          Hola, {user.nombre || "Administrador"}
        </h2>
        <p className="text-sm text-neutral-500 mt-1.5 capitalize">{hoy}</p>
      </div>

      {/* Tarjeta principal */}
      <div className="bg-white rounded-2xl border border-stone-200/70 p-8">
        <div className="flex items-center gap-4 mb-6">
          <span className="h-px w-10 bg-stone-300" />
          <span className="text-[10px] tracking-[0.35em] uppercase text-neutral-500">
            Panel administrativo
          </span>
        </div>

        <h3 className="text-xl font-light text-neutral-800 mb-3">
          Bienvenido al espacio interno de Fashion Store.
        </h3>
        <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">
          Desde aquí podrás gestionar la información de la tienda, catálogo de productos,
          clientes, usuarios y promociones publicitarias en tiempo real.
        </p>
      </div>

      {/* Módulos activos */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Módulos del Sistema</p>
          <span className="text-xs text-neutral-400">4 módulos disponibles</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modulos.map((m) => (
            <Link
              key={m.nombre}
              to={m.ruta}
              className="group bg-white rounded-xl border border-stone-200/90 p-5 hover:border-[#8a5a63] hover:shadow-md transition-all duration-200 block cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] tracking-[0.28em] uppercase text-neutral-400">
                  Módulo
                </p>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  Activo
                </span>
              </div>
              <p className="text-base font-medium text-neutral-800 group-hover:text-[#8a5a63] transition-colors">
                {m.nombre}
              </p>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                {m.desc}
              </p>
              <div className="mt-4 flex items-center text-xs font-medium text-[#8a5a63] group-hover:translate-x-1 transition-transform">
                <span>Gestionar</span>
                <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


