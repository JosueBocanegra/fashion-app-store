// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  registrarCliente,
  iniciarSesionCliente,
  obtenerSesionCliente,
  cerrarSesionCliente,
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
});
