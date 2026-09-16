const API_URL = "http://localhost:3001/productos";

export const productosService = {
  async obtenerProductos() {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Error al obtener los productos");
    }
    return await response.json();
  },

  async obtenerProductoPorId(id) {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error("Error al obtener el producto");
    }
    return await response.json();
  },

  async crearProducto(producto) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(producto),
    });
    if (!response.ok) {
      throw new Error("Error al crear el producto");
    }
    return await response.json();
  },

  async actualizarProducto(id, producto) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(producto),
    });
    if (!response.ok) {
      throw new Error("Error al actualizar el producto");
    }
    return await response.json();
  },

  async eliminarProducto(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Error al eliminar el producto");
    }
    return true;
  },
};
