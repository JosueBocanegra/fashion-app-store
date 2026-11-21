import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  ShoppingBag,
  LayoutDashboard,
  Package,
  Users,
  UserRound,
  ShoppingCart,
  Image,
  LogOut,
  X,
  Store,
} from "lucide-react";

import {
  publicidadService,
  obtenerImagenLogoActivo,
} from "../../services/publicidadService";

import {
  esAdministrador,
  obtenerUsuarioSesion,
  tieneAccesoModulo,
} from "../utils/permisos";

// Módulos disponibles en el panel.
const links = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    Icon: LayoutDashboard,
    modulo: "dashboard",
  },
  {
    to: "/admin/productos",
    label: "Productos",
    Icon: Package,
    modulo: "productos",
  },
  {
    to: "/admin/clientes",
    label: "Clientes",
    Icon: Users,
    modulo: "clientes",
  },
  {
    to: "/admin/ventas",
    label: "Ventas",
    Icon: ShoppingCart,
    modulo: "ventas",
  },
  {
    to: "/admin/usuarios",
    label: "Usuarios",
    Icon: UserRound,
    soloAdministrador: true,
  },
  {
    to: "/admin/publicidad",
    label: "Publicidad",
    Icon: Image,
    modulo: "publicidad",
  },
];

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const navigate = useNavigate();

  const [logoTienda, setLogoTienda] = useState("");

  const usuarioActual = obtenerUsuarioSesion();
  const esAdmin = esAdministrador(usuarioActual);

  // Mostrar únicamente las opciones autorizadas.
  const linksVisibles = links.filter((link) => {
    if (link.soloAdministrador) {
      return esAdmin;
    }

    return tieneAccesoModulo(usuarioActual, link.modulo);
  });

  /* =====================================================
     LOGOTIPO
     ===================================================== */

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

  /* =====================================================
     CERRAR SESIÓN
     ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
    onClose();
  };

  /* =====================================================
     INTERFAZ
     ===================================================== */

  return (
    <>
      {/* Fondo para navegación móvil */}
      {isOpen && (
        <button
          type="button"
          aria-label="Cerrar menú de navegación"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          w-[276px] max-w-[85vw]
          bg-[#292522] text-white
          border-r border-white/5
          shadow-2xl
          transition-transform duration-300 ease-out
          lg:sticky lg:top-0 lg:z-30
          lg:h-screen lg:w-[270px] lg:max-w-none
          lg:translate-x-0 lg:shadow-none
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Identidad de la tienda */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center justify-between min-h-11">
            {logoTienda ? (
              <img
                src={logoTienda}
                alt="Fashion Store"
                className="max-w-[170px] max-h-11 object-contain"
                onError={() => setLogoTienda("")}
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <ShoppingBag
                    size={21}
                    className="text-[#D8C5A5]"
                  />
                </div>

                <div className="leading-tight">
                  <p className="text-xs font-semibold tracking-[0.18em] text-white uppercase">
                    Fashion Store
                  </p>

                  <p className="text-[10px] text-[#B7A493] mt-1 tracking-wider">
                    MODA Y ESTILO
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar menú"
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[#B7A493] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <X size={19} />
            </button>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <Store
              size={13}
              className="text-[#B7A493]"
            />

            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#B7A493]">
              {esAdmin ? "Administración" : "Acceso de empleado"}
            </span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
            Menú principal
          </p>

          {linksVisibles.length > 0 ? (
            <div className="space-y-1.5">
              {linksVisibles.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  onClick={onClose}
                  className={({ isActive }) => `
                    group flex items-center gap-3
                    px-3.5 py-3 rounded-xl
                    text-[13px] font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-[#702D40] text-white shadow-lg shadow-black/10"
                        : "text-[#C4BBB2] hover:bg-white/[0.06] hover:text-white"
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={18}
                        strokeWidth={isActive ? 2.1 : 1.7}
                        className={
                          isActive
                            ? "text-[#D8C5A5]"
                            : "text-[#B7A493] group-hover:text-white"
                        }
                      />

                      <span>{label}</span>

                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D8C5A5]" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ) : (
            <p className="px-3 py-4 text-xs leading-relaxed text-[#B7A493]">
              Tu cuenta todavía no tiene módulos asignados.
            </p>
          )}
        </nav>

        {/* Cerrar sesión */}
        <div className="px-4 pb-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] font-medium text-[#C4BBB2] hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
          >
            <LogOut
              size={18}
              className="text-[#B7A493]"
            />

            <span>Cerrar sesión</span>
          </button>
        </div>

        {/* Pie */}
        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-[9px] text-white/30 tracking-wider">
            FASHION STORE © {new Date().getFullYear()}
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;


