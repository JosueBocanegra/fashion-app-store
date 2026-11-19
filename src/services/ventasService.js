const API_URL = "http://localhost:3001";
const API_VENTAS = `${API_URL}/ventas`;
const API_CLIENTES = `${API_URL}/clientes`;
const API_PRODUCTOS = `${API_URL}/productos`;

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

  // Reutilizar y actualizar los datos de un cliente
  // existente que no tiene una cuenta registrada.
  if (clienteExistente) {
    const contactoActualizado = {
      telefono:
        datosCliente.telefono?.trim() ||
        clienteExistente.telefono ||
        "",

      direccion:
        datosCliente.direccion?.trim() ||
        clienteExistente.direccion ||
        "",
    };

    const huboCambios =
      contactoActualizado.telefono !== (clienteExistente.telefono || "") ||
      contactoActualizado.direccion !== (clienteExistente.direccion || "");

    if (!huboCambios) {
      return clienteExistente;
    }

    const respuestaActualizacion = await fetch(
      `${API_CLIENTES}/${clienteExistente.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactoActualizado),
      }
    );

    if (!respuestaActualizacion.ok) {
      throw new Error("No se pudieron actualizar los datos del cliente.");
    }

    return await respuestaActualizacion.json();
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
 * Verifica que exista stock suficiente para todos los productos.
 */
async function verificarStockDisponible(items) {
  const respuesta = await fetch(API_PRODUCTOS);

  if (!respuesta.ok) {
    throw new Error("No se pudo consultar el inventario.");
  }

  const productos = await respuesta.json();

  // Agrupar las cantidades por producto para evitar
  // descontar incorrectamente si un producto aparece varias veces.
  const cantidadesSolicitadas = new Map();

  items.forEach((item) => {
    const cantidadActual =
      cantidadesSolicitadas.get(item.productoId) || 0;

    cantidadesSolicitadas.set(
      item.productoId,
      cantidadActual + item.cantidad
    );
  });

  const inventario = [];

  for (const [productoId, cantidad] of cantidadesSolicitadas) {
    const producto = productos.find(
      (p) => String(p.id) === productoId
    );

    if (!producto) {
      throw new Error(
        "Uno de los productos ya no está disponible."
      );
    }

    const stockActual = Number(producto.stock);

    if (!Number.isInteger(stockActual) || stockActual < 0) {
      throw new Error(
        `El stock de ${producto.nombre} no es válido.`
      );
    }

    if (stockActual < cantidad) {
      throw new Error(
        `Stock insuficiente para ${producto.nombre}. Solo quedan ${stockActual} unidades disponibles.`
      );
    }

    inventario.push({
      id: String(producto.id),
      nombre: producto.nombre,
      stockAnterior: stockActual,
      stockNuevo: stockActual - cantidad,
    });
  }

  return inventario;
}

/**
 * Restaura el inventario si la compra no se completa.
 */
async function restaurarStock(productosActualizados) {
  let restauracionCompleta = true;

  // Restaurar en orden inverso al de actualización.
  for (const producto of [...productosActualizados].reverse()) {
    try {
      const respuesta = await fetch(
        `${API_PRODUCTOS}/${producto.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stock: producto.stockAnterior,
          }),
        }
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo restaurar el stock.");
      }
    } catch (error) {
      console.error(
        `Error al restaurar el stock de ${producto.nombre}:`,
        error
      );

      restauracionCompleta = false;
    }
  }

  return restauracionCompleta;
}

/**
 * Registra una compra y actualiza automáticamente el inventario.
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

  // Verificar que exista stock suficiente antes de continuar.
  const inventario = await verificarStockDisponible(items);

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

  // Guardar los productos cuyo stock se actualizó correctamente.
  const productosActualizados = [];

  try {
    // Descontar las unidades compradas del inventario.
    for (const producto of inventario) {
      const respuestaStock = await fetch(
        `${API_PRODUCTOS}/${producto.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stock: producto.stockNuevo,
          }),
        }
      );

      if (!respuestaStock.ok) {
        throw new Error(
          `No se pudo actualizar el stock de ${producto.nombre}.`
        );
      }

      productosActualizados.push(producto);
    }

    // Registrar la venta después de actualizar el inventario.
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

    const ventaRegistrada = await respuestaVenta.json();

    if (!ventaRegistrada?.id) {
      throw new Error(
        "No se pudo confirmar el registro de la compra."
      );
    }

    // Devolver la venta registrada.
    return ventaRegistrada;

  } catch (error) {
    // Si ocurre un error, intentar restaurar el stock anterior.
    const restaurado = await restaurarStock(productosActualizados);

    if (!restaurado) {
      throw new Error(
        `${error.message} Además, no se pudo restaurar todo el inventario. Es necesario revisar db.json.`
      );
    }

    throw error;
  }
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
