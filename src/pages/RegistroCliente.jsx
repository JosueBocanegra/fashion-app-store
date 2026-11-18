import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registrarCliente } from "../services/authClienteService";

function RegistroCliente() {
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    password: "",
    confirmarPassword: "",
  });

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    const nuevoValor =
      name === "telefono" ? value.replace(/\D/g, "").slice(0, 9) : value;

    setFormulario((prev) => ({
      ...prev,
      [name]: nuevoValor,
    }));
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError("");

    const {
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      password,
      confirmarPassword,
    } = formulario;

    if (
      !nombre.trim() ||
      !apellido.trim() ||
      !email.trim() ||
      !password ||
      !confirmarPassword
    ) {
      setError(
        "Nombre, apellido, correo y contraseña son obligatorios."
      );
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(email.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    if (telefono.trim() && !/^9\d{8}$/.test(telefono.trim())) {
      setError("El teléfono debe tener 9 dígitos y empezar con 9.");
      return;
    }

    if (direccion.trim() && direccion.trim().length < 5) {
      setError("La dirección debe tener al menos 5 caracteres.");
      return;
    }

    if (direccion.trim().length > 100) {
      setError("La dirección permite un máximo de 100 caracteres.");
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
        telefono,
        direccion,
        password,
      });

      navigate("/login-cliente", {
        state: {
          mensaje:
            "¡Tu cuenta fue creada correctamente! Ahora puedes iniciar sesión.",
        },
      });
    } catch (err) {
      setError(err.message || "Ocurrió un error al registrar la cuenta.");
    } finally {
      setCargando(false);
    }
  };

  const claseInput =
    "w-full border rounded-lg p-3 focus:ring-2 focus:ring-black outline-none";

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
              className={claseInput}
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
              className={claseInput}
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
              className={claseInput}
              placeholder="ejemplo@correo.com"
              required
            />
          </div>

          {/* Datos de contacto opcionales */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Teléfono{" "}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="tel"
              name="telefono"
              value={formulario.telefono}
              onChange={manejarCambio}
              className={claseInput}
              placeholder="987654321"
              maxLength={9}
            />
            <p className="text-xs text-gray-400 mt-1">
              Debe tener 9 dígitos y empezar con 9.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Dirección{" "}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              name="direccion"
              value={formulario.direccion}
              onChange={manejarCambio}
              className={claseInput}
              placeholder="Av. Principal 123, Chiclayo"
              maxLength={100}
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
              className={claseInput}
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
              className={claseInput}
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
          <Link
            to="/login-cliente"
            className="font-semibold text-black hover:underline"
          >
            Inicia sesión
          </Link>
        </p>

      </div>
    </div>
  );
}

export default RegistroCliente;


