import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShoppingBag,
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Se conserva el proceso de autenticación existente.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/usuarios");
      const usuarios = await res.json();

      const user = usuarios.find(
        (u) =>
          u.email === email.trim() &&
          u.password === password
      );

      if (user) {
        const payload = {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
        };

        localStorage.setItem(
          "adminUser",
          JSON.stringify(payload)
        );

        navigate("/admin/dashboard");
      } else {
        setError(
          "Las credenciales no coinciden con nuestros registros."
        );
      }
    } catch {
      setError(
        "No pudimos conectar con el servidor. Intenta más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-[0.92fr_1.08fr] bg-[#F5F1EB]">

      {/* -----------------------------------------
          IDENTIDAD DE FASHION STORE
      ------------------------------------------ */}
      <section className="hidden lg:flex flex-col justify-between bg-[#292522] px-12 xl:px-16 py-10 text-white">

        {/* Marca */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center">
            <ShoppingBag
              size={21}
              className="text-[#D8C5A5]"
            />
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.2em] uppercase">
              Fashion Store
            </p>

            <p className="text-[10px] tracking-[0.2em] uppercase text-[#B7A493] mt-1">
              Administración
            </p>
          </div>
        </div>

        {/* Mensaje institucional */}
        <div className="max-w-md">

          <div className="w-10 h-[3px] bg-[#702D40] mb-7 rounded-full" />

          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B7A493] mb-4">
            Panel de gestión
          </p>

          <h1 className="text-4xl xl:text-5xl font-light leading-tight tracking-tight">
            Moda, estilo y
            <span className="block text-[#D8C5A5] mt-1">
              administración.
            </span>
          </h1>

          <p className="text-sm leading-7 text-[#B7A493] mt-6 max-w-sm">
            Accede al sistema de gestión de Fashion Store
            para administrar los productos, clientes,
            ventas y demás operaciones de la tienda.
          </p>

        </div>

        {/* Pie */}
        <div className="flex items-center justify-between border-t border-white/10 pt-5">
          <p className="text-[10px] tracking-wider text-white/40">
            © {new Date().getFullYear()} Fashion Store
          </p>

          <p className="text-[10px] uppercase tracking-wider text-white/40">
            Acceso privado
          </p>
        </div>

      </section>

      {/* -----------------------------------------
          FORMULARIO DE ACCESO
      ------------------------------------------ */}
      <section className="min-h-screen flex flex-col items-center justify-center px-5 py-10 sm:px-8">

        {/* Marca para dispositivos móviles */}
        <div className="lg:hidden flex items-center justify-center gap-3 mb-9">
          <div className="w-10 h-10 rounded-xl bg-[#292522] flex items-center justify-center">
            <ShoppingBag
              size={20}
              className="text-[#D8C5A5]"
            />
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[#292522]">
              Fashion Store
            </p>

            <p className="text-[10px] tracking-wider uppercase text-[#8A8178] mt-0.5">
              Administración
            </p>
          </div>
        </div>

        <div className="w-full max-w-[440px] bg-white border border-[#E8E0D7] rounded-2xl shadow-sm p-7 sm:p-10">

          {/* Encabezado del formulario */}
          <div className="mb-8">

            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#702D40] mb-3">
              Acceso administrativo
            </p>

            <h2 className="text-3xl font-semibold tracking-tight text-[#292522]">
              Iniciar sesión
            </h2>

            <p className="text-sm text-[#8A8178] mt-2 leading-relaxed">
              Ingresa tus credenciales para acceder al panel
              de administración.
            </p>

          </div>

          {/* Mensaje de error */}
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-lg border border-[#702D40]/20 bg-[#702D40]/5 px-3.5 py-3 text-sm text-[#702D40]"
            >
              <span className="font-semibold">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Correo electrónico */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-[#292522] mb-2"
              >
                Correo electrónico
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B7A493] pointer-events-none"
                />

                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="nombre@fashionstore.com"
                  className="w-full h-12 pl-11 pr-4 bg-white border border-[#E8E0D7] rounded-lg text-sm text-[#292522] placeholder:text-[#B7A493] outline-none transition-all focus:border-[#702D40] focus:ring-2 focus:ring-[#702D40]/10"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-[#292522]"
                >
                  Contraseña
                </label>

                <button
                  type="button"
                  onClick={() =>
                    alert("Contacta al administrador del sistema.")
                  }
                  className="text-[11px] text-[#702D40] hover:underline cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B7A493] pointer-events-none"
                />

                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  className="w-full h-12 pl-11 pr-12 bg-white border border-[#E8E0D7] rounded-lg text-sm text-[#292522] placeholder:text-[#B7A493] outline-none transition-all focus:border-[#702D40] focus:ring-2 focus:ring-[#702D40]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B7A493] hover:text-[#292522] transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Botón de acceso */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#702D40] hover:bg-[#5E2435] text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-[#702D40]/15 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Verificando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight size={17} />
                </>
              )}
            </button>

          </form>

          {/* Pie del formulario */}
          <div className="mt-8 pt-5 border-t border-[#E8E0D7]">
            <p className="text-center text-[10px] uppercase tracking-[0.16em] text-[#A69A8E]">
              Acceso exclusivo para personal autorizado
            </p>
          </div>

        </div>

        {/* Copyright móvil */}
        <p className="lg:hidden text-[10px] text-[#A69A8E] mt-7">
          © {new Date().getFullYear()} Fashion Store
        </p>

      </section>

    </main>
  );
};

export default Login;


