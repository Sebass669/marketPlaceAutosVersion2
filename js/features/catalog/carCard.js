import { h, icon } from '../../utils/dom.js';
import { formatDolares, formatKm, formatPrecio, tituloAuto } from '../../utils/format.js';
import { imagenesAuto, respaldoFoto } from '../../utils/portada.js';
import { linkWhatsApp, mensajeInteres } from '../../utils/whatsapp.js';
import { favoritos } from './favoritos.js';

export const ETIQUETA_ESTADO = { reservado: 'reservado', vendido: 'vendido' };

export const hrefAuto = (auto) => `#carro/${encodeURIComponent(auto.id)}`;

/** Etiqueta sobre la imagen: el estado si no está disponible, si no el tipo de auto. */
export const etiquetaAuto = (auto) =>
  h('span', { class: `tag${ETIQUETA_ESTADO[auto.estado] ? ' tag--claro' : ''}` }, ETIQUETA_ESTADO[auto.estado] ?? auto.tipo);

/** Línea de datos: año, km, transmisión y combustible. */
export const metaAuto = (auto) =>
  [auto.anio, formatKm(auto.kilometraje), auto.transmision, auto.combustible].map((v) => String(v).toLowerCase()).join(' • ');

/** Precio en colones + aproximado en dólares (si hay tipo de cambio configurado). */
export const precioAuto = (auto, clase = 'card') =>
  h(
    'p',
    { class: `${clase}__precio` },
    h('span', { class: `${clase}__price` }, formatPrecio(auto.precio)),
    formatDolares(auto.precio) && h('span', { class: `${clase}__usd` }, formatDolares(auto.precio)),
  );

/** Corazón de favoritos. Queda por encima del link estirado de la tarjeta. */
export function botonFavorito(auto) {
  const activo = favoritos.tiene(auto.id);
  return h(
    'button',
    {
      type: 'button',
      class: 'favorito',
      'aria-pressed': String(activo),
      'aria-label': `Guardar ${tituloAuto(auto)} en favoritos`,
      onclick: (e) => {
        e.preventDefault();
        const nuevo = favoritos.alternar(auto.id);
        e.currentTarget.setAttribute('aria-pressed', String(nuevo));
      },
    },
    icon('heart', 'favorito__vacio'),
    icon('heart-fill', 'favorito__lleno'),
  );
}

export function portadaImg(auto, { eager = false } = {}) {
  return h('img', {
    src: imagenesAuto(auto)[0],
    alt: `${tituloAuto(auto)}, color ${auto.color || 'no indicado'}`,
    loading: eager ? 'eager' : 'lazy',
    decoding: 'async',
    width: 800,
    height: 600,
    onerror: respaldoFoto(auto),
  });
}

/**
 * Tarjeta del inventario. El título es un link "estirado" que cubre toda la tarjeta
 * (abre la ficha); el corazón y el botón de WhatsApp quedan por encima, sin anidar links.
 */
export function carCard(auto, { index = 0 } = {}) {
  const vendido = auto.estado === 'vendido';

  return h(
    'article',
    { class: 'card', dataset: { estado: auto.estado, id: auto.id }, style: `--i:${index}` },
    h('div', { class: 'card__media' }, portadaImg(auto, { eager: index < 3 }), etiquetaAuto(auto), botonFavorito(auto)),
    h(
      'div',
      { class: 'card__body' },
      h('h3', { class: 'card__title' }, h('a', { class: 'card__link', href: hrefAuto(auto) }, `${auto.marca} ${auto.modelo}`)),
      h('p', { class: 'card__meta' }, metaAuto(auto)),
      precioAuto(auto),
      vendido
        ? h('span', { class: 'btn btn--ghost btn--block card__cta', 'aria-disabled': 'true' }, 'vendido')
        : h(
            'a',
            {
              class: 'btn btn--primary btn--block card__cta',
              href: linkWhatsApp(mensajeInteres(auto)),
              target: '_blank',
              rel: 'noopener',
              'aria-label': `Consultar por WhatsApp: ${tituloAuto(auto)}`,
            },
            icon('chat-circle'),
            'consultar por whatsapp',
          ),
    ),
  );
}

/** Esqueleto con la misma forma que la tarjeta, mientras carga el JSON. */
export function cardSkeleton() {
  return h(
    'div',
    { class: 'card card--skeleton', 'aria-hidden': 'true' },
    h('div', { class: 'card__media skeleton' }),
    h(
      'div',
      { class: 'card__body' },
      h('div', { class: 'skeleton skeleton--title' }),
      h('div', { class: 'skeleton skeleton--line', style: 'width:70%' }),
      h('div', { class: 'skeleton skeleton--line', style: 'width:40%;height:1.4rem' }),
    ),
  );
}
