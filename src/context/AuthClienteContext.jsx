
import { createContext, useContext, useState } from "react";
import {
  obtenerSesionCliente,
  iniciarSesionCliente,
  cerrarSesionCliente,
} from "../services/authClienteService";

const AuthClienteContext = createContext();

export function AuthClienteProvider({ children }) {
  const [cliente, setCliente] = useState(() => obtenerSesionCliente());

  const login = async (email, password) => {
    const clienteAutenticado = await iniciarSesionCliente(email, password);
    setCliente(clienteAutenticado);
    return clienteAutenticado;
  };

  const logout = () => {
    cerrarSesionCliente();
    setCliente(null);
  };

  return (
    <AuthClienteContext.Provider
      value={{
        cliente,
        autenticado: !!cliente,
        login,
        logout,
      }}
    >
      {children}
    </AuthClienteContext.Provider>
  );
}

export function useAuthCliente() {
  const context = useContext(AuthClienteContext);

  if (!context) {
    throw new Error(
      "useAuthCliente debe utilizarse dentro de AuthClienteProvider"
    );
  }

  return context;
}
