import { campoAuto, t, valor } from '../../i18n.js';
import { h, icon } from '../../utils/dom.js';
import { formatFecha, formatKm, tituloAuto } from '../../utils/format.js';
import { fotoAuto } from '../../utils/portada.js';
import { linkWhatsApp, mensajeInteres } from '../../utils/whatsapp.js';
import { carCard, etiquetaAuto, metaAuto, precioAuto } from '../catalog/carCard.js';

/** Ficha técnica: [etiqueta, valor]. Se omiten los campos vacíos. */
const especificaciones = (auto) =>
  [
    [t('spec.anio'), auto.anio],
    [t('spec.km'), formatKm(auto.kilometraje)],
    [t('spec.transmision'), valor('transmision', auto.transmision)],
    [t('spec.combustible'), valor('combustible', auto.combustible)],
    [t('spec.motor'), auto.motor],
    [t('spec.traccion'), auto.traccion],
    [t('spec.color'), valor('color', auto.color)],
    [t('spec.tipo'), valor('tipo', auto.tipo)],
    [t('spec.ubicacion'), [auto.canton, auto.provincia].filter(Boolean).join(', ')],
  ].filter(([, v]) => v !== '' && v !== undefined);

const checks = (items) => h('ul', { class: 'checks' }, items.map((texto) => h('li', {}, icon('check'), texto)));

/** Galería: foto grande + miniaturas para cambiarla. */
function galeria(auto) {
  const total = auto.fotos.length;
  const altDe = (i) => t('ficha.fotoN', { auto: tituloAuto(auto), n: i + 1, total });
  const principal = fotoAuto(auto.fotos[0], { alt: altDe(0), eager: true, clase: 'galeria__principal' });
  const marco = h('div', { class: 'galeria__marco' }, principal, etiquetaAuto(auto));
  if (total < 2) return h('div', { class: 'galeria' }, marco);

  const miniaturas = auto.fotos.map((src, i) =>
    h(
      'button',
      {
        type: 'button',
        class: 'galeria__thumb',
        'aria-label': t('ficha.verFoto', { n: i + 1 }),
        'aria-current': String(i === 0),
        onclick: (e) => {
          principal.classList.remove('foto--rota');
          principal.src = src;
          principal.alt = altDe(i);
          for (const b of e.currentTarget.parentElement.children) b.setAttribute('aria-current', 'false');
          e.currentTarget.setAttribute('aria-current', 'true');
        },
      },
      fotoAuto(src),
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
    texto.textContent = t('ficha.copiado');
    setTimeout(() => (texto.textContent = t('ficha.compartir')), 2000);
  } catch {
    /* El usuario canceló el diálogo de compartir. */
  }
}

function acciones(auto) {
  if (auto.estado === 'vendido') {
    return h(
      'div',
      { class: 'ficha__acciones' },
      h('p', { class: 'ficha__aviso' }, t('ficha.vendido')),
      h('a', { class: 'btn btn--primary btn--block', href: '#carros', 'data-cerrar': '' }, t('ficha.verOtros')),
    );
  }

  const wa = (mensaje) => ({ href: linkWhatsApp(mensaje), target: '_blank', rel: 'noopener noreferrer' });
  return h(
    'div',
    { class: 'ficha__acciones' },
    h('a', { class: 'btn btn--primary btn--lg btn--block', ...wa(mensajeInteres(auto)) }, icon('chat-circle'), t('ficha.consultar')),
    h(
      'button',
      { type: 'button', class: 'btn btn--texto', onclick: (e) => compartir(auto, e.currentTarget) },
      icon('share-network'),
      h('span', {}, t('ficha.compartir')),
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
    tabs.forEach((tab, j) => {
      tab.setAttribute('aria-selected', String(i === j));
      tab.tabIndex = i === j ? 0 : -1;
      cuerpos[j].hidden = i !== j;
    });
    tabs[i].focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activar(i));
    tab.addEventListener('keydown', (e) => {
      const paso = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (paso) activar((i + paso + tabs.length) % tabs.length);
    });
  });

  return h('div', { class: 'pestanas' }, h('div', { class: 'pestanas__lista', role: 'tablist', 'aria-label': t('ficha.tabs') }, tabs), cuerpos);
}

function contenido(auto, similares) {
  const extras = campoAuto(auto, 'extras') ?? [];
  const descripcion = campoAuto(auto, 'descripcion');
  return h(
    'div',
    { class: 'ficha' },
    h(
      'div',
      { class: 'ficha__top' },
      galeria(auto),
      h(
        'div',
        { class: 'ficha__panel' },
        h('p', { class: 'ficha__marca' }, t('ficha.ficha', { id: auto.id.toLowerCase() })),
        h('h2', { class: 'ficha__titulo', id: 'ficha-titulo' }, `${auto.marca} ${auto.modelo}`),
        h('p', { class: 'ficha__meta' }, [auto.version, metaAuto(auto)].filter(Boolean).join(' · ')),
        precioAuto(auto, 'ficha'),
        acciones(auto),
        checks([t('ficha.check1'), t('ficha.check2')]),
      ),
    ),
    pestanas(`ficha-${auto.id}`, [
      [
        t('ficha.tabDescripcion'),
        h(
          'div',
          { class: 'ficha__descripcion-grid' },
          h(
            'div',
            {},
            descripcion && h('p', { class: 'ficha__descripcion' }, descripcion),
            h('p', { class: 'ficha__nota' }, icon('shield-check'), t('ficha.nota')),
            auto.publicado && h('p', { class: 'ficha__fecha' }, t('ficha.publicado', { fecha: formatFecha(auto.publicado) })),
          ),
          extras.length > 0 && checks(extras),
        ),
      ],
      [
        t('ficha.tabTecnica'),
        h('dl', { class: 'specs' }, especificaciones(auto).map(([k, v]) => h('div', { class: 'specs__item' }, h('dt', {}, k), h('dd', {}, v)))),
      ],
      [
        t('ficha.tabProceso'),
        h(
          'ol',
          { class: 'proceso' },
          [1, 2].map((n) =>
            h('li', { class: 'proceso__paso' }, h('span', { class: 'proceso__num' }, `0${n}`), h('h3', {}, t(`proceso.${n}t`)), h('p', {}, t(`proceso.${n}p`))),
          ),
        ),
      ],
    ]),
    similares.length > 0 &&
      h(
        'section',
        { class: 'similares', 'aria-labelledby': 'similares-titulo' },
        h('span', { class: 'sobretitulo' }, t('ficha.similaresSobre')),
        h('h2', { class: 'titulo titulo--sm', id: 'similares-titulo' }, t('ficha.similares')),
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
  let autoActual = null;

  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('dialogo-abierto');
    autoActual = null;
    onClose?.();
  });
  // Clic en el fondo (fuera del panel) cierra.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-cerrar]')) dialog.close();
  });

  return {
    abrir(auto) {
      autoActual = auto;
      cuerpo.replaceChildren(contenido(auto, obtenerSimilares(auto)));
      document.title = `${tituloAuto(auto)} | Solera`;
      if (!dialog.open) dialog.showModal();
      document.documentElement.classList.add('dialogo-abierto');
      cuerpo.scrollTop = 0;
    },
    /** Vuelve a pintar la ficha abierta (por ejemplo, al cambiar de idioma). */
    refrescar() {
      if (dialog.open && autoActual) cuerpo.replaceChildren(contenido(autoActual, obtenerSimilares(autoActual)));
    },
    cerrar() {
      if (dialog.open) dialog.close();
    },
    get abierto() {
      return dialog.open;
    },
  };
}
