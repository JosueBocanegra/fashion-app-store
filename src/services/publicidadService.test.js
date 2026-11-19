
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import { publicidadService } from "./publicidadService";

const respuesta = (data, ok = true) => ({
  ok,
  json: async () => data,
});

describe("Servicio de publicidad", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("obtiene el listado de publicidades", async () => {
    const datos = [
      {
        id: "publicidad-1",
        titulo: "Nueva colección",
        imagen: "assets/img/camisaPeru.jpg",
        estado: true,
      },
    ];

    fetch.mockResolvedValueOnce(respuesta(datos));

    const resultado = await publicidadService.obtenerPublicidad();

    expect(resultado).toEqual(datos);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/publicidad"
    );
  });

  it("crea una nueva publicidad", async () => {
    const nuevaPublicidad = {
      titulo: "Oferta de temporada",
      descripcion: "Promoción especial",
      imagen: "data:image/webp;base64,imagen",
      descuento: 20,
      estado: false,
    };

    fetch.mockResolvedValueOnce(
      respuesta({
        ...nuevaPublicidad,
        id: "publicidad-2",
      })
    );

    const resultado = await publicidadService.crearPublicidad(
      nuevaPublicidad
    );

    expect(resultado.id).toBe("publicidad-2");

    expect(fetch.mock.calls[0][1].method).toBe("POST");

    expect(
      JSON.parse(fetch.mock.calls[0][1].body)
    ).toEqual(nuevaPublicidad);
  });

  it("actualiza los datos de una publicidad", async () => {
    const publicidadActualizada = {
      id: "publicidad-1",
      titulo: "Nueva colección actualizada",
      imagen: "data:image/webp;base64,imagen",
      estado: true,
    };

    fetch.mockResolvedValueOnce(
      respuesta(publicidadActualizada)
    );

    const resultado = await publicidadService.actualizarPublicidad(
      "publicidad-1",
      publicidadActualizada
    );

    expect(resultado).toEqual(publicidadActualizada);
    expect(fetch.mock.calls[0][0]).toBe(
      "http://localhost:3001/publicidad/publicidad-1"
    );
    expect(fetch.mock.calls[0][1].method).toBe("PUT");
  });

  it("cambia el estado de una publicidad mediante PATCH", async () => {
    fetch.mockResolvedValueOnce(
      respuesta({
        id: "publicidad-1",
        estado: false,
      })
    );

    const resultado =
      await publicidadService.cambiarEstadoPublicidad(
        "publicidad-1",
        false
      );

    expect(resultado.estado).toBe(false);
    expect(fetch.mock.calls[0][1].method).toBe("PATCH");

    expect(
      JSON.parse(fetch.mock.calls[0][1].body)
    ).toEqual({
      estado: false,
    });
  });

  it("elimina una publicidad", async () => {
    fetch.mockResolvedValueOnce(respuesta({}));

    const resultado = await publicidadService.eliminarPublicidad(
      "publicidad-1"
    );

    expect(resultado).toBe(true);
    expect(fetch.mock.calls[0][1].method).toBe("DELETE");
  });

  it("obtiene la configuración de la tienda", async () => {
    const configuracion = {
      id: "tienda",
      logo: "data:image/webp;base64,logo",
    };

    fetch.mockResolvedValueOnce(respuesta(configuracion));

    const resultado =
      await publicidadService.obtenerConfiguracionTienda();

    expect(resultado).toEqual(configuracion);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/configuracion/tienda"
    );
  });

  it("actualiza el logo de la tienda sin crear otro registro", async () => {
    const logo = "data:image/webp;base64,nuevologo";

    fetch.mockResolvedValueOnce(
      respuesta({
        id: "tienda",
        logo,
      })
    );

    const resultado = await publicidadService.actualizarLogo(logo);

    expect(resultado.logo).toBe(logo);
    expect(fetch.mock.calls[0][1].method).toBe("PATCH");

    expect(fetch.mock.calls[0][0]).toBe(
      "http://localhost:3001/configuracion/tienda"
    );

    expect(
      JSON.parse(fetch.mock.calls[0][1].body)
    ).toEqual({ logo });
  });
});


