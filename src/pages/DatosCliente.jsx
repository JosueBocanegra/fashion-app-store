import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, CheckCircle, ArrowRight, Download, FileText } from 'lucide-react';
import { descargarBoletaPDF } from '../services/boletaService';

// clave donde se guardan los datos para el resumen de compra
const CLAVE_STORAGE = "datosCliente";

const datosVacios = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: ''
};

const DatosCliente = () => {
  const [formData, setFormData] = useState(datosVacios);
  const [errores, setErrores] = useState({});
  const [tocados, setTocados] = useState({});
  const [guardado, setGuardado] = useState(false);

  // si el cliente ya llenó sus datos antes, los cargamos
  useEffect(() => {
    const datosGuardados = sessionStorage.getItem(CLAVE_STORAGE);
    if (datosGuardados) {
      setFormData(JSON.parse(datosGuardados));
      setGuardado(true);
    }
  }, []);

  const validarCampo = (nombreCampo, valor) => {
    switch (nombreCampo) {
      case "nombre":
      case "apellido": {
        const etiqueta = nombreCampo === "nombre" ? "El nombre" : "El apellido";
        if (!valor.trim()) return `${etiqueta} es obligatorio`;
        if (valor.trim().length < 2) return "Debe tener al menos 2 caracteres";
        if (valor.trim().length > 50) return "Máximo 50 caracteres";
        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor)) return "Solo se permiten letras";
        return "";
      }

      case "email":
        if (!valor.trim()) return "El correo es obligatorio";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return "Formato inválido (ej. usuario@dominio.com)";
        return "";

      case "telefono":
        if (!valor.trim()) return "El teléfono es obligatorio";
        if (!/^9\d{8}$/.test(valor)) return "Debe tener 9 dígitos y empezar con 9";
        return "";

      case "direccion":
        if (!valor.trim()) return "La dirección es obligatoria";
        if (valor.trim().length < 5) return "Debe tener al menos 5 caracteres";
        if (valor.trim().length > 100) return "Máximo 100 caracteres";
        return "";

      default:
        return "";
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    Object.keys(datosVacios).forEach(campo => {
      const error = validarCampo(campo, formData[campo]);
      if (error) {
        nuevosErrores[campo] = error;
      }
    });

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nuevoValor = value;

    // nombre y apellido solo letras
    if (name === "nombre" || name === "apellido") {
      nuevoValor = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
    }

    // teléfono solo números
    if (name === "telefono") {
      nuevoValor = value.replace(/\D/g, "");
    }

    setFormData(prev => ({
      ...prev,
      [name]: nuevoValor
    }));

    setGuardado(false);

    if (tocados[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: validarCampo(name, nuevoValor)
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTocados(prev => ({
      ...prev,
      [name]: true
    }));

    setErrores(prev => ({
      ...prev,
      [name]: validarCampo(name, value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setTocados({
      nombre: true,
      apellido: true,
      email: true,
      telefono: true,
      direccion: true
    });

    if (validarFormulario()) {
      const datosLimpios = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim()
      };

      // se guarda temporalmente para el resumen de compra
      sessionStorage.setItem(CLAVE_STORAGE, JSON.stringify(datosLimpios));
      setGuardado(true);
    }
  };

  const limpiarFormulario = () => {
    sessionStorage.removeItem(CLAVE_STORAGE);
    setFormData(datosVacios);
    setErrores({});
    setTocados({});
    setGuardado(false);
  };

  const obtenerProductosCompra = () => {
    try {
      const guardados = sessionStorage.getItem('carrito') || localStorage.getItem('carrito');
      if (guardados) {
        const parsed = JSON.parse(guardados);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    // Productos de ejemplo para la compra si aún no se inicializó el carrito
    return [
      { id: '1', nombre: 'Casaca de cuero', cantidad: 1, precioUnitario: 50, subtotal: 50 },
      { id: '3', nombre: 'Shorts casual', cantidad: 2, precioUnitario: 20, subtotal: 40 }
    ];
  };

  const handleDescargarBoleta = () => {
    const productos = obtenerProductosCompra();
    descargarBoletaPDF(formData, productos, null, 'boleta-compra.pdf');
  };

  const obtenerClaseInput = (campo) => {
    if (!tocados[campo]) return "border-slate-200";
    if (errores[campo]) return "border-red-400 focus:ring-red-500";
    return "border-green-500 focus:ring-green-500";
  };

  const hayCamposVacios = Object.keys(datosVacios).some(campo => !formData[campo].trim());

  const esBotonDeshabilitado =
    hayCamposVacios ||
    Object.values(errores).some(error => error);

  const productosCompra = obtenerProductosCompra();
  const totalCompra = productosCompra.reduce((acc, it) => {
    const cant = Number(it.cantidad) || 1;
    const precio = Number(it.precioUnitario ?? it.precio ?? 0);
    return acc + Number(it.subtotal ?? (cant * precio));
  }, 0);

  // lista de campos para no repetir el mismo input 5 veces
  const campos = [
    { name: "nombre", label: "Nombre", icono: User, tipo: "text", placeholder: "Tu nombre", max: 50 },
    { name: "apellido", label: "Apellido", icono: User, tipo: "text", placeholder: "Tu apellido", max: 50 },
    { name: "email", label: "Correo", icono: Mail, tipo: "email", placeholder: "usuario@dominio.com", max: 80 },
    { name: "telefono", label: "Teléfono", icono: Phone, tipo: "tel", placeholder: "987654321", max: 9 },
    { name: "direccion", label: "Dirección", icono: MapPin, tipo: "text", placeholder: "Av. Principal 123, Chiclayo", max: 100 }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Datos del Cliente
          </h1>
          <p className="text-slate-500 mt-2">Completa tus datos para finalizar la compra</p>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">

          {guardado && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  ¡Datos registrados correctamente!
                </div>
                <p className="text-sm mt-1">
                  {formData.nombre} {formData.apellido}, tus datos se usarán en el resumen de compra.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDescargarBoleta}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition-all duration-300 hover:scale-105 cursor-pointer text-sm whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Descargar resumen en PDF
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              {campos.map(({ name, label, icono: Icono, tipo, placeholder, max }) => (
                <div
                  key={name}
                  className={`mb-4 ${name === "email" || name === "direccion" ? "md:col-span-2" : ""}`}
                >
                  <label htmlFor={name} className="block text-slate-700 font-medium mb-2 text-sm">
                    <Icono className="w-4 h-4 inline mr-1" />
                    {label}: <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={name}
                    type={tipo}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={max}
                    placeholder={placeholder}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition ${obtenerClaseInput(name)}`}
                  />
                  {tocados[name] && errores[name] && (
                    <p className="text-red-500 text-sm mt-1">{errores[name]}</p>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 mb-6">
              <span className="text-red-500">*</span> Todos los campos son obligatorios
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={limpiarFormulario}
                className="sm:w-1/4 py-3 rounded-xl font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Limpiar
              </button>

              <button
                type="submit"
                disabled={esBotonDeshabilitado}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                  esBotonDeshabilitado
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-[1.02] shadow-purple-500/25 cursor-pointer"
                }`}
              >
                Confirmar datos
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleDescargarBoleta}
                disabled={esBotonDeshabilitado}
                className={`py-3 px-5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 border shadow-sm ${
                  esBotonDeshabilitado
                    ? "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                    : "border-purple-600 text-purple-600 hover:bg-purple-50 hover:scale-[1.02] cursor-pointer"
                }`}
                title="Descargar comprobante de compra en formato PDF"
              >
                <Download className="w-5 h-5" />
                Descargar resumen en PDF
              </button>
            </div>
          </form>

          {/* Sección de Resumen de Compra visible una vez confirmados los datos */}
          {guardado && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 mb-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Resumen de Compra
                  </div>
                  <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2.5 py-1 rounded-full">
                    {productosCompra.length} artículos
                  </span>
                </div>

                <div className="divide-y divide-slate-200/70">
                  {productosCompra.map((item, idx) => {
                    const cant = Number(item.cantidad) || 1;
                    const precio = Number(item.precioUnitario ?? item.precio ?? 0);
                    const sub = Number(item.subtotal ?? (cant * precio));
                    return (
                      <div key={item.id || idx} className="py-2.5 flex justify-between items-center text-sm">
                        <div className="text-slate-700">
                          <span className="font-medium">{item.nombre}</span>
                          <span className="text-slate-400 text-xs ml-2">x{cant}</span>
                        </div>
                        <span className="font-semibold text-slate-800">S/ {sub.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Total de la compra:</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    S/ {totalCompra.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDescargarBoleta}
                className="w-full py-3.5 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-[1.01] shadow-purple-500/25 cursor-pointer text-base"
              >
                <Download className="w-5 h-5" />
                Descargar resumen en PDF
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DatosCliente;
