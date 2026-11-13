
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registrarCliente } from "../services/authClienteService";

function RegistroCliente() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmarPassword: "",
  });

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError("");

    const { nombre, apellido, email, password, confirmarPassword } = formulario;

    if (!nombre.trim() || !apellido.trim() || !email.trim() || !password || !confirmarPassword) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(email.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setCargando(true);

      await registrarCliente({
        nombre,
        apellido,
        email,
        password,
      });

      navigate("/login-cliente", {
        state: { mensaje: "¡Tu cuenta fue creada correctamente! Ahora puedes iniciar sesión." },
      });
    } catch (err) {
      setError(err.message || "Ocurrió un error al registrar la cuenta.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Crear cuenta
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Regístrate en Fashion Store
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={manejarRegistro} className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambio}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-black outline-none"
              placeholder="Ingresa tu nombre"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Apellido
            </label>
            <input
              type="text"
              name="apellido"
              value={formulario.apellido}
              onChange={manejarCambio}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-black outline-none"
              placeholder="Ingresa tu apellido"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formulario.email}
              onChange={manejarCambio}
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
              name="password"
              value={formulario.password}
              onChange={manejarCambio}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-black outline-none"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmarPassword"
              value={formulario.confirmarPassword}
              onChange={manejarCambio}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-black outline-none"
              placeholder="Repite tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {cargando ? "Registrando..." : "Crear cuenta"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login-cliente" className="font-semibold text-black hover:underline">
            Inicia sesión
          </Link>
        </p>

      </div>
    </div>
  );
}

export default RegistroCliente;
