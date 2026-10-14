import { SITE } from '../config.js';

/** Ruta de la ilustración de un auto (la genera tools/ilustraciones.py). */
export const rutaIlustracion = (auto) => `assets/ilustraciones/autos/${encodeURIComponent(auto.id)}.svg`;

/**
 * Imágenes de un auto en orden de galería: la ilustración primero (si SITE.portadas la pide)
 * y después las fotos reales.
 */
export const imagenesAuto = (auto) =>
  SITE.portadas === 'ilustracion' ? [rutaIlustracion(auto), ...auto.fotos] : [...auto.fotos];

/**
 * Si la ilustración no existe (auto nuevo sin regenerar), cambia la imagen a la primera foto.
 * Se usa como onerror de <img>.
 */
export function respaldoFoto(auto) {
  return (e) => {
    const img = e.currentTarget;
    if (img.dataset.respaldo) return;
    img.dataset.respaldo = '1';
    img.src = auto.fotos[0];
  };
}
