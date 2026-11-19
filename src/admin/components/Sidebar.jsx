import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

import {
  publicidadService,
  obtenerImagenLogoActivo,
} from "../../services/publicidadService";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/clientes", label: "Clientes" },
  { to: "/admin/ventas", label: "Ventas" },
  { to: "/admin/usuarios", label: "Usuarios" },
  { to: "/admin/publicidad", label: "Publicidad" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const [logoTienda, setLogoTienda] = useState("");

  useEffect(() => {
    let componenteActivo = true;

    const cargarLogo = async () => {
      try {
        const configuracion =
          await publicidadService.obtenerConfiguracionTienda();

        if (componenteActivo) {
          setLogoTienda(
            obtenerImagenLogoActivo(configuracion)
          );
        }
      } catch (error) {
        console.error(
          "No se pudo cargar el logo en el panel:",
          error
        );
      }
    };

    const actualizarLogo = (event) => {
      setLogoTienda(event.detail?.logo || "");
    };

    cargarLogo();

    window.addEventListener(
      "logo-tienda-actualizado",
      actualizarLogo
    );

    return () => {
      componenteActivo = false;

      window.removeEventListener(
        "logo-tienda-actualizado",
        actualizarLogo
      );
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  return (
    <aside className="w-60 bg-[#1e1618] text-neutral-200 flex flex-col border-r border-white/5">

      {/* Marca de la tienda */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="min-h-10 flex items-center gap-2.5">

          {logoTienda ? (
            <img
              src={logoTienda}
              alt="Fashion Store"
              className="max-w-[150px] max-h-10 object-contain"
              onError={() => setLogoTienda("")}
            />
          ) : (
            <>
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center">
                <ShoppingBag size={17} className="text-neutral-300" />
              </div>

              <div className="leading-tight">
                <p className="text-[11px] tracking-[0.22em] uppercase text-neutral-300">
                  Fashion Store
                </p>
              </div>
            </>
          )}
        </div>

        <p className="text-[9px] tracking-[0.28em] uppercase text-neutral-500 mt-1.5 ml-1">
          Admin
        </p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[#8a5a63]/25 text-white border border-[#8a5a63]/40"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Cerrar sesión */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>

          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;


