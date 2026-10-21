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
 * Inicializa y genera el documento PDF de la boleta con la fecha y los datos del cliente.
 * 
 * @param {Object} datosCliente - Datos del cliente
 * @param {Date|string} [fecha=new Date()] - Fecha de emisión
 * @returns {jsPDF} Instancia del documento PDF
 */
export const generarBoletaPDF = (datosCliente = {}, fecha = new Date()) => {
  const doc = new jsPDF();
  agregarDatosClienteYFecha(doc, datosCliente, fecha);
  return doc;
};

export const boletaService = {
  generarBoletaPDF,
  agregarDatosClienteYFecha,
};

export default boletaService;
