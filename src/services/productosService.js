const API_URL = 'https://6a472691abfcbaade11804fa.mockapi.io/productos';

export const productosService = {
  // Obtener todos los productos
  async obtenerProductos() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Error al obtener los productos');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en servicio:', error);
      throw error;
    }
  },

  // Obtener productos por categoria
  async obtenerProductosPorCategoria(categoria) {
    try {
      const response = await fetch(`${API_URL}?categoria=${categoria}`);
      if (!response.ok) {
        throw new Error('Error al obtener los productos');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en servicio:', error);
      throw error;
    }
  },

  // Obtener productos en oferta
  async obtenerProductosEnOferta() {
    try {
      const response = await fetch(`${API_URL}?oferta=true`);
      if (!response.ok) {
        throw new Error('Error al obtener los productos');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en servicio:', error);
      throw error;
    }
  }
};


