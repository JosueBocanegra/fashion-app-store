import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  ArrowRight,
  Download,
  FileText,
  ShoppingBag,
  ShieldCheck,
  LoaderCircle,
  Clock,
} from "lucide-react";

import { useCarrito } from "../context/CarritoContext";
import { useAuthCliente } from "../context/AuthClienteContext";
import { registrarVenta } from "../services/ventasService";
import { descargarBoletaPDF } from "../services/boletaService";

// Claves para conservar temporalmente los datos del proceso de compra.
const CLAVE_STORAGE = "datosCliente";
const CLAVE_COMPRA_FINALIZADA = "compraFinalizada";

const datosVacios = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  direccion: "",
};

// Recuperar datos del formulario si el cliente vuelve a esta pantalla.
const obtenerDatosGuardados = () => {
  try {
    const datos = sessionStorage.getItem(CLAVE_STORAGE);
    return datos ? JSON.parse(datos) : null;
  } catch {
    return null;
  }
};

// Recuperar el comprobante de la última compra de esta sesión.
const obtenerCompraFinalizada = () => {
  try {
    const carritoGuardado = JSON.parse(
      localStorage.getItem("carrito") || "[]"
    );

    // Si existe un carrito nuevo, se descarta el comprobante anterior.
    if (Array.isArray(carritoGuardado) && carritoGuardado.length > 0) {
      sessionStorage.removeItem(CLAVE_COMPRA_FINALIZADA);
      return null;
    }

    const compra = sessionStorage.getItem(CLAVE_COMPRA_FINALIZADA);
    return compra ? JSON.parse(compra) : null;
  } catch {
    return null;
  }
};

const DatosCliente = () => {
  const { cliente } = useAuthCliente();

  const {
    carrito,
    vaciarCarrito,
    totalCarrito,
  } = useCarrito();

  const esClienteAutenticado = Boolean(cliente?.id);

  const [formData, setFormData] = useState(() => ({
    ...datosVacios,
    ...(cliente || {}),
  }));

  const [errores, setErrores] = useState({});
  const [tocados, setTocados] = useState({});
  const [datosConfirmados, setDatosConfirmados] = useState(false);

  const [guardando, setGuardando] = useState(false);
  const [errorCompra, setErrorCompra] = useState("");

  const [compraFinalizada, setCompraFinalizada] = useState(
    obtenerCompraFinalizada
  );

  // Cargar datos del cliente invitado o utilizar la sesión existente.
  useEffect(() => {
    if (esClienteAutenticado) {
      sessionStorage.removeItem(CLAVE_STORAGE);

      setFormData({
        ...datosVacios,
        ...cliente,
      });

      setDatosConfirmados(true);
      return;
    }

    const datosGuardados = obtenerDatosGuardados();

    if (datosGuardados) {
      setFormData({
        ...datosVacios,
        ...datosGuardados,
      });

      setDatosConfirmados(true);
    } else {
      setDatosConfirmados(false);
    }
  }, [cliente?.id]);

  // ----------------------------------------
  // VALIDACIÓN DEL FORMULARIO
  // ----------------------------------------

  const validarCampo = (nombreCampo, valor) => {
    switch (nombreCampo) {
      case "nombre":
      case "apellido": {
        const etiqueta =
          nombreCampo === "nombre" ? "El nombre" : "El apellido";

        if (!valor.trim()) {
          return `${etiqueta} es obligatorio`;
        }

        if (valor.trim().length < 2) {
          return "Debe tener al menos 2 caracteres";
        }

        if (valor.trim().length > 50) {
          return "Máximo 50 caracteres";
        }

        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor)) {
          return "Solo se permiten letras";
        }

        return "";
      }

      case "email":
        if (!valor.trim()) {
          return "El correo es obligatorio";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
          return "Formato inválido (ej. usuario@dominio.com)";
        }

        return "";

      case "telefono":
        if (!valor.trim()) return "";

        if (!/^9\d{8}$/.test(valor)) {
          return "Debe tener 9 dígitos y empezar con 9";
        }

        return "";

      case "direccion":
        if (!valor.trim()) return "";

        if (valor.trim().length < 5) {
          return "Debe tener al menos 5 caracteres";
        }

        if (valor.trim().length > 100) {
          return "Máximo 100 caracteres";
        }

        return "";

      default:
        return "";
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    Object.keys(datosVacios).forEach((campo) => {
      const error = validarCampo(campo, formData[campo]);

      if (error) {
        nuevosErrores[campo] = error;
      }
    });

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  // ----------------------------------------
  // MANEJO DEL FORMULARIO
  // ----------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nuevoValor = value;

    // Nombre y apellido: únicamente letras.
    if (name === "nombre" || name === "apellido") {
      nuevoValor = value.replace(
        /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
        ""
      );
    }

    // Teléfono: únicamente números.
    if (name === "telefono") {
      nuevoValor = value.replace(/\D/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nuevoValor,
    }));

    // Si modifica un dato, deberá volver a confirmarlo.
    setDatosConfirmados(false);
    setErrorCompra("");

    sessionStorage.removeItem(CLAVE_STORAGE);

    if (tocados[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: validarCampo(name, nuevoValor),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTocados((prev) => ({
      ...prev,
      [name]: true,
    }));

    setErrores((prev) => ({
      ...prev,
      [name]: validarCampo(name, value),
    }));
  };

  // Confirmar únicamente los datos personales.
  // Todavía no se registra una venta ni se genera el PDF.
  const handleConfirmarDatos = (e) => {
    e.preventDefault();

    setTocados({
      nombre: true,
      apellido: true,
      email: true,
      telefono: true,
      direccion: true,
    });

    if (!validarFormulario()) {
      return;
    }

    const datosLimpios = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      email: formData.email.trim(),
      telefono: formData.telefono.trim(),
      direccion: formData.direccion.trim(),
    };

    sessionStorage.setItem(
      CLAVE_STORAGE,
      JSON.stringify(datosLimpios)
    );

    setFormData(datosLimpios);
    setDatosConfirmados(true);
    setErrorCompra("");
  };

  const limpiarFormulario = () => {
    sessionStorage.removeItem(CLAVE_STORAGE);

    setFormData(datosVacios);
    setErrores({});
    setTocados({});
    setDatosConfirmados(false);
    setErrorCompra("");
  };

  // ----------------------------------------
  // REGISTRO DE LA COMPRA
  // ----------------------------------------

  const handleConfirmarCompra = async () => {
    if (guardando || compraFinalizada) {
      return;
    }

    if (!carrito.length) {
      setErrorCompra("No hay productos en el carrito.");
      return;
    }

    if (!esClienteAutenticado && !datosConfirmados) {
      setErrorCompra("Primero debes confirmar tus datos personales.");
      return;
    }

    setGuardando(true);
    setErrorCompra("");

    // Datos del cliente que aparecerán en el comprobante.
    const datosClienteCompra = esClienteAutenticado
      ? {
          nombre: cliente.nombre || "",
          apellido: cliente.apellido || "",
          email: cliente.email || "",
          telefono: cliente.telefono || "",
          direccion: cliente.direccion || "",
        }
      : { ...formData };

    try {
      // Registrar la venta en json-server.
      const venta = await registrarVenta({
        cliente: esClienteAutenticado ? cliente : null,
        datosCliente: datosClienteCompra,
        carrito: [...carrito],
      });

      // Verificar que el servidor haya devuelto una venta registrada.
      if (!venta?.id) {
        throw new Error(
          "El servidor no confirmó el registro de la compra."
        );
      }

      // Preparar los productos que utilizará el PDF.
      const productosBoleta = (
        venta.items?.length ? venta.items : carrito
      ).map((item) => ({
        id: item.productoId ?? item.id,
        nombre: item.nombre,
        cantidad: Number(item.cantidad),
        precioFinal: Number(
          item.precioUnitario ?? item.precioFinal ?? item.precio
        ),
        subtotal: Number(
          item.subtotal ??
            item.cantidad *
              (item.precioUnitario ?? item.precioFinal ?? item.precio)
        ),
      }));

      // Conservar los datos de la compra confirmada.
      const compra = {
        venta,
        datosCliente: datosClienteCompra,
        productos: productosBoleta,
      };

      sessionStorage.setItem(
        CLAVE_COMPRA_FINALIZADA,
        JSON.stringify(compra)
      );

      setCompraFinalizada(compra);

      // Limpiar datos temporales del formulario.
      sessionStorage.removeItem(CLAVE_STORAGE);

      // Vaciar el carrito únicamente después del registro exitoso.
      vaciarCarrito();

    } catch (error) {
      setErrorCompra(
        error.message || "Ocurrió un error al procesar la compra."
      );
    } finally {
      setGuardando(false);
    }
  };

  // ----------------------------------------
  // DESCARGAR PDF
  // ----------------------------------------

  const handleDescargarBoleta = () => {
    if (!compraFinalizada?.venta) {
      return;
    }

    const { venta, datosCliente, productos } = compraFinalizada;

    descargarBoletaPDF(
      datosCliente,
      productos,
      {
        total: venta.total,
        fecha: venta.fecha,
      },
      `boleta-compra-${venta.id}.pdf`
    );
  };

  // ----------------------------------------
  // PRESENTACIÓN
  // ----------------------------------------

  const obtenerClaseInput = (campo) => {
    if (!tocados[campo]) {
      return "border-slate-200";
    }

    if (errores[campo]) {
      return "border-red-400 focus:ring-red-500";
    }

    return "border-green-500 focus:ring-green-500";
  };

  const hayCamposVacios = [
    "nombre",
    "apellido",
    "email",
  ].some((campo) => !formData[campo].trim());

  const esBotonDeshabilitado =
    hayCamposVacios ||
    Object.values(errores).some((error) => error);

  const cantidadArticulos = carrito.reduce(
    (total, item) => total + Number(item.cantidad || 0),
    0
  );

  const campos = [
    {
      name: "nombre",
      label: "Nombre",
      icono: User,
      tipo: "text",
      placeholder: "Tu nombre",
      max: 50,
    },
    {
      name: "apellido",
      label: "Apellido",
      icono: User,
      tipo: "text",
      placeholder: "Tu apellido",
      max: 50,
    },
    {
      name: "email",
      label: "Correo",
      icono: Mail,
      tipo: "email",
      placeholder: "usuario@dominio.com",
      max: 80,
    },
    {
      name: "telefono",
      label: "Teléfono",
      icono: Phone,
      tipo: "tel",
      placeholder: "987654321",
      max: 9,
    },
    {
      name: "direccion",
      label: "Dirección",
      icono: MapPin,
      tipo: "text",
      placeholder: "Av. Principal 123, Chiclayo",
      max: 100,
    },
  ];

  // Si todavía no hay compra registrada y el carrito está vacío.
  if (!carrito.length && !compraFinalizada) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-100 p-6 rounded-full">
              <ShoppingBag className="w-16 h-16 text-purple-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-800 mb-3">
            Tu carrito está vacío
          </h1>

          <p className="text-slate-500 mb-6">
            Agrega productos para comenzar tu compra.
          </p>

          <Link
            to="/productos"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all font-medium"
          >
            <ArrowRight className="w-5 h-5" />
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">

        {/* ENCABEZADO */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {compraFinalizada
              ? "Compra realizada"
              : "Datos del Cliente"}
          </h1>

          <p className="text-slate-500 mt-2">
            {compraFinalizada
              ? "Tu pedido ha sido registrado correctamente."
              : "Completa tus datos para finalizar la compra"}
          </p>

          <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">

          {/* ================================== */}
          {/* 1. COMPRA FINALIZADA */}
          {/* ================================== */}

          {compraFinalizada && (
            <div>
              <div className="bg-green-50 border border-green-200 text-green-700 p-5 rounded-xl mb-6">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  <CheckCircle className="w-6 h-6" />
                  ¡Compra registrada correctamente!
                </div>

                <p className="text-sm mt-2">
                  Tu pedido ha sido guardado. Ya puedes descargar
                  el comprobante de tu compra.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 mb-6">

                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Resumen de Compra
                  </div>

                  <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2.5 py-1 rounded-full">
                    {compraFinalizada.productos.length} artículos
                  </span>
                </div>

                {/* Identificación de la venta */}
                <div className="space-y-2 mb-5 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">
                      Número de pedido
                    </span>
                    <span className="font-semibold text-slate-800">
                      #{compraFinalizada.venta.id}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Fecha</span>
                    <span className="font-medium text-slate-700 text-right">
                      {new Date(
                        compraFinalizada.venta.fecha
                      ).toLocaleString("es-PE")}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Estado</span>
                    <span className="bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full text-xs">
                      {compraFinalizada.venta.estado}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Cliente</span>
                    <span className="font-medium text-slate-700 text-right">
                      {compraFinalizada.datosCliente.nombre}{" "}
                      {compraFinalizada.datosCliente.apellido}
                    </span>
                  </div>
                </div>

                {/* Detalle de productos */}
                <h3 className="font-semibold text-slate-800 mb-3">
                  Productos adquiridos
                </h3>

                <div className="divide-y divide-slate-200/70">
                  {compraFinalizada.productos.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="py-3 flex justify-between items-center gap-3 text-sm"
                    >
                      <div className="text-slate-700">
                        <p className="font-medium">{item.nombre}</p>
                        <p className="text-slate-400 text-xs">
                          {item.cantidad} x S/{" "}
                          {item.precioFinal.toFixed(2)}
                        </p>
                      </div>

                      <span className="font-semibold text-slate-800 whitespace-nowrap">
                        S/ {item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total de la venta */}
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600 font-semibold">
                    Total de la compra
                  </span>

                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    S/{" "}
                    {Number(compraFinalizada.venta.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* PDF disponible únicamente después del registro */}
              <button
                type="button"
                onClick={handleDescargarBoleta}
                className="w-full py-3.5 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-[1.01] shadow-purple-500/25 cursor-pointer text-base"
              >
                <Download className="w-5 h-5" />
                Descargar comprobante en PDF
              </button>

              <Link
                to="/productos"
                className="mt-3 w-full flex items-center justify-center gap-2 text-purple-600 py-3 rounded-xl font-medium hover:bg-purple-50 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Seguir comprando
              </Link>
            </div>
          )}

          {/* ================================== */}
          {/* 2. DATOS DEL CLIENTE */}
          {/* ================================== */}

          {!compraFinalizada && (
            <>
              {/* Cliente autenticado: no necesita llenar formulario */}
              {esClienteAutenticado ? (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-2 text-purple-700 font-semibold mb-3">
                    <ShieldCheck className="w-5 h-5" />
                    Compra con tu cuenta
                  </div>

                  <p className="text-sm text-slate-600 mb-3">
                    Utilizaremos los datos de tu cuenta para registrar
                    esta compra.
                  </p>

                  <div className="space-y-2 text-sm">
                    <p className="text-slate-700">
                      <span className="font-semibold">Cliente:</span>{" "}
                      {cliente.nombre} {cliente.apellido}
                    </p>

                    <p className="text-slate-700">
                      <span className="font-semibold">Correo:</span>{" "}
                      {cliente.email}
                    </p>

                    <p className="text-slate-700">
                      <span className="font-semibold">Teléfono:</span>{" "}
                      {cliente.telefono || "No registrado"}
                    </p>

                    <p className="text-slate-700">
                      <span className="font-semibold">Dirección:</span>{" "}
                      {cliente.direccion || "No registrada"}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Formulario para clientes sin sesión */}
                  {!datosConfirmados && (
                    <>
                      <form
                        onSubmit={handleConfirmarDatos}
                        noValidate
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                          {campos.map(
                            ({
                              name,
                              label,
                              icono: Icono,
                              tipo,
                              placeholder,
                              max,
                            }) => (
                              <div
                                key={name}
                                className={`mb-4 ${
                                  name === "email" ||
                                  name === "direccion"
                                    ? "md:col-span-2"
                                    : ""
                                }`}
                              >
                                <label
                                  htmlFor={name}
                                  className="block text-slate-700 font-medium mb-2 text-sm"
                                >
                                  <Icono className="w-4 h-4 inline mr-1" />
                                  {label}:
                                  {["telefono", "direccion"].includes(name) ? (
                                    <span className="text-slate-400 text-xs ml-1">
                                      (opcional)
                                    </span>
                                  ) : (
                                    <span className="text-red-500"> *</span>
                                  )}
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
                                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition ${obtenerClaseInput(
                                    name
                                  )}`}
                                />

                                {tocados[name] && errores[name] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errores[name]}
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>

                        <p className="text-xs text-slate-400 mb-6">
                          <span className="text-red-500">*</span> Nombre, apellido y correo son obligatorios.
                          El teléfono y la dirección son opcionales.
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
                            Continuar
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </div>
                      </form>
                    </>
                  )}

                  {/* Datos del cliente invitado ya confirmados */}
                  {datosConfirmados && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
                      <div className="flex items-center gap-2 text-green-700 font-semibold mb-3">
                        <CheckCircle className="w-5 h-5" />
                        Datos del cliente confirmados
                      </div>

                      <div className="space-y-2 text-sm text-slate-700">
                        <p>
                          <strong>Cliente:</strong>{" "}
                          {formData.nombre} {formData.apellido}
                        </p>
                        <p>
                          <strong>Correo:</strong> {formData.email}
                        </p>
                        <p>
                          <strong>Teléfono:</strong> {formData.telefono}
                        </p>
                        <p>
                          <strong>Dirección:</strong> {formData.direccion}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setDatosConfirmados(false);
                          setErrorCompra("");
                        }}
                        className="mt-4 text-sm font-semibold text-purple-600 hover:text-purple-800"
                      >
                        Modificar datos
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ================================== */}
              {/* 3. REVISIÓN Y CONFIRMACIÓN */}
              {/* ================================== */}

              {(esClienteAutenticado || datosConfirmados) && (
                <div className="mt-7 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-bold text-slate-800">
                      Revisa tu pedido
                    </h2>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
                      <span className="font-semibold text-slate-700">
                        Productos seleccionados
                      </span>

                      <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2.5 py-1 rounded-full">
                        {cantidadArticulos} artículos
                      </span>
                    </div>

                    <div className="divide-y divide-slate-200/70">
                      {carrito.map((item) => {
                        const precio = Number(
                          item.precioFinal ?? item.precio
                        );

                        const subtotal = precio * Number(item.cantidad);

                        return (
                          <div
                            key={item.id}
                            className="py-3 flex justify-between items-center gap-3 text-sm"
                          >
                            <div className="text-slate-700">
                              <p className="font-medium">
                                {item.nombre}
                              </p>
                              <p className="text-slate-400 text-xs">
                                {item.cantidad} x S/ {precio.toFixed(2)}
                              </p>
                            </div>

                            <span className="font-semibold text-slate-800 whitespace-nowrap">
                              S/ {subtotal.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-slate-600 font-semibold">
                        Total a pagar
                      </span>

                      <span className="text-2xl font-bold text-purple-600">
                        S/ {totalCarrito.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {errorCompra && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mt-5 text-sm">
                      <p>{errorCompra}</p>

                      {errorCompra.includes("Inicia sesión") && (
                        <Link
                          to="/login-cliente"
                          className="inline-block mt-2 font-semibold underline"
                        >
                          Iniciar sesión
                        </Link>
                      )}
                    </div>
                  )}

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleConfirmarCompra}
                      disabled={guardando || !carrito.length}
                      className={`w-full py-3.5 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                        guardando || !carrito.length
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-[1.01] shadow-purple-500/25 cursor-pointer"
                      }`}
                    >
                      {guardando ? (
                        <>
                          <LoaderCircle className="w-5 h-5 animate-spin" />
                          Registrando compra...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Confirmar compra
                        </>
                      )}
                    </button>

                    <p className="text-xs text-slate-400 text-center mt-3">
                      Al confirmar, se registrará tu pedido con estado
                      Pendiente.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatosCliente;


