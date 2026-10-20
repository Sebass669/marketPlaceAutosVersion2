import { $ } from '../../utils/dom.js';

const dosCifras = (n) => String(n).padStart(2, '0');

/** "7600000" -> "₡7,6 M" (compacto para la tira del póster). */
const millones = (colones) => `₡${(colones / 1_000_000).toLocaleString('es-CR', { maximumFractionDigits: 1 })} M`;

/**
 * Completa la tira de datos de la portada con números reales del inventario:
 * autos disponibles, precio más bajo y cantidad de marcas.
 */
export function renderHeroDatos(autos) {
  const disponibles = autos.filter((a) => a.estado === 'disponible');
  const raiz = $('[data-hero-datos]');
  if (!raiz || !disponibles.length) {
    raiz?.setAttribute('hidden', '');
    return;
  }
  const valores = {
    disponibles: dosCifras(disponibles.length),
    desde: millones(Math.min(...disponibles.map((a) => a.precio))),
    marcas: dosCifras(new Set(disponibles.map((a) => a.marca)).size),
  };
  for (const [clave, valor] of Object.entries(valores)) {
    const el = $(`[data-dato-hero="${clave}"]`, raiz);
    if (el) el.textContent = valor;
  }
}
