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

    const venta = await ventasService.actualizarEstadoVenta("5", "Enviado");

    expect(venta.estado).toBe("Enviado");
    expect(fetch).toHaveBeenCalledTimes(1);

    const [url, opciones] = fetch.mock.calls[0];

    expect(url).toBe("http://localhost:3001/ventas/5");
    expect(opciones.method).toBe("PATCH");
    expect(JSON.parse(opciones.body)).toEqual({ estado: "Enviado" });
  });

  it("muestra un error si el servidor no guarda el cambio", async () => {
    fetch.mockResolvedValueOnce(respuesta({}, false));

    await expect(
      ventasService.actualizarEstadoVenta("5", "Entregado")
    ).rejects.toThrow("Error al actualizar el estado de la venta");
  });

  it("consulta todas las ventas para el panel", async () => {
    fetch.mockResolvedValueOnce(respuesta([{ id: "1" }, { id: "2" }]));

    const ventas = await ventasService.obtenerVentas();

    expect(ventas).toHaveLength(2);
    expect(fetch.mock.calls[0][0]).toBe("http://localhost:3001/ventas");
  });
});
