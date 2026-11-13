import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthCliente } from "../context/AuthClienteContext";

function LoginCliente() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthCliente();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const mensaje = location.state?.mensaje;

  const manejarInicioSesion = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    try {
      setCargando(true);

      await login(email, password);

      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Iniciar sesión
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Bienvenido a Fashion Store
        </p>

        {mensaje && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={manejarInicioSesion} className="space-y-5">

          <div>
            <label className="block text-sm font-medium mb-1">
              Correo electrónico
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-black outline-none"
              placeholder="ejemplo@correo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-black outline-none"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿Todavía no tienes una cuenta?{" "}
          <Link
            to="/registro-cliente"
            className="font-semibold text-black hover:underline"
          >
            Regístrate aquí
          </Link>
        </p>

      </div>
    </div>
  );
}

export default LoginCliente;
