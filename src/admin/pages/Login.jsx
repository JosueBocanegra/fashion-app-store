import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/usuarios");
      const usuarios = await res.json();
      const user = usuarios.find(
        (u) => u.email === email.trim() && u.password === password
      );

      if (user) {
        const payload = {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
        };
        localStorage.setItem("adminUser", JSON.stringify(payload));
        navigate("/admin/dashboard");
      } else {
        setError("Las credenciales no coinciden con nuestros registros.");
      }
    } catch {
      setError("No pudimos conectar con el servidor. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-100">
      {/* ---------- Lado izquierdo: marca ---------- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#3a2a30] via-[#2a1e24] to-[#1a1216]">
        {/* Halos decorativos tenues */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-rose-200/[0.06] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-200/[0.05] rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 w-40 h-40 bg-rose-100/[0.04] rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-neutral-100 w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/[0.08] backdrop-blur border border-white/10 flex items-center justify-center font-light text-lg tracking-widest">
              FS
            </div>
            <div className="leading-tight">
              <p className="text-sm tracking-[0.22em] uppercase text-neutral-200">
                Fashion Store
              </p>
              <p className="text-[10px] tracking-[0.28em] uppercase text-neutral-500">
                Boutique · Atelier
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px w-10 bg-neutral-600" />
              <span className="text-[10px] tracking-[0.35em] uppercase text-neutral-400">
                Panel privado
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-light leading-tight mb-5 tracking-tight">
              Estilo que <br />
              <span className="italic font-serif text-rose-200/80">
                trasciende
              </span>{" "}
              temporadas.
            </h1>
            <p className="text-neutral-400/90 text-sm leading-relaxed max-w-sm">
              Bienvenido al espacio reservado para el equipo de Fashion Store.
              Inicia sesión con tus credenciales asignadas.
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] tracking-[0.22em] uppercase text-neutral-500">
            <span>© {new Date().getFullYear()} Fashion Store</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
              Sistema activo
            </span>
          </div>
        </div>

        {/* Separador vertical sutil */}
        <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      </div>

      {/* ---------- Lado derecho: formulario ---------- */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#2a1e24] flex items-center justify-center text-neutral-100 font-light tracking-widest text-sm">
              FS
            </div>
            <span className="text-sm tracking-[0.22em] uppercase text-neutral-700">
              Fashion Store
            </span>
          </div>

          <div className="mb-8">
            <p className="text-[10px] tracking-[0.35em] uppercase text-neutral-500 mb-3">
              Acceso
            </p>
            <h2 className="text-3xl font-light text-neutral-900 tracking-tight">
              Bienvenido de nuevo
            </h2>
            <p className="text-neutral-500 mt-2 text-sm">
              Ingresa tus credenciales para continuar.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-3.5 animate-[fadeIn_0.25s_ease]">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 pointer-events-none">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l9 6 9-6M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z"
                    />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="nombre@fashion.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-neutral-800 placeholder-neutral-400
                             focus:outline-none focus:border-[#8a5a63] focus:ring-4 focus:ring-[#8a5a63]/10 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-neutral-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-xs text-[#8a5a63] hover:text-[#6d454c] font-medium transition-colors"
                  onClick={() =>
                    alert("Contacta al administrador del sistema.")
                  }
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400 pointer-events-none">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-white border border-stone-200 rounded-xl text-neutral-800 placeholder-neutral-400
                             focus:outline-none focus:border-[#8a5a63] focus:ring-4 focus:ring-[#8a5a63]/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                  aria-label={showPassword ? "Ocultar" : "Mostrar"}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-10-7 0 0 1-3 4-5m3.5 9.5A3 3 0 019 12m12 0c-1-2-4-6-9-6m2.11-.89L21 21M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-medium text-white tracking-wide
                         bg-[#8a5a63] hover:bg-[#754b53]
                         focus:outline-none focus:ring-4 focus:ring-[#8a5a63]/25
                         shadow-md shadow-[#8a5a63]/15
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Verificando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7-7 7M21 12H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-stone-300" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-500">
              Acceso restringido
            </span>
            <span className="h-px w-8 bg-stone-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


