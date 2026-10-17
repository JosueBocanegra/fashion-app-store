const API_URL = "http://localhost:3001/ventas";

export const ventasService = {
  async obtenerVentas() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener ventas");
    return res.json();
  },
};


