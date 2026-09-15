const API_URL = "http://localhost:3001/usuarios";

export const usuariosService = {
  async obtenerUsuarios() {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Error al obtener los usuarios");
    }

    return await response.json();
  },

  async crearUsuario(usuario) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(usuario),
    });

    if (!response.ok) {
      throw new Error("Error al crear el usuario");
    }

    return await response.json();
  },

  async actualizarUsuario(id, usuario) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(usuario),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar el usuario");
    }

    return await response.json();
  },

  async eliminarUsuario(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar el usuario");
    }

    return true;
  },
};