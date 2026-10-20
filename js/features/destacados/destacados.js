import { alCambiarIdioma } from '../../i18n.js';
import { $ } from '../../utils/dom.js';
import { carCard } from '../catalog/carCard.js';

const MAXIMO = 6;

/** Autos para el carrusel: primero los marcados como destacados, después los más recientes. */
export function elegirDestacados(autos) {
  return autos
    .filter((a) => a.estado === 'disponible')
    .sort((a, b) => Number(b.destacado) - Number(a.destacado) || (b.publicado || '').localeCompare(a.publicado || ''))
    .slice(0, MAXIMO);
}

/**
 * Carrusel de autos destacados: pista con scroll-snap (se puede deslizar con el dedo),
 * flechas que avanzan una tarjeta y una barra que muestra la posición.
 */
export function renderDestacados(root, autos) {
  const lista = elegirDestacados(autos);
  if (!lista.length) {
    root.hidden = true;
    return;
  }

  const pista = $('[data-pista]', root);
  const anterior = $('[data-anterior]', root);
  const siguiente = $('[data-siguiente]', root);
  const barra = $('[data-progreso]', root);

  const pintar = () => {
    pista.replaceChildren(...lista.map((auto, index) => carCard(auto, { index })));
  };
  pintar();
  alCambiarIdioma(pintar);

  const paso = () => {
    const tarjeta = pista.firstElementChild;
    const gap = parseFloat(getComputedStyle(pista).columnGap) || 0;
    return tarjeta ? tarjeta.getBoundingClientRect().width + gap : pista.clientWidth;
  };

  const reducido = matchMedia('(prefers-reduced-motion: reduce)');
  const mover = (dir) => pista.scrollBy({ left: dir * paso(), behavior: reducido.matches ? 'auto' : 'smooth' });
  anterior.addEventListener('click', () => mover(-1));
  siguiente.addEventListener('click', () => mover(1));

  // Posición: una sola lectura por cuadro (requestAnimationFrame), sin trabajo extra al hacer scroll.
  let pendiente = false;
  const actualizar = () => {
    pendiente = false;
    const max = pista.scrollWidth - pista.clientWidth;
    const visible = pista.clientWidth / pista.scrollWidth;
    const avance = max > 0 ? pista.scrollLeft / max : 0;
    barra.style.setProperty('--frac', Math.min(Math.max(visible, 0.12), 1).toFixed(3));
    barra.style.setProperty('--avance', avance.toFixed(3));
    anterior.disabled = pista.scrollLeft <= 2;
    siguiente.disabled = pista.scrollLeft >= max - 2;
  };
  pista.addEventListener(
    'scroll',
    () => {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(actualizar);
      }
    },
    { passive: true },
  );
  new ResizeObserver(actualizar).observe(pista);
  actualizar();
}
