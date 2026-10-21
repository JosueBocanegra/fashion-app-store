import { createContext, useContext, useEffect, useState } from "react";

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado = localStorage.getItem("carrito");
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  });

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  const calcularPrecio = (producto) => {
    if (producto.oferta && producto.descuento) {
      return producto.precio - (producto.precio * producto.descuento) / 100;
    }

    return producto.precio;
  };

  const agregarAlCarrito = (producto) => {
    setCarrito((carritoActual) => {
      const productoExistente = carritoActual.find(
        (item) => item.id === producto.id
      );

      if (productoExistente) {
        return carritoActual.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: Math.min(item.cantidad + 1, Number(item.stock)),
              }
            : item
        );
      }

      return [
        ...carritoActual,
        {
          ...producto,
          cantidad: 1,
          precioFinal: calcularPrecio(producto),
        },
      ];
    });
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((carritoActual) =>
      carritoActual.filter((item) => item.id !== id)
    );
  };

  const cambiarCantidad = (id, nuevaCantidad) => {
    setCarrito((carritoActual) =>
      carritoActual.map((item) => {
        if (item.id !== id) return item;

        const cantidad = Math.max(
          1,
          Math.min(nuevaCantidad, Number(item.stock))
        );

        return {
          ...item,
          cantidad,
        };
      })
    );
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const cantidadProductos = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  const totalCarrito = carrito.reduce(
    (total, item) => total + item.precioFinal * item.cantidad,
    0
  );

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        eliminarDelCarrito,
        cambiarCantidad,
        vaciarCarrito,
        cantidadProductos,
        totalCarrito,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const context = useContext(CarritoContext);

  if (!context) {
    throw new Error(
      "useCarrito debe utilizarse dentro de CarritoProvider"
    );
  }

  return context;
};