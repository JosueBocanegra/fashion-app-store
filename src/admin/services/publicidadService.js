const API_URL = "http://localhost:3001/publicidad";

export const publicidadService = {
  async obtenerPublicidad() {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Error al obtener la publicidad");
    }

    return await response.json();
  },

  async crearPublicidad(publicidad) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(publicidad),
    });

    if (!response.ok) {
      throw new Error("Error al crear la publicidad");
    }

    return await response.json();
  },

  async actualizarPublicidad(id, publicidad) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(publicidad),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar la publicidad");
    }

    return await response.json();
  },

  async eliminarPublicidad(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar la publicidad");
    }

    return true;
  },
};