import { Menu, UserRound } from "lucide-react";

const obtenerUsuarioAdmin = () => {
  try {
    return JSON.parse(localStorage.getItem("adminUser") || "{}");
  } catch {
    return {};
  }
};

const Header = ({ onMenuClick }) => {
  const user = obtenerUsuarioAdmin();

  return (
    <header className="sticky top-0 z-30 h-[76px] bg-white border-b border-[#E8E0D7] px-4 sm:px-6 lg:px-8 flex items-center justify-between">

      {/* Identificación del panel */}
      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menú de navegación"
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-[#292522] hover:bg-[#F5F1EB] transition-colors cursor-pointer"
        >
          <Menu size={21} />
        </button>

        <div>
          <p className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B7A493] mb-0.5">
            Fashion Store / Administración
          </p>

          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-[#292522]">
            Panel administrativo
          </h1>
        </div>

      </div>

      {/* Usuario */}
      <div className="flex items-center gap-3">

        <div className="hidden sm:block text-right">
          <p className="text-xs font-semibold text-[#292522]">
            {user.nombre || "Administrador"}
          </p>

          <p className="text-[10px] text-[#8A8178] mt-0.5">
            Sesión administrativa
          </p>
        </div>

        <div className="w-10 h-10 rounded-full bg-[#F5F1EB] border border-[#E8E0D7] flex items-center justify-center">
          <UserRound size={19} className="text-[#702D40]" />
        </div>

      </div>

    </header>
  );
};

export default Header;


