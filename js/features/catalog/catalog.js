import { CATALOGO } from '../../config.js';
import { alCambiarIdioma, t, valor } from '../../i18n.js';
import { $, $$, h, icon } from '../../utils/dom.js';
import { limpiarTexto } from '../../utils/seguridad.js';
import { carCard, cardSkeleton } from './carCard.js';
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

  let autos = [];
  let filtros = { ...FILTROS_INICIALES, marcas: [] };
  let mensajeError = '';

  function pintarChips() {
    for (const [campo, ordenPreferido] of Object.entries(GRUPOS_CHIPS)) {
      const cont = $(`[data-chips="${campo}"]`, root);
      const presentes = valoresUnicos(autos, campo);
      const valores = ordenPreferido ? ordenPreferido.filter((v) => presentes.includes(v)) : presentes;
      cont.replaceChildren(
        ...valores.map((v) =>
          h(
            'button',
            {
              type: 'button',
              class: 'chip',
              'aria-pressed': String(filtros[campo] === v),
              onclick: () => actualizar({ [campo]: filtros[campo] === v ? '' : v }),
            },
            valor(campo, v),
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
          h('input', { type: 'checkbox', name: 'marca', value: marca, checked: filtros.marcas.includes(marca) }),
          h('span', { class: 'check__caja', 'aria-hidden': 'true' }, icon('check')),
          h('span', { class: 'check__texto' }, marca.toLowerCase()),
          h('span', { class: 'check__num' }, conteos[marca]),
        ),
      ),
    );
  }

  /** Rellena un select conservando el valor elegido (útil al cambiar de idioma). */
  function pintarSelect(name, opciones, etiquetaTodos) {
    const select = form.elements[name];
    const elegido = select.value;
    select.replaceChildren(
      ...(etiquetaTodos ? [h('option', { value: '' }, etiquetaTodos)] : []),
      ...opciones.map(([value, label]) => h('option', { value }, label)),
    );
    if ([...select.options].some((o) => o.value === elegido)) select.value = elegido;
  }

  function pintarSelects() {
    pintarSelect(
      'provincia',
      CATALOGO.provincias.filter((p) => autos.some((a) => a.provincia === p)).map((p) => [p, p]),
      t('filtro.todoPais'),
    );
    pintarSelect('precioMax', CATALOGO.preciosMaximos.map((v) => [v, t('filtro.hasta', { n: v / 1_000_000 })]), t('filtro.cualquierPrecio'));
    pintarSelect('orden', OPCIONES_ORDEN.map((clave) => [clave, t(`orden.${clave}`)]));
  }

  function pintarGrilla() {
    const lista = aplicarFiltros(autos, filtros);
    const disponibles = lista.filter((a) => a.estado === 'disponible').length;

    conteo.textContent =
      lista.length === 0
        ? t('conteo.vacio')
        : t('conteo.resultado', {
            n: lista.length,
            autos: t(lista.length === 1 ? 'conteo.auto' : 'conteo.autos'),
            d: disponibles,
            disponibles: t(disponibles === 1 ? 'conteo.disponible' : 'conteo.disponibles'),
          });

    grid.replaceChildren(...(lista.length ? lista.map((auto, index) => carCard(auto, { index })) : [estadoVacio()]));
  }

  function estadoVacio() {
    return h(
      'div',
      { class: 'estado-panel' },
      icon('magnifying-glass', 'estado-panel__icon'),
      h('p', { class: 'estado-panel__title' }, t('vacio.titulo')),
      h('p', {}, t('vacio.texto')),
      h('button', { type: 'button', class: 'btn btn--ghost', onclick: limpiar }, t('vacio.limpiar')),
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
      q: limpiarTexto(datos.get('q'), 60),
      marcas: datos.getAll('marca').map(String),
      provincia: String(datos.get('provincia') ?? ''),
      precioMax: Number(datos.get('precioMax')) || 0,
      orden: String(datos.get('orden') || 'recientes'),
    });
  }

  function pintarError() {
    grid.replaceChildren(
      h(
        'div',
        { class: 'estado-panel estado-panel--error', role: 'alert' },
        icon('warning-circle', 'estado-panel__icon'),
        h('p', { class: 'estado-panel__title' }, t('error.titulo')),
        h('p', {}, mensajeError),
        h('button', { type: 'button', class: 'btn btn--ghost', onclick: () => location.reload() }, t('error.reintentar')),
      ),
    );
  }

  // El selector de orden vive fuera del <form> (en la barra del inventario) y se asocia con
  // el atributo form="filtros"; por eso escuchamos en la sección y filtramos por formulario.
  root.addEventListener('input', (e) => {
    if (e.target.form === form) leerFormulario();
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('reset', () => queueMicrotask(limpiar));

  alCambiarIdioma(() => {
    if (mensajeError) return pintarError();
    if (!autos.length) return;
    pintarSelects();
    pintarChips();
    pintarGrilla();
  });

  return {
    mostrarCargando(cantidad = 6) {
      grid.setAttribute('aria-busy', 'true');
      grid.replaceChildren(...Array.from({ length: cantidad }, cardSkeleton));
    },

    mostrarError(mensaje) {
      mensajeError = mensaje;
      grid.removeAttribute('aria-busy');
      conteo.textContent = '';
      pintarError();
    },

    setAutos(lista) {
      autos = lista;
      grid.removeAttribute('aria-busy');
      pintarMarcas();
      pintarSelects();
      actualizar({});
    },

    /** Aplica un filtro desde fuera (ej. links del pie de página) y lleva al inventario. */
    filtrarPor(campo, v) {
      limpiar();
      actualizar({ [campo]: v });
      root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    },
  };
}

/** Links con data-filtro="campo:valor" (pie de página) filtran el inventario. */
export function initLinksFiltro(catalogo) {
  $$('[data-filtro]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const [campo, v] = a.dataset.filtro.split(':');
      catalogo.filtrarPor(campo, v);
    }),
  );
}
