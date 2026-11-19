const API_VENTAS = "http://localhost:3001/ventas";

// Estados permitidos según los requisitos del Issue #13
export const ESTADOS_PEDIDO = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
};

/**
 * Normaliza los diferentes nombres o formatos de estado
 * al estándar de 4 estados del requerimiento.
 */
export function normalizarEstadoPedido(estado) {
  const str = String(estado || "").trim().toLowerCase();
  if (str.includes("prep") || str.includes("proceso")) {
    return ESTADOS_PEDIDO.EN_PREPARACION;
  }
  if (str.includes("envi")) {
    return ESTADOS_PEDIDO.ENVIADO;
  }
  if (str.includes("entreg") || str.includes("complet")) {
    return ESTADOS_PEDIDO.ENTREGADO;
  }
  return ESTADOS_PEDIDO.PENDIENTE;
}

/**
 * Consulta las ventas asociadas al identificador del cliente en sesión.
 * Obtiene la información actualizada directamente desde la colección ventas.
 */
export async function obtenerPedidosCliente(clienteId) {
  if (!clienteId) return [];

  try {
    const respuesta = await fetch(
      `${API_VENTAS}?clienteId=${encodeURIComponent(String(clienteId))}`
    );

    let ventas = [];
    if (respuesta.ok) {
      ventas = await respuesta.json();
    } else {
      // Fallback: consultar todas y filtrar en memoria
      const resTodas = await fetch(API_VENTAS);
      const todas = await resTodas.json();
      ventas = todas.filter((v) => String(v.clienteId) === String(clienteId));
    }

    // Normalizar estados y ordenar del más reciente al más antiguo
    return ventas
      .map((venta) => ({
        ...venta,
        estado: normalizarEstadoPedido(venta.estado),
      }))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  } catch (error) {
    console.error("Error al obtener pedidos del cliente:", error);
    throw new Error("No se pudieron cargar tus pedidos. Intenta más tarde.");
  }
}

/**
 * Consulta los datos y desglose completo de un pedido específico por ID.
 */
export async function obtenerDetallePedido(pedidoId) {
  const res = await fetch(`${API_VENTAS}/${encodeURIComponent(String(pedidoId))}`);
  if (!res.ok) {
    throw new Error("No se pudo obtener el detalle del pedido.");
  }
  const pedido = await res.json();
  return {
    ...pedido,
    estado: normalizarEstadoPedido(pedido.estado),
  };
}

export const pedidosService = {
  obtenerPedidosCliente,
  obtenerDetallePedido,
  ESTADOS_PEDIDO,
  normalizarEstadoPedido,
};

export default pedidosService;
