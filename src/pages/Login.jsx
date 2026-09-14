import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:3001/usuarios");
      const usuarios = await res.json();
      const user = usuarios.find(
        (u) => u.email === email && u.password === password
      );
      if (user) {
        localStorage.setItem("adminUser", JSON.stringify(user));
        navigate("/admin/dashboard");
      } else {
        setError("Credenciales incorrectas");
      }
    } catch {
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Fashion Store · Admin
        </h2>

        {error && (
          <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
            {error}
          </p>
        )}

        <label className="block text-sm text-gray-600 mb-1">Correo</label>
        <input type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          className="w-full border border-gray-300 rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500" />

        <label className="block text-sm text-gray-600 mb-1">Contraseña</label>
        <input type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} required
          className="w-full border border-gray-300 rounded p-2 mb-6 focus:outline-none focus:ring-2 focus:ring-pink-500" />

        <button type="submit"
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 rounded transition">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
};

export default Login;

