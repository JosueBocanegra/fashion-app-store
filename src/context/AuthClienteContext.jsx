import { createContext, useContext, useState } from "react";

import {
  obtenerSesionCliente,
  iniciarSesionCliente,
  cerrarSesionCliente,
  actualizarDatosContactoCliente,
  guardarSesionCliente,
} from "../services/authClienteService";

const AuthClienteContext = createContext();

export function AuthClienteProvider({ children }) {
  const [cliente, setCliente] = useState(() => obtenerSesionCliente());

  const login = async (email, password) => {
    const clienteAutenticado = await iniciarSesionCliente(email, password);

    setCliente(clienteAutenticado);

    return clienteAutenticado;
  };

  const actualizarDatosContacto = async (datos) => {
    if (!cliente?.id) {
      throw new Error("No hay un cliente autenticado.");
    }

    // Actualizar los datos en db.json.
    const contactoActualizado = await actualizarDatosContactoCliente(
      cliente.id,
      datos
    );

    // Actualizar también la sesión actual.
    const clienteActualizado = {
      ...cliente,
      telefono: contactoActualizado.telefono,
      direccion: contactoActualizado.direccion,
    };

    guardarSesionCliente(clienteActualizado);
    setCliente(clienteActualizado);

    return clienteActualizado;
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
        actualizarDatosContacto,
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


