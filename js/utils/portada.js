import { h } from './dom.js';

/**
 * Portada animada de un auto: fondo ilustrado (imagen estática) + carretera con líneas
 * que avanzan + el auto (SVG en línea) con ruedas que giran y un leve rebote.
 *
 * Las piezas las genera tools/ilustraciones.py:
 *   assets/ilustraciones/autos/<ID>-fondo.svg  y  <ID>-carro.svg
 * Si falta alguna (auto nuevo sin regenerar), se usa la portada genérica.
 *
 * Rendimiento: solo se anima mientras la portada está en pantalla (IntersectionObserver)
 * y nunca si el sistema pide reducir movimiento (lo resuelve el CSS).
 */
const DIR = 'assets/ilustraciones/autos';
const GENERICA = 'generico';
const cacheCarros = new Map();

const ruta = (id, pieza) => `${DIR}/${encodeURIComponent(id)}-${pieza}.svg`;

/** Descarga (una sola vez por auto) el SVG del carro. Es un archivo propio del sitio. */
function cargarCarro(id) {
  if (!cacheCarros.has(id)) {
    cacheCarros.set(
      id,
      fetch(ruta(id, 'carro'))
        .then((r) => {
          if (!r.ok) throw new Error(r.status);
          return r.text();
        })
        .then((texto) => {
          // Solo se acepta un <svg> sin scripts ni manejadores de eventos.
          if (!texto.trimStart().startsWith('<svg') || /<script|\son\w+=/i.test(texto)) throw new Error('svg no válido');
          return texto;
        }),
    );
  }
  return cacheCarros.get(id);
}

const visibles = 'IntersectionObserver' in window
  ? new IntersectionObserver((entradas) => {
      for (const e of entradas) e.target.classList.toggle('en-vista', e.isIntersecting);
    }, { rootMargin: '80px' })
  : null;

/** Crea la portada animada. `alt` describe la ilustración para lectores de pantalla. */
export function crearPortada(auto, { alt = '', eager = false, clase = '' } = {}) {
  const fondo = h('img', {
    class: 'portada__fondo',
    src: ruta(auto.id, 'fondo'),
    alt: '',
    width: 800,
    height: 600,
    loading: eager ? 'eager' : 'lazy',
    decoding: 'async',
    onerror: (e) => {
      if (!e.currentTarget.dataset.generica) {
        e.currentTarget.dataset.generica = '1';
        e.currentTarget.src = ruta(GENERICA, 'fondo');
      }
    },
  });
  const carro = h('div', { class: 'portada__carro', 'aria-hidden': 'true' });
  const portada = h(
    'div',
    { class: `portada ${clase}`.trim(), role: 'img', 'aria-label': alt },
    fondo,
    h('div', { class: 'portada__ruta', 'aria-hidden': 'true' }, h('span')),
    carro,
  );

  cargarCarro(auto.id)
    .catch(() => cargarCarro(GENERICA))
    .then((svg) => {
      carro.innerHTML = svg;
    })
    .catch(() => {
      /* Sin carro: queda solo el paisaje. */
    });

  visibles?.observe(portada);
  return portada;
}

/** Deja de observar las portadas de un contenedor antes de reemplazar su contenido. */
export function liberarPortadas(contenedor) {
  if (!visibles) return;
  for (const p of contenedor.querySelectorAll('.portada')) visibles.unobserve(p);
}
