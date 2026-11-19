import { describe, it, expect } from "vitest";

import {
  ESTADOS_PEDIDO,
  normalizarEstadoPedido,
} from "./estadosPedido";

describe("Estados del pedido", () => {
  it("define los cuatro estados en orden", () => {
    expect(ESTADOS_PEDIDO).toEqual([
      "Pendiente",
      "En preparación",
      "Enviado",
      "Entregado",
    ]);
  });

  it("convierte los estados antiguos a los nuevos", () => {
    expect(normalizarEstadoPedido("completado")).toBe("Entregado");
    expect(normalizarEstadoPedido("en proceso")).toBe("En preparación");
  });

  it("ignora mayúsculas y espacios sobrantes", () => {
    expect(normalizarEstadoPedido("  ENVIADO ")).toBe("Enviado");
    expect(normalizarEstadoPedido("en   preparacion")).toBe("En preparación");
  });

  it("usa Pendiente cuando la venta no tiene estado", () => {
    expect(normalizarEstadoPedido(undefined)).toBe("Pendiente");
    expect(normalizarEstadoPedido("")).toBe("Pendiente");
  });

  it("conserva un estado desconocido con la primera letra en mayúscula", () => {
    expect(normalizarEstadoPedido("cancelado")).toBe("Cancelado");
  });
});
