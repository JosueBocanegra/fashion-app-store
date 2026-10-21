import { jsPDF } from 'jspdf';

/**
 * Agrega la fecha y los datos del cliente al documento PDF de la boleta.
 * 
 * @param {jsPDF} doc - Instancia del documento jsPDF
 * @param {Object} datosCliente - Datos del cliente (nombre, apellido, email, telefono, direccion, dni)
 * @param {Date|string} [fecha=new Date()] - Fecha de emisión de la boleta
 * @returns {number} Posición Y disponible para la siguiente sección
 */
export const agregarDatosClienteYFecha = (doc, datosCliente = {}, fecha = new Date()) => {
  // Configuración de fecha y hora
  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
  const fechaFormateada = fechaObj.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const horaFormateada = fechaObj.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Encabezado principal del comercio
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('FASHION STORE', 105, 18, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('BOLETA DE VENTA ELECTRÓNICA', 105, 25, { align: 'center' });

  // Línea divisoria superior
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(14, 30, 196, 30);

  // Fecha y hora de emisión
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text('Fecha de emisión:', 14, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(`${fechaFormateada}  ${horaFormateada}`, 48, 38);

  // Sección: Datos del Cliente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(147, 51, 234); // purple-600
  doc.text('DATOS DEL CLIENTE', 14, 48);

  // Línea separadora de la sección
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 51, 196, 51);

  // Formato del nombre completo del cliente
  const nombreCompleto = [datosCliente.nombre, datosCliente.apellido]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Cliente general';

  // Detalle de información del cliente
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);

  // Cliente y DNI opcional
  doc.text('Cliente:', 14, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(nombreCompleto, 38, 59);

  if (datosCliente.dni) {
    doc.setFont('helvetica', 'bold');
    doc.text('DNI:', 125, 59);
    doc.setFont('helvetica', 'normal');
    doc.text(String(datosCliente.dni), 136, 59);
  }

  // Email
  doc.setFont('helvetica', 'bold');
  doc.text('Email:', 14, 66);
  doc.setFont('helvetica', 'normal');
  doc.text(datosCliente.email || 'No registrado', 38, 66);

  // Teléfono
  doc.setFont('helvetica', 'bold');
  doc.text('Teléfono:', 14, 73);
  doc.setFont('helvetica', 'normal');
  doc.text(datosCliente.telefono || 'No registrado', 38, 73);

  // Dirección
  doc.setFont('helvetica', 'bold');
  doc.text('Dirección:', 14, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(datosCliente.direccion || 'No registrada', 38, 80);

  // Línea separadora inferior
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 86, 196, 86);

  return 92; // Posición vertical Y disponible para los siguientes bloques (productos, total)
};

/**
 * Agrega el detalle de productos, cantidades y subtotales al documento PDF.
 * 
 * @param {jsPDF} doc - Instancia del documento jsPDF
 * @param {Array<Object>} productos - Lista de productos comprados
 * @param {number} [startY=92] - Posición vertical inicial
 * @returns {number} Posición Y disponible para la siguiente sección (totales)
 */
export const agregarDetalleProductos = (doc, productos = [], startY = 92) => {
  let y = startY;

  // Título de la sección
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(147, 51, 234); // purple-600
  doc.text('DETALLE DE PRODUCTOS', 14, y);
  y += 5;

  // Cabecera de la tabla de productos
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(14, y, 182, 8, 'F');
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(14, y, 182, 8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('CANT.', 18, y + 5.5);
  doc.text('DESCRIPCIÓN', 36, y + 5.5);
  doc.text('P. UNIT.', 148, y + 5.5, { align: 'right' });
  doc.text('SUBTOTAL', 190, y + 5.5, { align: 'right' });

  y += 8;

  // Manejo de lista vacía
  if (!Array.isArray(productos) || productos.length === 0) {
    y += 6;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('No se encontraron productos registrados en esta compra.', 14, y);
    y += 6;
    return y;
  }

  // Filas de productos
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85); // slate-700

  productos.forEach((item, index) => {
    // Si la posición Y sobrepasa el límite inferior de la página, creamos una nueva
    if (y > 240) {
      doc.addPage();
      y = 20;

      // Reimprimir cabecera en la nueva página
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 8, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, y, 182, 8, 'S');
      doc.setFont('helvetica', 'bold');
      doc.text('CANT.', 18, y + 5.5);
      doc.text('DESCRIPCIÓN', 36, y + 5.5);
      doc.text('P. UNIT.', 148, y + 5.5, { align: 'right' });
      doc.text('SUBTOTAL', 190, y + 5.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      y += 8;
    }

    const cantidad = Number(item.cantidad) || 1;
    const precioUnitario = Number(item.precioFinal ?? item.precioUnitario ?? item.precio ?? 0);
    const subtotal = Number(item.subtotal ?? (cantidad * precioUnitario));
    const nombre = item.nombre || item.titulo || item.descripcion || `Producto ${index + 1}`;

    // Fondo alternado suave para mayor legibilidad
    if (index % 2 === 1) {
      doc.setFillColor(249, 250, 251);
      doc.rect(14, y, 182, 7, 'F');
    }

    // Cantidad
    doc.text(String(cantidad), 22, y + 4.8, { align: 'center' });

    // Truncar o ajustar nombre si excede el ancho disponible
    const lineasNombre = doc.splitTextToSize(nombre, 100);
    doc.text(lineasNombre[0], 36, y + 4.8);

    // Precio Unitario
    doc.text(`S/ ${precioUnitario.toFixed(2)}`, 148, y + 4.8, { align: 'right' });

    // Subtotal
    doc.text(`S/ ${subtotal.toFixed(2)}`, 190, y + 4.8, { align: 'right' });

    // Línea divisoria horizontal entre filas
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 7, 196, y + 7);

    y += 7;
  });

  // Línea final de cierre de la tabla
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.line(14, y, 196, y);

  return y + 6; // Posición Y disponible para la siguiente sección
};

/**
 * Agrega el bloque de totales de la compra y el pie de página al documento PDF.
 * 
 * @param {jsPDF} doc - Instancia del documento jsPDF
 * @param {Array<Object>} productos - Lista de productos para calcular el total
 * @param {number|null} [totalManual=null] - Total opcional especificado
 * @param {number} [startY=120] - Posición vertical inicial
 * @returns {number} Posición Y final
 */
export const agregarTotalCompra = (doc, productos = [], totalManual = null, startY = 120) => {
  let y = startY;

  // Si queda poco espacio, añadir página
  if (y > 235) {
    doc.addPage();
    y = 20;
  }

  // Calcular el total a partir de los productos si no se especifica manualmente
  const totalCalculado = Array.isArray(productos)
    ? productos.reduce((acumulado, item) => {
        const cantidad = Number(item.cantidad) || 1;
        const precio = Number(item.precioFinal ?? item.precioUnitario ?? item.precio ?? 0);
        const subtotal = Number(item.subtotal ?? (cantidad * precio));
        return acumulado + subtotal;
      }, 0)
    : 0;

  const totalFinal = totalManual !== null && !isNaN(Number(totalManual))
    ? Number(totalManual)
    : totalCalculado;

  // Bloque resumen alineado a la derecha
  const inicioX = 120;
  const anchoBloque = 76;
  const altoBloque = 22;

  // Recuadro estético para el total
  doc.setFillColor(245, 243, 255); // purple-50
  doc.roundedRect(inicioX, y, anchoBloque, altoBloque, 2, 2, 'F');
  doc.setDrawColor(216, 180, 254); // purple-300
  doc.setLineWidth(0.4);
  doc.roundedRect(inicioX, y, anchoBloque, altoBloque, 2, 2, 'S');

  // Cantidad total de artículos
  const cantidadArticulos = Array.isArray(productos)
    ? productos.reduce((acc, item) => acc + (Number(item.cantidad) || 1), 0)
    : 0;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Artículos (${cantidadArticulos}):`, inicioX + 6, y + 8);
  doc.text(`S/ ${totalFinal.toFixed(2)}`, inicioX + anchoBloque - 6, y + 8, { align: 'right' });

  // Línea divisoria en el bloque
  doc.setDrawColor(233, 213, 255); // purple-200
  doc.line(inicioX + 6, y + 11, inicioX + anchoBloque - 6, y + 11);

  // Total destacado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(109, 40, 217); // purple-700
  doc.text('TOTAL:', inicioX + 6, y + 18);
  doc.text(`S/ ${totalFinal.toFixed(2)}`, inicioX + anchoBloque - 6, y + 18, { align: 'right' });

  y += altoBloque + 18;

  // Mensaje de pie de página
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('¡Gracias por tu compra en Fashion Store!', 105, y, { align: 'center' });
  doc.text('Para cualquier cambio o consulta conserva esta boleta.', 105, y + 5, { align: 'center' });

  return y + 10;
};

/**
 * Genera el documento PDF completo de la boleta de compra.
 * 
 * @param {Object} datosCliente - Datos del cliente
 * @param {Array<Object>} [productos=[]] - Lista de productos
 * @param {Object|number|null} [opcionesOTotal=null] - Total de compra u objeto con opciones
 * @param {Date|string} [fecha=new Date()] - Fecha de emisión
 * @returns {jsPDF} Instancia del documento jsPDF
 */
export const generarBoletaPDF = (
  datosCliente = {},
  productos = [],
  opcionesOTotal = null,
  fecha = new Date()
) => {
  let items = productos;
  let fechaEmision = fecha;
  let totalManual = null;

  // Soporte flexible si fecha se pasó como segundo argumento
  if (!Array.isArray(productos) && (productos instanceof Date || typeof productos === 'string')) {
    fechaEmision = productos;
    items = [];
  }

  // Soporte flexible para total o configuración
  if (typeof opcionesOTotal === 'number') {
    totalManual = opcionesOTotal;
  } else if (opcionesOTotal instanceof Date || typeof opcionesOTotal === 'string') {
    fechaEmision = opcionesOTotal;
  } else if (opcionesOTotal && typeof opcionesOTotal === 'object') {
    if (opcionesOTotal.total !== undefined) totalManual = opcionesOTotal.total;
    if (opcionesOTotal.fecha) fechaEmision = opcionesOTotal.fecha;
  }

  const doc = new jsPDF();
  const yDespuesCliente = agregarDatosClienteYFecha(doc, datosCliente, fechaEmision);
  const yDespuesProductos = agregarDetalleProductos(doc, items, yDespuesCliente);
  agregarTotalCompra(doc, items, totalManual, yDespuesProductos);

  return doc;
};

/**
 * Genera y descarga el documento PDF con el nombre boleta-compra.pdf.
 * 
 * @param {Object} datosCliente - Datos del cliente
 * @param {Array<Object>} [productos=[]] - Lista de productos
 * @param {Object|number|null} [opcionesOTotal=null] - Total o configuración
 * @param {string} [nombreArchivo='boleta-compra.pdf'] - Nombre del archivo a descargar
 * @returns {jsPDF}
 */
export const descargarBoletaPDF = (
  datosCliente = {},
  productos = [],
  opcionesOTotal = null,
  nombreArchivo = 'boleta-compra.pdf'
) => {
  const doc = generarBoletaPDF(datosCliente, productos, opcionesOTotal);
  doc.save(nombreArchivo);
  return doc;
};

export const boletaService = {
  generarBoletaPDF,
  descargarBoletaPDF,
  agregarDatosClienteYFecha,
  agregarDetalleProductos,
  agregarTotalCompra,
};

export default boletaService;
