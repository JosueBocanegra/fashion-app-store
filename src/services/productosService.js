const LOCAL_API_URL = 'http://localhost:3001/productos';
const MOCK_API_URL = 'https://6a472691abfcbaade11804fa.mockapi.io/productos';

async function fetchProductos(query = '') {
  try {
    const localRes = await fetch(`${LOCAL_API_URL}${query}`);
    if (localRes.ok) {
      return await localRes.json();
    }
  } catch {
    // Si json-server local no está activo, intenta con MockAPI como respaldo
  }

  try {
    const mockRes = await fetch(`${MOCK_API_URL}${query}`);
    if (mockRes.ok) {
      return await mockRes.json();
    }
  } catch (error) {
    console.error('Error al conectar con la API de productos:', error);
  }

  return [];
}

export const productosService = {
  // Obtener todos los productos
  async obtenerProductos() {
    return await fetchProductos();
  },

  // Obtener productos por categoria
  async obtenerProductosPorCategoria(categoria) {
    return await fetchProductos(`?categoria=${encodeURIComponent(categoria)}`);
  },

  // Obtener productos en oferta
  async obtenerProductosEnOferta() {
    return await fetchProductos('?oferta=true');
  },
};
