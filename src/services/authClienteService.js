const API_URL = "http://localhost:3001/clientes";
const CLAVE_SESION = "clienteUser";

// Obtener los clientes registrados
async function obtenerClientes() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los clientes.");
  }

  return await response.json();
}

// Registrar una nueva cuenta o completar un cliente invitado
export async function registrarCliente(datos) {
  const clientes = await obtenerClientes();

  const email = datos.email.trim().toLowerCase();

  const clienteExistente = clientes.find(
    (cliente) => cliente.email?.trim().toLowerCase() === email
  );

  // Si existe una cuenta normal, no permitir duplicados
  if (clienteExistente && !clienteExistente.esInvitado) {
    throw new Error("Este correo ya está registrado.");
  }

  const datosCuenta = {
    nombre: datos.nombre.trim(),
    apellido: datos.apellido.trim(),
    email,
    password: datos.password,
    esInvitado: false,
  };

  // Completar la cuenta de un cliente invitado
  if (clienteExistente) {
    const response = await fetch(
      `${API_URL}/${clienteExistente.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosCuenta),
      }
    );

    if (!response.ok) {
      throw new Error("No se pudo completar el registro del cliente.");
    }

    return await response.json();
  }

  // Registrar un cliente nuevo
  const nuevoCliente = {
    ...datosCuenta,
    fechaRegistro: new Date().toISOString(),
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nuevoCliente),
  });

  if (!response.ok) {
    throw new Error("No se pudo registrar el cliente.");
  }

  return await response.json();
}

// Iniciar sesión
export async function iniciarSesionCliente(email, password) {
  const clientes = await obtenerClientes();

  const cliente = clientes.find(
    (c) =>
      c.email.toLowerCase() === email.trim().toLowerCase() &&
      c.password === password
  );

  if (!cliente) {
    throw new Error("Correo o contraseña incorrectos.");
  }

  const sesion = {
    id: cliente.id,
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    email: cliente.email,
    telefono: cliente.telefono || "",
    direccion: cliente.direccion || "",
  };

  guardarSesionCliente(sesion);

  return sesion;
}

// Guardar sesión sin almacenar la contraseña
export function guardarSesionCliente(cliente) {
  const sesion = {
    id: cliente.id,
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    email: cliente.email,
    telefono: cliente.telefono || "",
    direccion: cliente.direccion || "",
  };

  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

// Obtener sesión actual
export function obtenerSesionCliente() {
  try {
    const sesion = localStorage.getItem(CLAVE_SESION);
    return sesion ? JSON.parse(sesion) : null;
  } catch {
    return null;
  }
}

// Cerrar sesión
export function cerrarSesionCliente() {
  localStorage.removeItem(CLAVE_SESION);
}


