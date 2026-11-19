// Estados que puede tener un pedido, en el orden en que avanza.
export const ESTADOS_PEDIDO = [
  "Pendiente",
  "En preparación",
  "Enviado",
  "Entregado",
];

// Equivalencias para las ventas guardadas antes de este cambio
// (por ejemplo "completado" o "en proceso").
const EQUIVALENCIAS = {
  pendiente: "Pendiente",
  "en preparacion": "En preparación",
  "en preparación": "En preparación",
  "en proceso": "En preparación",
  procesando: "En preparación",
  enviado: "Enviado",
  entregado: "Entregado",
  completado: "Entregado",
  completada: "Entregado",
};

// Devuelve el estado con el formato oficial.
// Si la venta no tiene estado se considera "Pendiente".
export function normalizarEstadoPedido(estado) {
  const valor = String(estado || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es");

  if (!valor) return "Pendiente";

  return EQUIVALENCIAS[valor] || valor.charAt(0).toUpperCase() + valor.slice(1);
}
