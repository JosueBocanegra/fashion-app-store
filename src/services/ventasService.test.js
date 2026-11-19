import { describe, it, expect, beforeEach, vi } from "vitest";

import { registrarVenta } from "./ventasService";

const respuesta = (data, ok = true) => ({
  ok,
  json: async () => data,
});

const carritoPrueba = [
  {
    id: "1",
    nombre: "Casaca de cuero",
    cantidad: 2,
    precio: 50,
    precioFinal: 40,
  },
  {
    id: "3",
    nombre: "Shorts casual",
    cantidad: 1,
    precio: 20,
    precioFinal: 20,
  },
];

// Inventario inicial utilizado en las pruebas.
const inventarioPrueba = [
  {
    id: "1",
    nombre: "Casaca de cuero",
    stock: 10,
  },
  {
    id: "3",
    nombre: "Shorts casual",
    stock: 5,
  },
];

describe("Servicio de registro de ventas", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("registra una venta asociada a un cliente autenticado y descuenta el inventario", async () => {
    fetch
      // 1. Consultar el inventario.
      .mockResolvedValueOnce(respuesta(inventarioPrueba))

      // 2. Descontar el stock de la casaca.
      .mockResolvedValueOnce(
        respuesta({ id: "1", stock: 8 })
      )

      // 3. Descontar el stock de los shorts.
      .mockResolvedValueOnce(
        respuesta({ id: "3", stock: 4 })
      )

      // 4. Registrar la venta.
      .mockResolvedValueOnce(
        respuesta({
          id: "venta-1",
          clienteId: "cliente-1",
          total: 100,
          estado: "Pendiente",
        })
      );

    const venta = await registrarVenta({
      cliente: {
        id: "cliente-1",
        nombre: "Juan",
        apellido: "Perez",
        email: "juan@example.com",
      },
      carrito: carritoPrueba,
    });

    expect(venta.id).toBe("venta-1");
    expect(venta.clienteId).toBe("cliente-1");

    // Comprobar que primero se consulta el inventario.
    expect(fetch.mock.calls[0][0]).toBe(
      "http://localhost:3001/productos"
    );

    // Comprobar el descuento del stock de la casaca.
    expect(fetch.mock.calls[1][0]).toBe(
      "http://localhost:3001/productos/1"
    );

    expect(fetch.mock.calls[1][1].method).toBe("PATCH");

    expect(
      JSON.parse(fetch.mock.calls[1][1].body).stock
    ).toBe(8);

    // Comprobar el descuento del stock de los shorts.
    expect(fetch.mock.calls[2][0]).toBe(
      "http://localhost:3001/productos/3"
    );

    expect(fetch.mock.calls[2][1].method).toBe("PATCH");

    expect(
      JSON.parse(fetch.mock.calls[2][1].body).stock
    ).toBe(4);

    // Comprobar los datos de la venta.
    const cuerpo = JSON.parse(fetch.mock.calls[3][1].body);

    expect(fetch.mock.calls[3][0]).toBe(
      "http://localhost:3001/ventas"
    );

    expect(cuerpo.estado).toBe("Pendiente");
    expect(cuerpo.total).toBe(100);
    expect(cuerpo.items).toHaveLength(2);

    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it("registra un cliente invitado cuando no existe y actualiza el inventario", async () => {
    fetch
      // 1. Consultar el inventario.
      .mockResolvedValueOnce(respuesta(inventarioPrueba))

      // 2. Consultar clientes existentes.
      .mockResolvedValueOnce(respuesta([]))

      // 3. Registrar el nuevo cliente.
      .mockResolvedValueOnce(
        respuesta({
          id: "cliente-nuevo",
          email: "maria@example.com",
          esInvitado: true,
        })
      )

      // 4. Actualizar stock de la casaca.
      .mockResolvedValueOnce(
        respuesta({ id: "1", stock: 8 })
      )

      // 5. Actualizar stock de los shorts.
      .mockResolvedValueOnce(
        respuesta({ id: "3", stock: 4 })
      )

      // 6. Registrar la venta.
      .mockResolvedValueOnce(
        respuesta({
          id: "venta-2",
          clienteId: "cliente-nuevo",
          total: 100,
          estado: "Pendiente",
        })
      );

    const datosCliente = {
      nombre: "Maria",
      apellido: "Lopez",
      email: "maria@example.com",
      telefono: "987654321",
      direccion: "Chiclayo",
    };

    const venta = await registrarVenta({
      datosCliente,
      carrito: carritoPrueba,
    });

    expect(fetch).toHaveBeenCalledTimes(6);

    const datosNuevoCliente = JSON.parse(
      fetch.mock.calls[2][1].body
    );

    expect(datosNuevoCliente.email).toBe("maria@example.com");
    expect(datosNuevoCliente.esInvitado).toBe(true);
    expect(datosNuevoCliente.telefono).toBe("987654321");
    expect(datosNuevoCliente.direccion).toBe("Chiclayo");

    expect(venta.clienteId).toBe("cliente-nuevo");

    // Comprobar que se actualizó el inventario.
    expect(
      JSON.parse(fetch.mock.calls[3][1].body).stock
    ).toBe(8);

    expect(
      JSON.parse(fetch.mock.calls[4][1].body).stock
    ).toBe(4);
  });

  it("actualiza los datos de contacto de un cliente existente antes de registrar la venta", async () => {
    fetch
      // 1. Consultar el inventario.
      .mockResolvedValueOnce(respuesta(inventarioPrueba))

      // 2. Consultar clientes existentes.
      .mockResolvedValueOnce(
        respuesta([
          {
            id: "cliente-existente",
            nombre: "Maria",
            apellido: "Lopez",
            email: "maria@example.com",
            telefono: "",
            direccion: "",
          },
        ])
      )

      // 3. Actualizar teléfono y dirección del cliente.
      .mockResolvedValueOnce(
        respuesta({
          id: "cliente-existente",
          nombre: "Maria",
          apellido: "Lopez",
          email: "maria@example.com",
          telefono: "987654321",
          direccion: "Chiclayo",
        })
      )

      // 4. Descontar stock de la casaca.
      .mockResolvedValueOnce(
        respuesta({ id: "1", stock: 8 })
      )

      // 5. Descontar stock de los shorts.
      .mockResolvedValueOnce(
        respuesta({ id: "3", stock: 4 })
      )

      // 6. Registrar la venta.
      .mockResolvedValueOnce(
        respuesta({
          id: "venta-3",
          clienteId: "cliente-existente",
          total: 100,
          estado: "Pendiente",
        })
      );

    const venta = await registrarVenta({
      datosCliente: {
        nombre: "Maria",
        apellido: "Lopez",
        email: "MARIA@example.com",
        telefono: "987654321",
        direccion: "Chiclayo",
      },
      carrito: carritoPrueba,
    });

    expect(venta.id).toBe("venta-3");
    expect(venta.clienteId).toBe("cliente-existente");

    // Deben ejecutarse seis solicitudes.
    expect(fetch).toHaveBeenCalledTimes(6);

    // Comprobar la actualización del cliente.
    expect(fetch.mock.calls[2][0]).toBe(
      "http://localhost:3001/clientes/cliente-existente"
    );

    expect(fetch.mock.calls[2][1].method).toBe("PATCH");

    const datosActualizados = JSON.parse(
      fetch.mock.calls[2][1].body
    );

    expect(datosActualizados.telefono).toBe("987654321");
    expect(datosActualizados.direccion).toBe("Chiclayo");

    // Comprobar que después se actualiza el inventario.
    expect(fetch.mock.calls[3][0]).toBe(
      "http://localhost:3001/productos/1"
    );

    expect(fetch.mock.calls[4][0]).toBe(
      "http://localhost:3001/productos/3"
    );

    // Comprobar que finalmente se registra la venta.
    expect(fetch.mock.calls[5][0]).toBe(
      "http://localhost:3001/ventas"
    );

    expect(fetch.mock.calls[5][1].method).toBe("POST");

    const datosVenta = JSON.parse(
      fetch.mock.calls[5][1].body
    );

    expect(datosVenta.clienteId).toBe("cliente-existente");
    expect(datosVenta.total).toBe(100);
    expect(datosVenta.estado).toBe("Pendiente");
  });

  it("debe exigir iniciar sesión si el correo pertenece a una cuenta registrada", async () => {
    fetch
      // 1. Consultar inventario.
      .mockResolvedValueOnce(respuesta(inventarioPrueba))

      // 2. Consultar clientes.
      .mockResolvedValueOnce(
        respuesta([
          {
            id: "cliente-registrado",
            nombre: "Maria",
            email: "maria@example.com",
            password: "123456",
          },
        ])
      );

    await expect(
      registrarVenta({
        datosCliente: {
          nombre: "Maria",
          apellido: "Lopez",
          email: "maria@example.com",
          telefono: "987654321",
          direccion: "Chiclayo",
        },
        carrito: carritoPrueba,
      })
    ).rejects.toThrow("Inicia sesión");

    // No debe actualizar el stock ni registrar la venta.
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("no registra una venta cuando el carrito está vacío", async () => {
    await expect(
      registrarVenta({
        cliente: { id: "cliente-1" },
        carrito: [],
      })
    ).rejects.toThrow("No hay productos en el carrito.");

    expect(fetch).not.toHaveBeenCalled();
  });

  it("rechaza productos con información inválida", async () => {
    await expect(
      registrarVenta({
        cliente: { id: "cliente-1" },
        carrito: [
          {
            id: "1",
            nombre: "Producto",
            cantidad: 0,
            precioFinal: 50,
          },
        ],
      })
    ).rejects.toThrow("información inválida");

    expect(fetch).not.toHaveBeenCalled();
  });

  it("rechaza una compra cuando el stock disponible es insuficiente", async () => {
    // La casaca tiene solamente una unidad disponible,
    // pero el cliente intenta comprar dos.
    fetch.mockResolvedValueOnce(
      respuesta([
        {
          id: "1",
          nombre: "Casaca de cuero",
          stock: 1,
        },
        {
          id: "3",
          nombre: "Shorts casual",
          stock: 5,
        },
      ])
    );

    await expect(
      registrarVenta({
        cliente: { id: "cliente-1" },
        carrito: carritoPrueba,
      })
    ).rejects.toThrow("Stock insuficiente");

    // No debe realizar descuentos ni registrar la venta.
    expect(fetch).toHaveBeenCalledTimes(1);

    expect(fetch.mock.calls[0][0]).toBe(
      "http://localhost:3001/productos"
    );
  });

  it("restaura el inventario cuando falla el registro de la venta", async () => {
    fetch
      // 1. Consultar inventario.
      .mockResolvedValueOnce(respuesta(inventarioPrueba))

      // 2. Actualizar stock de la casaca.
      .mockResolvedValueOnce(
        respuesta({ id: "1", stock: 8 })
      )

      // 3. Actualizar stock de los shorts.
      .mockResolvedValueOnce(
        respuesta({ id: "3", stock: 4 })
      )

      // 4. Simular un error al registrar la venta.
      .mockResolvedValueOnce(respuesta({}, false))

      // 5. Restaurar stock de los shorts.
      .mockResolvedValueOnce(
        respuesta({ id: "3", stock: 5 })
      )

      // 6. Restaurar stock de la casaca.
      .mockResolvedValueOnce(
        respuesta({ id: "1", stock: 10 })
      );

    await expect(
      registrarVenta({
        cliente: { id: "cliente-1" },
        carrito: carritoPrueba,
      })
    ).rejects.toThrow("No se pudo registrar la compra.");

    // Deben ejecutarse seis solicitudes.
    expect(fetch).toHaveBeenCalledTimes(6);

    // Comprobar la restauración del stock de los shorts.
    expect(fetch.mock.calls[4][0]).toBe(
      "http://localhost:3001/productos/3"
    );

    expect(fetch.mock.calls[4][1].method).toBe("PATCH");

    expect(
      JSON.parse(fetch.mock.calls[4][1].body).stock
    ).toBe(5);

    // Comprobar la restauración del stock de la casaca.
    expect(fetch.mock.calls[5][0]).toBe(
      "http://localhost:3001/productos/1"
    );

    expect(fetch.mock.calls[5][1].method).toBe("PATCH");

    expect(
      JSON.parse(fetch.mock.calls[5][1].body).stock
    ).toBe(10);
  });

  it("restaura los productos anteriores cuando falla una actualización del inventario", async () => {
    fetch
      // 1. Consultar inventario.
      .mockResolvedValueOnce(respuesta(inventarioPrueba))

      // 2. La casaca se actualiza correctamente.
      .mockResolvedValueOnce(
        respuesta({ id: "1", stock: 8 })
      )

      // 3. Falla la actualización de los shorts.
      .mockResolvedValueOnce(respuesta({}, false))

      // 4. Restaurar el stock de la casaca.
      .mockResolvedValueOnce(
        respuesta({ id: "1", stock: 10 })
      );

    await expect(
      registrarVenta({
        cliente: { id: "cliente-1" },
        carrito: carritoPrueba,
      })
    ).rejects.toThrow("No se pudo actualizar el stock");

    // Se consultó, se intentaron dos actualizaciones
    // y se restauró la primera.
    expect(fetch).toHaveBeenCalledTimes(4);

    expect(fetch.mock.calls[3][0]).toBe(
      "http://localhost:3001/productos/1"
    );

    expect(fetch.mock.calls[3][1].method).toBe("PATCH");

    expect(
      JSON.parse(fetch.mock.calls[3][1].body).stock
    ).toBe(10);
  });
});
