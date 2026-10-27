import { t, valor } from '../../i18n.js';
import { h, icon } from '../../utils/dom.js';
import { formatDolares, formatKm, formatPrecio, tituloAuto } from '../../utils/format.js';
import { fotoAuto } from '../../utils/portada.js';
import { favoritos } from './favoritos.js';

export const hrefAuto = (auto) => `#carro/${encodeURIComponent(auto.id)}`;

const NO_DISPONIBLE = ['reservado', 'vendido'];

/** Etiqueta sobre la imagen: el estado si no está disponible, si no el tipo de auto. */
export const etiquetaAuto = (auto) =>
  NO_DISPONIBLE.includes(auto.estado)
    ? h('span', { class: 'tag tag--claro' }, valor('estado', auto.estado))
    : h('span', { class: 'tag' }, valor('tipo', auto.tipo));

/** Línea de datos: año, km, transmisión y combustible. */
export const metaAuto = (auto) =>
  [auto.anio, formatKm(auto.kilometraje), valor('transmision', auto.transmision), valor('combustible', auto.combustible)]
    .map((v) => String(v).toLowerCase())
    .join(' • ');

/** Precio en colones + aproximado en dólares (si hay tipo de cambio configurado). */
export const precioAuto = (auto, clase = 'card') =>
  h(
    'p',
    { class: `${clase}__precio` },
    h('span', { class: `${clase}__price` }, formatPrecio(auto.precio)),
    formatDolares(auto.precio) && h('span', { class: `${clase}__usd` }, formatDolares(auto.precio)),
  );

/** Foto de portada del auto (la primera de "fotos"). */
export const portadaAuto = (auto, opciones = {}) =>
  fotoAuto(auto.fotos[0], { alt: t('card.foto', { auto: tituloAuto(auto), color: auto.color || '' }), ...opciones });

/** Corazón de favoritos. Queda por encima del link estirado de la tarjeta. */
export function botonFavorito(auto) {
  return h(
    'button',
    {
      type: 'button',
      class: 'favorito',
      'aria-pressed': String(favoritos.tiene(auto.id)),
      'aria-label': t('card.favorito', { auto: tituloAuto(auto) }),
      onclick: (e) => {
        e.preventDefault();
        e.currentTarget.setAttribute('aria-pressed', String(favoritos.alternar(auto.id)));
      },
    },
    icon('heart', 'favorito__vacio'),
    icon('heart-fill', 'favorito__lleno'),
  );
}

/**
 * Tarjeta del inventario: foto a sangre arriba; marca como sobretítulo y modelo en mayúsculas;
 * abajo, separado por un filete, el precio y una flecha redonda.
 * El título es un link "estirado" que cubre toda la tarjeta y abre la ficha; la flecha hace
 * lo mismo (con su nombre accesible). El corazón queda por encima.
 */
export function carCard(auto, { index = 0 } = {}) {
  return h(
    'article',
    { class: 'card', dataset: { estado: auto.estado, id: auto.id }, style: `--i:${index}` },
    h('div', { class: 'card__media' }, portadaAuto(auto, { eager: index < 3 }), etiquetaAuto(auto), botonFavorito(auto)),
    h(
      'div',
      { class: 'card__body' },
      h(
        'h3',
        { class: 'card__title' },
        h('a', { class: 'card__link', href: hrefAuto(auto) }, h('span', { class: 'card__marca' }, auto.marca), ' ', auto.modelo),
      ),
      h('p', { class: 'card__meta' }, metaAuto(auto)),
      h(
        'div',
        { class: 'card__pie' },
        precioAuto(auto),
        h(
          'a',
          {
            class: 'card__cta',
            href: hrefAuto(auto),
            'aria-label': t('card.verDetallesDe', { auto: tituloAuto(auto) }),
            title: auto.estado === 'vendido' ? t('card.vendido') : t('card.verDetalles'),
          },
          icon('arrow-right'),
        ),
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
