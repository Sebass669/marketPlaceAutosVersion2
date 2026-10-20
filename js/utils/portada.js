import { h } from './dom.js';

/**
 * Foto de un auto (la primera de "fotos" en data/autos.json es la portada).
 * Si una foto no carga, se oculta y queda el fondo neutro de la tarjeta.
 */
export function fotoAuto(src, { alt = '', eager = false, clase = '' } = {}) {
  return h('img', {
    class: clase,
    src,
    alt,
    width: 1200,
    height: 900,
    loading: eager ? 'eager' : 'lazy',
    decoding: 'async',
    onerror: (e) => e.currentTarget.classList.add('foto--rota'),
  });
}
