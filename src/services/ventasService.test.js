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

describe("Servicio de registro de ventas", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("registra una venta asociada a un cliente autenticado", async () => {
    fetch.mockResolvedValueOnce(
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

    const cuerpo = JSON.parse(fetch.mock.calls[0][1].body);

    expect(cuerpo.estado).toBe("Pendiente");
    expect(cuerpo.total).toBe(100);
    expect(cuerpo.items).toHaveLength(2);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("registra un cliente invitado cuando no existe", async () => {
    fetch
      .mockResolvedValueOnce(respuesta([]))
      .mockResolvedValueOnce(
        respuesta({
          id: "cliente-nuevo",
          email: "maria@example.com",
          esInvitado: true,
        })
      )
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

    expect(fetch).toHaveBeenCalledTimes(3);

    const datosNuevoCliente = JSON.parse(
      fetch.mock.calls[1][1].body
    );

    expect(datosNuevoCliente.email).toBe("maria@example.com");
    expect(datosNuevoCliente.esInvitado).toBe(true);

    expect(venta.clienteId).toBe("cliente-nuevo");
  });

  it("utiliza un cliente existente cuando coincide el correo", async () => {
    fetch
      .mockResolvedValueOnce(
        respuesta([
          {
            id: "cliente-existente",
            nombre: "Maria",
            email: "maria@example.com",
          },
        ])
      )
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

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(venta.clienteId).toBe("cliente-existente");
  });

  it("debe exigir iniciar sesión si el correo pertenece a una cuenta registrada", async () => {
    fetch.mockResolvedValueOnce(
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

    // No debe llegar a registrar la venta.
    expect(fetch).toHaveBeenCalledTimes(1);
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

  it("informa cuando el servidor no registra la venta", async () => {
    fetch.mockResolvedValueOnce(
      respuesta({}, false)
    );

    await expect(
      registrarVenta({
        cliente: { id: "cliente-1" },
        carrito: carritoPrueba,
      })
    ).rejects.toThrow("No se pudo registrar la compra.");

  });
});


