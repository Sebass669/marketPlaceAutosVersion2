import { alCambiarIdioma, t } from '../../i18n.js';
import { $, $$, ICON_SPRITE } from '../../utils/dom.js';

/**
 * Revela secciones al entrar en pantalla (marca [data-reveal] -> .is-visible).
 * Con prefers-reduced-motion el CSS ya muestra todo sin animar.
 */
export function initReveal() {
  const elementos = $$('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    elementos.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );
  elementos.forEach((el) => observer.observe(el));
}

/** Menú móvil: botón hamburguesa que abre/cierra la navegación. */
export function initNav() {
  const header = $('[data-header]');
  const toggle = $('[data-nav-toggle]', header);
  const icono = $('use', toggle);

  const setAbierto = (abierto) => {
    header.toggleAttribute('data-menu-abierto', abierto);
    toggle.setAttribute('aria-expanded', String(abierto));
    toggle.setAttribute('aria-label', t(abierto ? 'menu.cerrar' : 'menu.abrir'));
    icono.setAttribute('href', `${ICON_SPRITE}#i-${abierto ? 'x' : 'list'}`);
  };
  const cerrar = () => setAbierto(false);

  toggle.addEventListener('click', () => setAbierto(!header.hasAttribute('data-menu-abierto')));
  alCambiarIdioma(() => setAbierto(header.hasAttribute('data-menu-abierto')));
  setAbierto(false);
  $$('.nav a', header).forEach((a) => a.addEventListener('click', cerrar));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && cerrar());

  // Sombra del header cuando la página ya no está arriba (sin listener de scroll).
  const centinela = $('[data-top-sentinel]');
  if (centinela && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => header.toggleAttribute('data-elevado', !entry.isIntersecting)).observe(centinela);
  }
}

/** Distancia al borde superior (px) a la que el mouse hace aparecer el header. */
const ZONA_MOUSE = 56;

/**
 * Header que se esconde (CSS: .header[data-auto]).
 * - Con mouse: aparece solo cuando el puntero se acerca al borde de arriba, en cualquier
 *   parte de la página, y se queda mientras el puntero esté sobre él.
 * - Pantallas táctiles (no hay mouse): aparece arriba del todo y al subir; se esconde al bajar.
 * - Teclado y menú abierto: lo resuelve el CSS (:focus-visible y data-menu-abierto).
 */
export function initHeaderAuto() {
  const header = $('[data-header]');
  const conMouse = window.matchMedia('(hover: hover) and (pointer: fine)');
  let espera = null;

  const mostrar = (visible) => {
    clearTimeout(espera);
    espera = null;
    header.toggleAttribute('data-visible', visible);
  };

  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      if (e.clientY <= ZONA_MOUSE || header.contains(e.target)) mostrar(true);
      // Pequeña espera al salir para que no parpadee si el mouse pasa rozando el borde.
      else if (header.hasAttribute('data-visible') && espera === null) espera = setTimeout(() => mostrar(false), 280);
    },
    { passive: true },
  );

  let ultimaY = window.scrollY;
  window.addEventListener(
    'scroll',
    () => {
      if (conMouse.matches) return;
      const y = window.scrollY;
      if (y < 8 || y < ultimaY - 6) mostrar(true);
      else if (y > ultimaY + 6 && y > header.offsetHeight) mostrar(false);
      ultimaY = y;
    },
    { passive: true },
  );

  header.setAttribute('data-auto', '');
  mostrar(!conMouse.matches && window.scrollY < 8);
}

/**
 * Scroll suave para enlaces internos (#carros, #contacto...). Se hace por JS para
 * respetar la preferencia de reducir movimiento.
 * Los links de ficha (#carro/ID) los maneja el router.
 */
export function initAnclas() {
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || link.getAttribute('href').startsWith('#carro/')) return;
    const destino = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!destino) return;
    e.preventDefault();
    destino.scrollIntoView({ behavior: reducido.matches ? 'auto' : 'smooth' });
    history.pushState(null, '', link.hash);
  });
}

const TEMAS = ['negro', 'hueso'];
const CLAVE_TEMA = 'solera-tema';
const COLOR_BARRA = { negro: '#0c0c0c', hueso: '#e9e4d8' };

/**
 * Selector de tema (negro / claro). Cambia data-tema en <html>, lo guarda en el
 * navegador y actualiza el color de la barra del celular. Funciona como radiogroup con flechas.
 */
export function initTema() {
  const grupo = $('[data-temas]');
  const opciones = $$('[data-tema-opcion]', grupo);
  const metaColor = $('meta[name="theme-color"]');

  const aplicar = (tema, { guardar = true } = {}) => {
    document.documentElement.dataset.tema = tema;
    metaColor?.setAttribute('content', COLOR_BARRA[tema]);
    for (const op of opciones) {
      const activo = op.dataset.temaOpcion === tema;
      op.setAttribute('aria-checked', String(activo));
      op.tabIndex = activo ? 0 : -1;
    }
    if (guardar) {
      try {
        localStorage.setItem(CLAVE_TEMA, tema);
      } catch {
        /* Navegación privada: el tema vale solo para esta visita. */
      }
    }
  };

  grupo.addEventListener('click', (e) => {
    const op = e.target.closest('[data-tema-opcion]');
    if (op) aplicar(op.dataset.temaOpcion);
  });

  grupo.addEventListener('keydown', (e) => {
    const paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!paso) return;
    e.preventDefault();
    const actual = TEMAS.indexOf(document.documentElement.dataset.tema);
    const siguiente = TEMAS[(actual + paso + TEMAS.length) % TEMAS.length];
    aplicar(siguiente);
    opciones.find((op) => op.dataset.temaOpcion === siguiente)?.focus();
  });

  aplicar(TEMAS.includes(document.documentElement.dataset.tema) ? document.documentElement.dataset.tema : 'negro', { guardar: false });
}
