import { useState } from 'react';
import { Mail, User, MessageSquare, Send, MapPin, Phone } from 'lucide-react';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'Email inválido';
    }
    
    if (!formData.mensaje.trim()) {
      nuevosErrores.mensaje = 'El mensaje es obligatorio';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      console.log('Formulario enviado:', formData);
      setEnviado(true);
      setFormData({ nombre: '', email: '', mensaje: '' });
      setTimeout(() => setEnviado(false), 5000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Título */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Contacto
          </h1>
          <p className="text-slate-500 mt-2">¿Tienes alguna pregunta? Escríbenos</p>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Información de contacto */}
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

          {/* Formulario */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
              {enviado && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                  <span>✅</span>
                  ¡Mensaje enviado con éxito!
                </div>
              )}

              <form onSubmit={handleSubmit}>
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
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                      errores.nombre ? 'border-red-400' : 'border-slate-200'
                    }`}
                    placeholder="Tu nombre"
                  />
                  {errores.nombre && (
                    <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>
                  )}
                </div>

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
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                      errores.email ? 'border-red-400' : 'border-slate-200'
                    }`}
                    placeholder="tu@email.com"
                  />
                  {errores.email && (
                    <p className="text-red-500 text-sm mt-1">{errores.email}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-slate-700 font-medium mb-2 text-sm">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Mensaje:
                  </label>
                  <textarea
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    rows="4"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none ${
                      errores.mensaje ? 'border-red-400' : 'border-slate-200'
                    }`}
                    placeholder="Escribe tu mensaje aquí..."
                  />
                  {errores.mensaje && (
                    <p className="text-red-500 text-sm mt-1">{errores.mensaje}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer"
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


