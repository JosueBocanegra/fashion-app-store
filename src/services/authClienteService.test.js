// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  registrarCliente,
  iniciarSesionCliente,
  obtenerSesionCliente,
  cerrarSesionCliente,
  actualizarDatosContactoCliente,
} from "./authClienteService";

const clientesIniciales = [
  {
    id: "1",
    nombre: "Juan",
    apellido: "Perez",
    email: "juan@example.com",
    password: "123456",
  },
];

describe("Servicio de autenticación de clientes", () => {
  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn();
  });

  it("debe registrar un cliente correctamente", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => clientesIniciales,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "2",
          nombre: "Maria",
          apellido: "Lopez",
          email: "maria@example.com",
          password: "123456",
        }),
      });

    const resultado = await registrarCliente({
      nombre: "Maria",
      apellido: "Lopez",
      email: "maria@example.com",
      password: "123456",
    });

    expect(resultado.email).toBe("maria@example.com");
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("no debe permitir registrar un correo duplicado", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => clientesIniciales,
    });

    await expect(
      registrarCliente({
        nombre: "Juan",
        apellido: "Perez",
        email: "JUAN@example.com",
        password: "123456",
      })
    ).rejects.toThrow("Este correo ya está registrado.");

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("debe iniciar sesión con credenciales correctas", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => clientesIniciales,
    });

    const resultado = await iniciarSesionCliente(
      "juan@example.com",
      "123456"
    );

    expect(resultado.nombre).toBe("Juan");
    expect(resultado.email).toBe("juan@example.com");
    expect(resultado.password).toBeUndefined();
    expect(obtenerSesionCliente()).toEqual(resultado);
  });

  it("debe rechazar credenciales incorrectas", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => clientesIniciales,
    });

    await expect(
      iniciarSesionCliente("juan@example.com", "incorrecta")
    ).rejects.toThrow("Correo o contraseña incorrectos.");
  });

  it("debe cerrar la sesión del cliente", async () => {
    localStorage.setItem(
      "clienteUser",
      JSON.stringify({
        id: "1",
        nombre: "Juan",
        apellido: "Perez",
        email: "juan@example.com",
      })
    );

    cerrarSesionCliente();

    expect(obtenerSesionCliente()).toBeNull();
  });

  it("debe permitir completar la cuenta de un cliente invitado", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "cliente-invitado",
            nombre: "Maria",
            apellido: "Lopez",
            email: "maria@example.com",
            esInvitado: true,
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "cliente-invitado",
          nombre: "Maria",
          apellido: "Lopez",
          email: "maria@example.com",
          password: "123456",
          esInvitado: false,
        }),
      });

    const resultado = await registrarCliente({
      nombre: "Maria",
      apellido: "Lopez",
      email: "maria@example.com",
      password: "123456",
    });

    expect(resultado.id).toBe("cliente-invitado");
    expect(resultado.esInvitado).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][1].method).toBe("PATCH");
  });


  it("debe actualizar el teléfono y dirección de un cliente", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "1",
        nombre: "Juan",
        telefono: "987654321",
        direccion: "Av. Principal 123, Chiclayo",
      }),
    });

    const resultado = await actualizarDatosContactoCliente("1", {
      telefono: "987654321",
      direccion: "Av. Principal 123, Chiclayo",
    });

    expect(resultado.id).toBe("1");
    expect(resultado.telefono).toBe("987654321");
    expect(resultado.direccion).toBe("Av. Principal 123, Chiclayo");

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(fetch.mock.calls[0][1].method).toBe("PATCH");

    const datosEnviados = JSON.parse(
      fetch.mock.calls[0][1].body
    );

    expect(datosEnviados.telefono).toBe("987654321");
    expect(datosEnviados.direccion).toBe("Av. Principal 123, Chiclayo");
  });

});


