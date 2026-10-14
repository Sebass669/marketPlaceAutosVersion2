import { h, icon } from '../../utils/dom.js';
import { formatFecha, formatKm, tituloAuto } from '../../utils/format.js';
import { imagenesAuto, respaldoFoto } from '../../utils/portada.js';
import { linkWhatsApp, mensajeAgendar, mensajeInteres } from '../../utils/whatsapp.js';
import { carCard, etiquetaAuto, metaAuto, precioAuto } from '../catalog/carCard.js';

/** Ficha técnica: [etiqueta, valor]. Se omiten los campos vacíos. */
const especificaciones = (auto) =>
  [
    ['Año', auto.anio],
    ['Kilometraje', formatKm(auto.kilometraje)],
    ['Transmisión', auto.transmision],
    ['Combustible', auto.combustible],
    ['Motor', auto.motor],
    ['Tracción', auto.traccion],
    ['Color', auto.color],
    ['Tipo', auto.tipo],
    ['Ubicación', [auto.canton, auto.provincia].filter(Boolean).join(', ')],
  ].filter(([, valor]) => valor !== '' && valor !== undefined);

const PROCESO = [
  ['Nos escribís', 'Consultás por WhatsApp desde esta ficha y te confirmamos disponibilidad.'],
  ['Coordinamos la visita', 'Acordamos con el dueño un día y un lugar para verlo y probarlo.'],
  ['Revisás y cerrás', 'Pedí el estudio registral y la revisión mecánica antes de pagar.'],
];

const checks = (items) => h('ul', { class: 'checks' }, items.map((t) => h('li', {}, icon('check'), t)));

function galeria(auto) {
  const imagenes = imagenesAuto(auto);
  const principal = h('img', {
    class: 'galeria__principal',
    src: imagenes[0],
    alt: `${tituloAuto(auto)}, imagen 1 de ${imagenes.length}`,
    width: 800,
    height: 600,
    onerror: respaldoFoto(auto),
  });

  const marco = h('div', { class: 'galeria__marco' }, principal, etiquetaAuto(auto));
  if (imagenes.length === 1) return h('div', { class: 'galeria' }, marco);

  const miniaturas = imagenes.map((src, i) =>
    h(
      'button',
      {
        type: 'button',
        class: 'galeria__thumb',
        'aria-label': `Ver imagen ${i + 1}`,
        'aria-current': i === 0 ? 'true' : 'false',
        onclick: (e) => {
          delete principal.dataset.respaldo;
          principal.src = src;
          principal.alt = `${tituloAuto(auto)}, imagen ${i + 1} de ${imagenes.length}`;
          for (const btn of e.currentTarget.parentElement.children) btn.setAttribute('aria-current', 'false');
          e.currentTarget.setAttribute('aria-current', 'true');
        },
      },
      h('img', { src, alt: '', loading: 'lazy', onerror: (ev) => ev.currentTarget.closest('button').remove() }),
    ),
  );

  return h('div', { class: 'galeria' }, marco, h('div', { class: 'galeria__thumbs' }, miniaturas));
}

async function compartir(auto, boton) {
  const url = location.href;
  const texto = boton.querySelector('span');
  try {
    if (navigator.share) {
      await navigator.share({ title: tituloAuto(auto), url });
      return;
    }
    await navigator.clipboard.writeText(url);
    texto.textContent = 'link copiado';
    setTimeout(() => (texto.textContent = 'compartir'), 2000);
  } catch {
    /* El usuario canceló el diálogo de compartir. */
  }
}

function acciones(auto) {
  if (auto.estado === 'vendido') {
    return h(
      'div',
      { class: 'ficha__acciones' },
      h('p', { class: 'ficha__aviso' }, 'este auto ya se vendió'),
      h('a', { class: 'btn btn--primary btn--block', href: '#carros', 'data-cerrar': '' }, 'ver otros autos'),
    );
  }

  const wa = (mensaje) => ({ href: linkWhatsApp(mensaje), target: '_blank', rel: 'noopener' });
  return h(
    'div',
    { class: 'ficha__acciones' },
    h('a', { class: 'btn btn--primary btn--lg btn--block', ...wa(mensajeInteres(auto)) }, icon('chat-circle'), 'consultar por whatsapp'),
    h('a', { class: 'btn btn--ghost btn--lg btn--block', ...wa(mensajeAgendar(auto)) }, icon('calendar-blank'), 'agendar visita'),
    h(
      'button',
      { type: 'button', class: 'btn btn--texto', onclick: (e) => compartir(auto, e.currentTarget) },
      icon('share-network'),
      h('span', {}, 'compartir'),
    ),
  );
}

/** Pestañas accesibles (role=tablist) con flechas izquierda/derecha. */
function pestanas(id, paneles) {
  const tabs = paneles.map(([nombre], i) =>
    h(
      'button',
      {
        type: 'button',
        role: 'tab',
        class: 'pestanas__tab',
        id: `${id}-tab-${i}`,
        'aria-controls': `${id}-panel-${i}`,
        'aria-selected': String(i === 0),
        tabindex: i === 0 ? '0' : '-1',
      },
      nombre,
    ),
  );
  const cuerpos = paneles.map(([, contenido], i) =>
    h('div', { role: 'tabpanel', class: 'pestanas__panel', id: `${id}-panel-${i}`, 'aria-labelledby': `${id}-tab-${i}`, hidden: i !== 0 }, contenido),
  );

  const activar = (i) => {
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(i === j));
      t.tabIndex = i === j ? 0 : -1;
      cuerpos[j].hidden = i !== j;
    });
    tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activar(i));
    t.addEventListener('keydown', (e) => {
      const paso = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (paso) activar((i + paso + tabs.length) % tabs.length);
    });
  });

  return h('div', { class: 'pestanas' }, h('div', { class: 'pestanas__lista', role: 'tablist', 'aria-label': 'Información del auto' }, tabs), cuerpos);
}

function contenido(auto, similares) {
  return h(
    'div',
    { class: 'ficha' },
    h(
      'div',
      { class: 'ficha__top' },
      galeria(auto),
      h(
        'div',
        { class: 'panel ficha__panel' },
        h('p', { class: 'ficha__marca' }, `ficha ${auto.id}`),
        h('h2', { class: 'ficha__titulo', id: 'ficha-titulo' }, `${auto.marca} ${auto.modelo}`),
        h('p', { class: 'ficha__meta' }, [auto.version, metaAuto(auto)].filter(Boolean).join(' · ')),
        precioAuto(auto, 'ficha'),
        acciones(auto),
        checks(['Vendido por su dueño, sin lotes', 'Anuncio revisado por Solera', 'Coordinamos la visita por WhatsApp']),
      ),
    ),
    pestanas(`ficha-${auto.id}`, [
      [
        'descripción',
        h(
          'div',
          { class: 'ficha__descripcion-grid' },
          h(
            'div',
            {},
            auto.descripcion && h('p', { class: 'ficha__descripcion' }, auto.descripcion),
            h(
              'p',
              { class: 'ficha__nota' },
              icon('shield-check'),
              'Antes de pagar, pedí el estudio registral en el Registro Nacional y llevalo a revisar con tu mecánico.',
            ),
            auto.publicado && h('p', { class: 'ficha__fecha' }, `Publicado el ${formatFecha(auto.publicado)}`),
          ),
          auto.extras.length > 0 && checks(auto.extras),
        ),
      ],
      [
        'ficha técnica',
        h('dl', { class: 'specs' }, especificaciones(auto).map(([k, v]) => h('div', { class: 'specs__item' }, h('dt', {}, k), h('dd', {}, v)))),
      ],
      [
        'proceso de compra',
        h(
          'ol',
          { class: 'proceso' },
          PROCESO.map(([titulo, texto], i) =>
            h('li', { class: 'proceso__paso' }, h('span', { class: 'proceso__num' }, `0${i + 1}`), h('h3', {}, titulo), h('p', {}, texto)),
          ),
        ),
      ],
    ]),
    similares.length > 0 &&
      h(
        'section',
        { class: 'similares', 'aria-labelledby': 'similares-titulo' },
        h('span', { class: 'sobretitulo' }, 'te puede interesar'),
        h('h2', { class: 'titulo titulo--sm', id: 'similares-titulo' }, 'autos similares'),
        h('div', { class: 'grid-autos grid-autos--3' }, similares.map((a, i) => carCard(a, { index: i }))),
      ),
  );
}

/**
 * Envuelve el <dialog> nativo. El diálogo da gratis el foco atrapado,
 * cierre con Escape y el fondo inerte.
 * `obtenerSimilares(auto)` devuelve los autos a sugerir al pie de la ficha.
 */
export function createCarDialog({ dialog, onClose, obtenerSimilares = () => [] }) {
  const cuerpo = dialog.querySelector('[data-dialog-body]');

  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('dialogo-abierto');
    onClose?.();
  });
  // Clic en el fondo (fuera del panel) cierra.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-cerrar]')) dialog.close();
  });

  return {
    abrir(auto) {
      cuerpo.replaceChildren(contenido(auto, obtenerSimilares(auto)));
      document.title = `${tituloAuto(auto)} | Solera`;
      if (!dialog.open) dialog.showModal();
      document.documentElement.classList.add('dialogo-abierto');
      cuerpo.scrollTop = 0;
    },
    cerrar() {
      if (dialog.open) dialog.close();
    },
    get abierto() {
      return dialog.open;
    },
  };
}
