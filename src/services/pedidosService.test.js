import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  obtenerPedidosCliente,
  obtenerDetallePedido,
  normalizarEstadoPedido,
  ESTADOS_PEDIDO,
} from "./pedidosService";

const respuesta = (data, ok = true) => ({
  ok,
  json: async () => data,
});

describe("Servicio de Mis Pedidos (pedidosService)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  describe("normalizarEstadoPedido", () => {
    it("mapea correctamente los 4 estados principales requeridos", () => {
      expect(normalizarEstadoPedido("Pendiente")).toBe(ESTADOS_PEDIDO.PENDIENTE);
      expect(normalizarEstadoPedido("pendiente")).toBe(ESTADOS_PEDIDO.PENDIENTE);
      expect(normalizarEstadoPedido("En preparación")).toBe(ESTADOS_PEDIDO.EN_PREPARACION);
      expect(normalizarEstadoPedido("en proceso")).toBe(ESTADOS_PEDIDO.EN_PREPARACION);
      expect(normalizarEstadoPedido("Enviado")).toBe(ESTADOS_PEDIDO.ENVIADO);
      expect(normalizarEstadoPedido("enviado")).toBe(ESTADOS_PEDIDO.ENVIADO);
      expect(normalizarEstadoPedido("Entregado")).toBe(ESTADOS_PEDIDO.ENTREGADO);
      expect(normalizarEstadoPedido("completado")).toBe(ESTADOS_PEDIDO.ENTREGADO);
    });

    it("usa Pendiente como estado predeterminado ante valores vacíos o desconocidos", () => {
      expect(normalizarEstadoPedido("")).toBe(ESTADOS_PEDIDO.PENDIENTE);
      expect(normalizarEstadoPedido(null)).toBe(ESTADOS_PEDIDO.PENDIENTE);
      expect(normalizarEstadoPedido("otro")).toBe(ESTADOS_PEDIDO.PENDIENTE);
    });
  });

  describe("obtenerPedidosCliente", () => {
    it("retorna un arreglo vacío si no se proporciona un clienteId", async () => {
      const pedidos = await obtenerPedidosCliente(null);
      expect(pedidos).toEqual([]);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("consulta únicamente los pedidos del cliente en sesión y los ordena por fecha descendente", async () => {
      const pedidosMock = [
        {
          id: "ped-1",
          clienteId: "cli-123",
          fecha: "2026-11-10T10:00:00.000Z",
          total: 50,
          estado: "completado",
          items: [{ nombre: "Polo", cantidad: 1, precioUnitario: 50, subtotal: 50 }],
        },
        {
          id: "ped-2",
          clienteId: "cli-123",
          fecha: "2026-11-18T15:00:00.000Z",
          total: 80,
          estado: "Pendiente",
          items: [{ nombre: "Casaca", cantidad: 1, precioUnitario: 80, subtotal: 80 }],
        },
      ];

      fetch.mockResolvedValueOnce(respuesta(pedidosMock));

      const resultado = await obtenerPedidosCliente("cli-123");

      expect(fetch).toHaveBeenCalledWith("http://localhost:3001/ventas?clienteId=cli-123");
      expect(resultado).toHaveLength(2);
      // Más reciente primero (ped-2 fecha 18 > ped-1 fecha 10)
      expect(resultado[0].id).toBe("ped-2");
      expect(resultado[0].estado).toBe(ESTADOS_PEDIDO.PENDIENTE);
      expect(resultado[1].id).toBe("ped-1");
      expect(resultado[1].estado).toBe(ESTADOS_PEDIDO.ENTREGADO);
    });

    it("lanza un error legible cuando falla la petición de red", async () => {
      fetch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(obtenerPedidosCliente("cli-123")).rejects.toThrow(
        "No se pudieron cargar tus pedidos. Intenta más tarde."
      );
    });
  });

  describe("obtenerDetallePedido", () => {
    it("obtiene el detalle de un pedido específico por ID con su estado normalizado", async () => {
      const pedidoMock = {
        id: "PED-001",
        clienteId: "cli-123",
        fecha: "2026-11-18T10:00:00.000Z",
        total: 100,
        estado: "enviado",
        items: [
          { productoId: "1", nombre: "Prenda A", cantidad: 2, precioUnitario: 50, subtotal: 100 },
        ],
      };

      fetch.mockResolvedValueOnce(respuesta(pedidoMock));

      const detalle = await obtenerDetallePedido("PED-001");

      expect(fetch).toHaveBeenCalledWith("http://localhost:3001/ventas/PED-001");
      expect(detalle.id).toBe("PED-001");
      expect(detalle.estado).toBe(ESTADOS_PEDIDO.ENVIADO);
      expect(detalle.items).toHaveLength(1);
    });

    it("lanza un error si el pedido no existe", async () => {
      fetch.mockResolvedValueOnce(respuesta(null, false));

      await expect(obtenerDetallePedido("PED-999")).rejects.toThrow(
        "No se pudo obtener el detalle del pedido."
      );
    });
  });
});
