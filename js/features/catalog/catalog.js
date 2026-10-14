import { CATALOGO } from '../../config.js';
import { $, $$, h, icon } from '../../utils/dom.js';
import { formatMillones } from '../../utils/format.js';
import { carCard, cardSkeleton } from './carCard.js';
import { favoritos } from './favoritos.js';
import { FILTROS_INICIALES, OPCIONES_ORDEN, aplicarFiltros, contarPor, hayFiltrosActivos, valoresUnicos } from './filters.js';

/** Grupos de chips: campo del auto -> orden preferido de sus valores (si existe). */
const GRUPOS_CHIPS = { tipo: CATALOGO.tipos, transmision: null, combustible: null };

/**
 * Controla la sección de inventario: panel de filtros, conteo, orden y grilla.
 * El markup estático vive en index.html; aquí solo se pinta lo que depende de los datos.
 */
export function createCatalog({ root }) {
  const form = $('[data-filtros]', root);
  const grid = $('[data-grid]', root);
  const conteo = $('[data-conteo]', root);
  const listaMarcas = $('[data-marcas]', root);
  const conteoFavoritos = $('[data-conteo-favoritos]', root);

  let autos = [];
  let filtros = { ...FILTROS_INICIALES, marcas: [] };

  function pintarChips() {
    for (const [campo, ordenPreferido] of Object.entries(GRUPOS_CHIPS)) {
      const cont = $(`[data-chips="${campo}"]`, root);
      const presentes = valoresUnicos(autos, campo);
      const valores = ordenPreferido ? ordenPreferido.filter((v) => presentes.includes(v)) : presentes;
      cont.replaceChildren(
        ...valores.map((valor) =>
          h(
            'button',
            {
              type: 'button',
              class: 'chip',
              'aria-pressed': String(filtros[campo] === valor),
              onclick: () => actualizar({ [campo]: filtros[campo] === valor ? '' : valor }),
            },
            valor,
          ),
        ),
      );
    }
  }

  function pintarMarcas() {
    const conteos = contarPor(autos, 'marca');
    listaMarcas.replaceChildren(
      ...valoresUnicos(autos, 'marca').map((marca) =>
        h(
          'label',
          { class: 'check' },
          h('input', { type: 'checkbox', name: 'marca', value: marca }),
          h('span', { class: 'check__caja', 'aria-hidden': 'true' }, icon('check')),
          h('span', { class: 'check__texto' }, marca.toLowerCase()),
          h('span', { class: 'check__num' }, conteos[marca]),
        ),
      ),
    );
  }

  function pintarSelect(name, opciones, etiquetaTodos) {
    form.elements[name].replaceChildren(
      ...(etiquetaTodos ? [h('option', { value: '' }, etiquetaTodos)] : []),
      ...opciones.map(([value, label]) => h('option', { value }, label)),
    );
  }

  function pintarGrilla() {
    const lista = aplicarFiltros(autos, filtros, favoritos.ids);
    const disponibles = lista.filter((a) => a.estado === 'disponible').length;

    conteo.textContent =
      lista.length === 0
        ? 'Sin resultados'
        : `${lista.length} ${lista.length === 1 ? 'auto encontrado' : 'autos encontrados'} · ${disponibles} ${disponibles === 1 ? 'disponible' : 'disponibles'}`;

    grid.replaceChildren(...(lista.length ? lista.map((auto, index) => carCard(auto, { index })) : [estadoVacio()]));
  }

  function estadoVacio() {
    return h(
      'div',
      { class: 'estado-panel' },
      icon('magnifying-glass', 'estado-panel__icon'),
      h('p', { class: 'estado-panel__title' }, filtros.soloFavoritos ? 'todavía no tenés favoritos' : 'ningún auto coincide'),
      h(
        'p',
        {},
        filtros.soloFavoritos
          ? 'Tocá el corazón de un auto para guardarlo aquí.'
          : 'Probá con menos filtros o escribinos y te avisamos cuando entre uno así.',
      ),
      h('button', { type: 'button', class: 'btn btn--ghost', onclick: limpiar }, 'limpiar filtros'),
    );
  }

  function actualizar(cambios) {
    filtros = { ...filtros, ...cambios };
    form.toggleAttribute('data-activos', hayFiltrosActivos(filtros));
    pintarChips();
    pintarGrilla();
  }

  function limpiar() {
    form.reset();
    actualizar({ ...FILTROS_INICIALES, marcas: [] });
  }

  function leerFormulario() {
    const datos = new FormData(form);
    actualizar({
      q: String(datos.get('q') ?? ''),
      marcas: datos.getAll('marca').map(String),
      provincia: String(datos.get('provincia') ?? ''),
      precioMax: Number(datos.get('precioMax')) || 0,
      soloFavoritos: datos.has('soloFavoritos'),
      orden: String(datos.get('orden') || 'recientes'),
    });
  }

  function pintarConteoFavoritos() {
    conteoFavoritos.textContent = favoritos.ids.size;
  }

  // El selector de orden vive fuera del <form> (en la barra del inventario) y se asocia con
  // el atributo form="filtros"; por eso escuchamos en la sección y filtramos por formulario.
  root.addEventListener('input', (e) => {
    if (e.target.form === form) leerFormulario();
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('reset', () => queueMicrotask(limpiar));

  favoritos.alCambiar(() => {
    pintarConteoFavoritos();
    if (filtros.soloFavoritos) pintarGrilla();
  });

  return {
    mostrarCargando(cantidad = 6) {
      grid.setAttribute('aria-busy', 'true');
      grid.replaceChildren(...Array.from({ length: cantidad }, cardSkeleton));
    },

    mostrarError(mensaje) {
      grid.removeAttribute('aria-busy');
      conteo.textContent = '';
      grid.replaceChildren(
        h(
          'div',
          { class: 'estado-panel estado-panel--error', role: 'alert' },
          icon('warning-circle', 'estado-panel__icon'),
          h('p', { class: 'estado-panel__title' }, 'no pudimos cargar los autos'),
          h('p', {}, mensaje),
          h('button', { type: 'button', class: 'btn btn--ghost', onclick: () => location.reload() }, 'reintentar'),
        ),
      );
    },

    setAutos(lista) {
      autos = lista;
      grid.removeAttribute('aria-busy');
      pintarMarcas();
      pintarSelect(
        'provincia',
        CATALOGO.provincias.filter((p) => autos.some((a) => a.provincia === p)).map((p) => [p, p]),
        'Todo el país',
      );
      pintarSelect('precioMax', CATALOGO.preciosMaximos.map((v) => [v, `Hasta ${formatMillones(v)}`]), 'Cualquier precio');
      pintarSelect('orden', OPCIONES_ORDEN);
      pintarConteoFavoritos();
      actualizar({});
    },

    /** Aplica un filtro desde fuera (ej. links del pie de página) y lleva al inventario. */
    filtrarPor(campo, valor) {
      limpiar();
      actualizar({ [campo]: valor });
      root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    },
  };
}

/** Links con data-filtro="campo:valor" (pie de página) filtran el inventario. */
export function initLinksFiltro(catalogo) {
  $$('[data-filtro]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const [campo, valor] = a.dataset.filtro.split(':');
      catalogo.filtrarPor(campo, valor);
    }),
  );
}
