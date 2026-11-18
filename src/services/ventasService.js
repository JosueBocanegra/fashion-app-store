const API_URL = "http://localhost:3001";
const API_VENTAS = `${API_URL}/ventas`;
const API_CLIENTES = `${API_URL}/clientes`;

const redondearMonto = (monto) =>
  Math.round((monto + Number.EPSILON) * 100) / 100;

/**
 * Identifica al cliente que realizará la compra.
 */
async function resolverClienteVenta(cliente, datosCliente) {
  // Si inició sesión, se utiliza su identificador.
  if (cliente?.id) {
    return cliente;
  }

  const email = datosCliente?.email?.trim().toLowerCase();

  if (!email) {
    throw new Error("No se encontró el correo del cliente.");
  }

  const respuestaClientes = await fetch(API_CLIENTES);

  if (!respuestaClientes.ok) {
    throw new Error("No se pudieron consultar los clientes.");
  }

  const clientes = await respuestaClientes.json();

  const clienteExistente = clientes.find(
    (item) => item.email?.trim().toLowerCase() === email
  );

  // No asociar una compra invitada a una cuenta que requiere autenticación.
  if (clienteExistente?.password) {
    throw new Error(
      "Este correo pertenece a una cuenta registrada. Inicia sesión para realizar tu compra."
    );
  }

  // Reutilizar clientes existentes que no tienen una cuenta.
  if (clienteExistente) {
    return clienteExistente;
  }

  // Registrar un nuevo cliente invitado.
  const nuevoCliente = {
    nombre: datosCliente.nombre.trim(),
    apellido: datosCliente.apellido.trim(),
    email,
    telefono: datosCliente.telefono?.trim() || "",
    direccion: datosCliente.direccion?.trim() || "",
    fechaRegistro: new Date().toISOString(),
    esInvitado: true,
  };

  const respuestaNuevoCliente = await fetch(API_CLIENTES, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nuevoCliente),
  });

  if (!respuestaNuevoCliente.ok) {
    throw new Error("No se pudieron registrar los datos del cliente.");
  }

  return await respuestaNuevoCliente.json();
}

/**
 * Registra una compra en db.json.
 */
export async function registrarVenta({
  cliente = null,
  datosCliente = {},
  carrito = [],
}) {
  if (!Array.isArray(carrito) || carrito.length === 0) {
    throw new Error("No hay productos en el carrito.");
  }

  // Preparar los productos de la venta.
  const items = carrito.map((producto) => {
    const productoId = producto.id ?? producto.productoId;
    const cantidad = Number(producto.cantidad);
    const precioUnitario = Number(
      producto.precioFinal ?? producto.precio
    );

    if (
      productoId === undefined ||
      productoId === null ||
      !producto.nombre?.trim() ||
      !Number.isInteger(cantidad) ||
      cantidad <= 0 ||
      !Number.isFinite(precioUnitario) ||
      precioUnitario < 0
    ) {
      throw new Error(
        "Uno de los productos del carrito tiene información inválida."
      );
    }

    const precioRedondeado = redondearMonto(precioUnitario);

    return {
      productoId: String(productoId),
      nombre: producto.nombre,
      cantidad,
      precioUnitario: precioRedondeado,
      subtotal: redondearMonto(cantidad * precioRedondeado),
    };
  });

  // Calcular el total a partir de los productos preparados.
  const total = redondearMonto(
    items.reduce((acumulado, item) => acumulado + item.subtotal, 0)
  );

  // Resolver el cliente.
  const clienteVenta = await resolverClienteVenta(
    cliente,
    datosCliente
  );

  if (!clienteVenta?.id) {
    throw new Error(
      "No se pudo obtener el identificador del cliente."
    );
  }

  // Preparar la venta.
  const nuevaVenta = {
    fecha: new Date().toISOString(),
    clienteId: String(clienteVenta.id),
    items,
    total,
    estado: "Pendiente",
  };

  // Guardar en json-server.
  // El servidor genera automáticamente el ID.
  const respuestaVenta = await fetch(API_VENTAS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nuevaVenta),
  });

  if (!respuestaVenta.ok) {
    throw new Error(
      "No se pudo registrar la compra. Intenta nuevamente."
    );
  }

  return await respuestaVenta.json();
}

/**
 * Consultar ventas registradas.
 */
export async function obtenerVentas() {
  const respuesta = await fetch(API_VENTAS);

  if (!respuesta.ok) {
    throw new Error("No se pudieron obtener las ventas.");
  }

  return await respuesta.json();
}

export const ventasService = {
  registrarVenta,
  obtenerVentas,
};

export default ventasService;


