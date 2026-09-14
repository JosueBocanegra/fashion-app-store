import { useState } from 'react';
import { Mail, User, MessageSquare, Send, MapPin, Phone } from 'lucide-react';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });
  const [errores, setErrores] = useState({});
  const [tocados, setTocados] = useState({});
  const [enviado, setEnviado] = useState(false);

  const validarCampo = (nombreCampo, valor) => {
    switch (nombreCampo) {
      case "nombre":
        if (!valor.trim()) return "El nombre es obligatorio";
        if (valor.trim().length < 3) return "Debe tener al menos 3 caracteres";
        if (valor.trim().length > 50) return "Máximo 50 caracteres";
        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor)) return "Solo se permiten letras";
        return "";

      case "email":
        if (!valor.trim()) return "El correo es obligatorio";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return "Ingrese un correo válido";
        return "";

      case "mensaje":
        if (!valor.trim()) return "El mensaje es obligatorio";
        if (valor.trim().length < 10) return "Debe contener al menos 10 caracteres";
        if (valor.trim().length > 500) return "Máximo 500 caracteres";
        return "";

      default:
        return "";
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {
      nombre: validarCampo("nombre", formData.nombre),
      email: validarCampo("email", formData.email),
      mensaje: validarCampo("mensaje", formData.mensaje)
    };

    Object.keys(nuevosErrores).forEach(key => {
      if (!nuevosErrores[key]) {
        delete nuevosErrores[key];
      }
    });

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nuevoValor = value;

    if (name === "nombre") {
      nuevoValor = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
    }

    setFormData(prev => ({
      ...prev,
      [name]: nuevoValor
    }));

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
      email: true,
      mensaje: true
    });

    if (validarFormulario()) {
      console.log("Formulario enviado:", formData);
      setEnviado(true);
      
      setFormData({ nombre: "", email: "", mensaje: "" });
      setTocados({});

      setTimeout(() => {
        setEnviado(false);
      }, 5000);
    }
  };

  const obtenerClaseInput = (campo) => {
    if (!tocados[campo]) return "border-slate-200";
    if (errores[campo]) return "border-red-400 focus:ring-red-500";
    return "border-green-500 focus:ring-green-500";
  };

  const esBotonDeshabilitado = 
    !formData.nombre.trim() ||
    !formData.email.trim() ||
    !formData.mensaje.trim() ||
    Object.values(errores).some(error => error);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Encabezado */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Contacto
          </h1>
          <p className="text-slate-500 mt-2">¿Tienes alguna pregunta? Escríbenos</p>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Información de contacto */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4">Información</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="p-2 bg-purple-50 rounded-xl">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm">info@fashionstore.com</span>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <div className="p-2 bg-purple-50 rounded-xl">
                    <Phone className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm">+51 999 999 999</span>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <div className="p-2 bg-purple-50 rounded-xl">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm">Av. Principal 123, Lima</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white text-center">
              <h4 className="font-bold">Horario de Atención</h4>
              <p className="text-white/80 text-sm mt-1">Lunes a Viernes</p>
              <p className="text-white/80 text-sm">9:00 AM - 6:00 PM</p>
            </div>
          </div>

          {/* Columna Derecha: Formulario */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
              
              {enviado && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                  ¡Mensaje enviado correctamente!
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Input: Nombre */}
                <div className="mb-4">
                  <label className="block text-slate-700 font-medium mb-2 text-sm">
                    <User className="w-4 h-4 inline mr-1" />
                    Nombre:
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={50}
                    placeholder="Tu nombre"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition ${obtenerClaseInput("nombre")}`}
                  />
                  {tocados.nombre && errores.nombre && (
                    <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>
                  )}
                </div>

                {/* Input: Email */}
                <div className="mb-4">
                  <label className="block text-slate-700 font-medium mb-2 text-sm">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email:
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="tu@email.com"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition ${obtenerClaseInput("email")}`}
                  />
                  {tocados.email && errores.email && (
                    <p className="text-red-500 text-sm mt-1">{errores.email}</p>
                  )}
                </div>

                {/* Input: Mensaje */}
                <div className="mb-6">
                  <label className="block text-slate-700 font-medium mb-2 text-sm">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Mensaje:
                  </label>
                  <textarea
                    name="mensaje"
                    rows="4"
                    maxLength={500}
                    value={formData.mensaje}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Escribe tu mensaje aquí..."
                    className={`w-full px-4 py-2.5 border rounded-xl resize-none focus:outline-none focus:ring-2 transition ${obtenerClaseInput("mensaje")}`}
                  />
                  <div className="flex justify-between mt-1">
                    <div>
                      {tocados.mensaje && errores.mensaje && (
                        <p className="text-red-500 text-sm">{errores.mensaje}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {formData.mensaje.length}/500
                    </span>
                  </div>
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={esBotonDeshabilitado}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                    esBotonDeshabilitado
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-[1.02] shadow-purple-500/25 cursor-pointer"
                  }`}
                >
                  <Send className="w-5 h-5" />
                  Enviar Mensaje
                </button>
              </form>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contacto;


