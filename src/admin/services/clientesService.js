const API_URL = 'http://localhost:3001/clientes';

export const clientesService = {
  async obtenerClientes() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener los clientes');
    return await response.json();
  },

  async crearCliente(cliente) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente),
    });
    if (!response.ok) throw new Error('Error al crear el cliente');
    return await response.json();
  },

  async actualizarCliente(id, cliente) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente),
    });
    if (!response.ok) throw new Error('Error al actualizar el cliente');
    return await response.json();
  },

  async eliminarCliente(id) {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error al eliminar el cliente');
    return true;
  },
};