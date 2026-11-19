const API_URL = "http://localhost:3001/ventas";

export const ventasService = {
  async obtenerVentas() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener ventas");
    return res.json();
  },

  async actualizarEstadoVenta(id, nuevoEstado) {
    const res = await fetch(`${API_URL}/${encodeURIComponent(String(id))}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (!res.ok) throw new Error("Error al actualizar el estado de la venta");
    return res.json();
  },
};



