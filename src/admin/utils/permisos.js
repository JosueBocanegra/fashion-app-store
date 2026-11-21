export const MODULOS_DISPONIBLES = [
  {
    id: "dashboard",
    nombre: "Dashboard",
    descripcion: "Resumen e indicadores de la tienda.",
  },
  {
    id: "productos",
    nombre: "Productos",
    descripcion: "Consulta y gestión del catálogo.",
  },
  {
    id: "clientes",
    nombre: "Clientes",
    descripcion: "Consulta y gestión de clientes.",
  },
  {
    id: "ventas",
    nombre: "Ventas",
    descripcion: "Consulta y gestión de ventas y pedidos.",
  },
  {
    id: "publicidad",
    nombre: "Publicidad",
    descripcion: "Gestión de publicidades y logotipos.",
  },
];

// Obtener la sesión guardada.
export const obtenerUsuarioSesion = () => {
  try {
    const usuario = JSON.parse(
      localStorage.getItem("adminUser") || "null"
    );

    return usuario && typeof usuario === "object"
      ? usuario
      : null;
  } catch {
    return null;
  }
};

// Comprobar si la cuenta es administradora.
export const esAdministrador = (usuario) => {
  return String(usuario?.rol || "").toLowerCase() === "admin";
};

// Mantener únicamente los módulos reconocidos por el sistema.
export const normalizarModulos = (modulos) => {
  const seleccionados = new Set(
    Array.isArray(modulos) ? modulos : []
  );

  return MODULOS_DISPONIBLES
    .filter((modulo) => seleccionados.has(modulo.id))
    .map((modulo) => modulo.id);
};

// Obtener los módulos a los que tiene acceso el usuario.
export const obtenerModulosPermitidos = (usuario) => {
  if (!usuario) return [];

  // El administrador tiene acceso completo.
  if (esAdministrador(usuario)) {
    return MODULOS_DISPONIBLES.map((modulo) => modulo.id);
  }

  return normalizarModulos(usuario.modulos);
};

// Comprobar acceso a un módulo.
export const tieneAccesoModulo = (usuario, moduloId) => {
  if (!usuario) return false;

  if (moduloId === "usuarios") {
    return esAdministrador(usuario);
  }

  return obtenerModulosPermitidos(usuario).includes(moduloId);
};

// Obtener la primera ruta permitida.
export const obtenerRutaInicial = (usuario) => {
  if (!usuario) return "/admin/login";

  const modulos = obtenerModulosPermitidos(usuario);

  if (modulos.length === 0) {
    return "/admin/sin-acceso";
  }

  return `/admin/${modulos[0]}`;
};


