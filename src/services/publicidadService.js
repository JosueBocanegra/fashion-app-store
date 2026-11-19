const API_PUBLICIDAD = "http://localhost:3001/publicidad";
const API_CONFIGURACION = "http://localhost:3001/configuracion/tienda";

export const publicidadService = {
  async obtenerPublicidad() {
    const response = await fetch(API_PUBLICIDAD);

    if (!response.ok) {
      throw new Error("Error al obtener la publicidad.");
    }

    return await response.json();
  },

  async crearPublicidad(publicidad) {
    const response = await fetch(API_PUBLICIDAD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(publicidad),
    });

    if (!response.ok) {
      throw new Error("Error al crear la publicidad.");
    }

    return await response.json();
  },

  async actualizarPublicidad(id, publicidad) {
    const response = await fetch(
      `${API_PUBLICIDAD}/${encodeURIComponent(String(id))}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(publicidad),
      }
    );

    if (!response.ok) {
      throw new Error("Error al actualizar la publicidad.");
    }

    return await response.json();
  },

  async cambiarEstadoPublicidad(id, estado) {
    const response = await fetch(
      `${API_PUBLICIDAD}/${encodeURIComponent(String(id))}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado }),
      }
    );

    if (!response.ok) {
      throw new Error("No se pudo cambiar el estado de la publicidad.");
    }

    return await response.json();
  },

  async eliminarPublicidad(id) {
    const response = await fetch(
      `${API_PUBLICIDAD}/${encodeURIComponent(String(id))}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Error al eliminar la publicidad.");
    }

    return true;
  },

  async obtenerConfiguracionTienda() {
    const response = await fetch(API_CONFIGURACION);

    if (!response.ok) {
      throw new Error("No se pudo obtener la configuración de la tienda.");
    }

    return await response.json();
  },

  async actualizarLogo(logo) {
    const response = await fetch(API_CONFIGURACION, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ logo }),
    });

    if (!response.ok) {
      throw new Error("No se pudo actualizar el logo.");
    }

    return await response.json();
  },
};


