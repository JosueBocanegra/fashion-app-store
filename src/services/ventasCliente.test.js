import { describe, it, expect, beforeEach, vi } from "vitest";

import { obtenerVentasCliente } from "./ventasService";

const respuesta = (data, ok = true) => ({
  ok,
  json: async () => data,
});

describe("Consulta de pedidos de un cliente", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("devuelve solo los pedidos del cliente", async () => {
    fetch.mockResolvedValueOnce(
      respuesta([
        { id: "1", clienteId: "abc", estado: "Pendiente" },
        { id: "2", clienteId: "xyz", estado: "Enviado" },
      ])
    );

    const pedidos = await obtenerVentasCliente("abc");

    expect(pedidos).toHaveLength(1);
    expect(pedidos[0].id).toBe("1");
    expect(fetch.mock.calls[0][0]).toBe(
      "http://localhost:3001/ventas?clienteId=abc"
    );
  });

  it("exige el identificador del cliente", async () => {
    await expect(obtenerVentasCliente("")).rejects.toThrow(
      "No se encontró el identificador del cliente."
    );

    expect(fetch).not.toHaveBeenCalled();
  });

  it("muestra un error si el servidor falla", async () => {
    fetch.mockResolvedValueOnce(respuesta([], false));

    await expect(obtenerVentasCliente("abc")).rejects.toThrow(
      "No se pudieron obtener los pedidos del cliente."
    );
  });
});
