import { describe, it, expect, beforeEach, vi } from "vitest";

import { ventasService } from "./ventasService";

const respuesta = (data, ok = true) => ({
  ok,
  json: async () => data,
});

describe("Servicio de pedidos del panel administrativo", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("guarda el nuevo estado con PATCH en la venta indicada", async () => {
    fetch.mockResolvedValueOnce(respuesta({ id: "5", estado: "Enviado" }));

    const venta = await ventasService.actualizarEstado("5", "Enviado");

    expect(venta.estado).toBe("Enviado");
    expect(fetch).toHaveBeenCalledTimes(1);

    const [url, opciones] = fetch.mock.calls[0];

    expect(url).toBe("http://localhost:3001/ventas/5");
    expect(opciones.method).toBe("PATCH");
    expect(JSON.parse(opciones.body)).toEqual({ estado: "Enviado" });
  });

  it("rechaza un estado que no existe sin llamar al servidor", async () => {
    await expect(
      ventasService.actualizarEstado("5", "Perdido")
    ).rejects.toThrow("Estado de pedido no válido");

    expect(fetch).not.toHaveBeenCalled();
  });

  it("muestra un error si el servidor no guarda el cambio", async () => {
    fetch.mockResolvedValueOnce(respuesta({}, false));

    await expect(
      ventasService.actualizarEstado("5", "Entregado")
    ).rejects.toThrow("Error al actualizar el estado del pedido");
  });
});
