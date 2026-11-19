import { ESTADOS_PEDIDO } from "../../services/estadosPedido";

const API_URL = "http://localhost:3001/ventas";

export const ventasService = {
  async obtenerVentas() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener ventas");
    return res.json();
  },

  // Cambia el estado de un pedido y lo guarda en db.json.
  async actualizarEstado(id, estado) {
    if (!ESTADOS_PEDIDO.includes(estado)) {
      throw new Error("Estado de pedido no válido");
    }

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });

    if (!res.ok) throw new Error("Error al actualizar el estado del pedido");
    return res.json();
  },
};
