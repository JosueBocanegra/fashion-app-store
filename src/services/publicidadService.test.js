
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import {
  publicidadService,
  obtenerImagenLogoActivo,
} from "./publicidadService";

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
      titulo: "Nueva colección",
      descripcion: "Colección de temporada",
      imagen: "data:image/webp;base64,imagen",
      estado: false,
      fechaCreacion: "2026-11-19T10:00:00.000Z",
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

  it("actualiza la colección de logos y el identificador del logo activo", async () => {
    const logos = [
      {
        id: "logo-1",
        nombre: "Logo principal",
        imagen: "data:image/webp;base64,logo1",
      },
      {
        id: "logo-2",
        nombre: "Logo alternativo",
        imagen: "data:image/webp;base64,logo2",
      },
    ];

    const configuracion = {
      id: "tienda",
      logos,
      logoActivoId: "logo-2",
      logo: "",
    };

    fetch.mockResolvedValueOnce(respuesta(configuracion));

    const resultado = await publicidadService.actualizarLogos(
      logos,
      "logo-2"
    );

    expect(resultado).toEqual(configuracion);
    expect(fetch.mock.calls[0][1].method).toBe("PATCH");

    expect(fetch.mock.calls[0][0]).toBe(
      "http://localhost:3001/configuracion/tienda"
    );

    expect(
      JSON.parse(fetch.mock.calls[0][1].body)
    ).toEqual({
      logos,
      logoActivoId: "logo-2",
      logo: "",
    });
  });

  it("obtiene la imagen del único logotipo activo", () => {
    const configuracion = {
      id: "tienda",
      logos: [
        {
          id: "logo-1",
          nombre: "Logo principal",
          imagen: "data:image/webp;base64,logo1",
        },
        {
          id: "logo-2",
          nombre: "Logo alternativo",
          imagen: "data:image/webp;base64,logo2",
        },
      ],
      logoActivoId: "logo-2",
    };

    expect(
      obtenerImagenLogoActivo(configuracion)
    ).toBe("data:image/webp;base64,logo2");
  });

  it("no devuelve un logo cuando no existe uno activo", () => {
    const configuracion = {
      id: "tienda",
      logos: [
        {
          id: "logo-1",
          nombre: "Logo principal",
          imagen: "data:image/webp;base64,logo1",
        },
      ],
      logoActivoId: null,
      logo: "",
    };

    expect(
      obtenerImagenLogoActivo(configuracion)
    ).toBe("");
  });
});


