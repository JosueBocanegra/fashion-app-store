const MAX_SIZE = 5 * 1024 * 1024;

const TIPOS_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const convertirImagenOptimizada = (
  archivo,
  opciones = {}
) => {
  const {
    maxWidth = 1600,
    maxHeight = 900,
    quality = 0.82,
  } = opciones;

  return new Promise((resolve, reject) => {
    if (!archivo) {
      reject(new Error("Selecciona una imagen."));
      return;
    }

    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      reject(
        new Error("Solo se permiten imágenes JPG, PNG o WEBP.")
      );
      return;
    }

    if (archivo.size > MAX_SIZE) {
      reject(
        new Error("La imagen no debe superar los 5 MB.")
      );
      return;
    }

    const objectUrl = URL.createObjectURL(archivo);
    const imagen = new Image();

    imagen.onload = () => {
      try {
        const anchoOriginal = imagen.naturalWidth;
        const altoOriginal = imagen.naturalHeight;

        const escala = Math.min(
          1,
          maxWidth / anchoOriginal,
          maxHeight / altoOriginal
        );

        const canvas = document.createElement("canvas");

        canvas.width = Math.max(
          1,
          Math.round(anchoOriginal * escala)
        );

        canvas.height = Math.max(
          1,
          Math.round(altoOriginal * escala)
        );

        const contexto = canvas.getContext("2d");

        if (!contexto) {
          throw new Error(
            "No se pudo procesar la imagen."
          );
        }

        contexto.drawImage(
          imagen,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // WebP permite reducir el tamaño de almacenamiento.
        // Si el navegador no lo soporta, toDataURL devuelve
        // un formato de imagen compatible.
        const imagenOptimizada = canvas.toDataURL(
          "image/webp",
          quality
        );

        if (!imagenOptimizada.startsWith("data:image/")) {
          throw new Error(
            "No se pudo convertir la imagen."
          );
        }

        resolve(imagenOptimizada);
      } catch (error) {
        reject(
          new Error(
            error.message || "No se pudo procesar la imagen."
          )
        );
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    imagen.onerror = () => {
      URL.revokeObjectURL(objectUrl);

      reject(
        new Error("No se pudo leer el archivo de imagen.")
      );
    };

    imagen.src = objectUrl;
  });
};


