import { normalizarTexto } from '../../utils/format.js';

export const FILTROS_INICIALES = Object.freeze({
  q: '',
  tipo: '',
  marcas: [],
  transmision: '',
  combustible: '',
  provincia: '',
  precioMax: 0,
  soloFavoritos: false,
  orden: 'recientes',
});

const PESO_ESTADO = { disponible: 0, reservado: 1, vendido: 2 };

const ORDENES = {
  recientes: (a, b) => (b.publicado || '').localeCompare(a.publicado || ''),
  'precio-asc': (a, b) => a.precio - b.precio,
  'precio-desc': (a, b) => b.precio - a.precio,
  km: (a, b) => a.kilometraje - b.kilometraje,
  anio: (a, b) => b.anio - a.anio,
};

export const OPCIONES_ORDEN = [
  ['recientes', 'ordenar: más recientes'],
  ['precio-asc', 'ordenar: menor precio'],
  ['precio-desc', 'ordenar: mayor precio'],
  ['km', 'ordenar: menos kilometraje'],
  ['anio', 'ordenar: año más nuevo'],
];

const textoBuscable = (auto) =>
  normalizarTexto([auto.marca, auto.modelo, auto.version, auto.anio, auto.color, auto.provincia, auto.canton].join(' '));

/** Función pura: recibe autos + filtros (+ ids favoritos) y devuelve la lista a mostrar. */
export function aplicarFiltros(autos, f, favoritos = new Set()) {
  const terminos = normalizarTexto(f.q).split(/\s+/).filter(Boolean);
  const ordenar = ORDENES[f.orden] ?? ORDENES.recientes;

  return autos
    .filter((auto) => {
      if (f.tipo && auto.tipo !== f.tipo) return false;
      if (f.marcas.length && !f.marcas.includes(auto.marca)) return false;
      if (f.transmision && auto.transmision !== f.transmision) return false;
      if (f.combustible && auto.combustible !== f.combustible) return false;
      if (f.provincia && auto.provincia !== f.provincia) return false;
      if (f.precioMax && auto.precio > f.precioMax) return false;
      if (f.soloFavoritos && !favoritos.has(auto.id)) return false;
      if (terminos.length) {
        const texto = textoBuscable(auto);
        if (!terminos.every((t) => texto.includes(t))) return false;
      }
      return true;
    })
    .sort((a, b) => PESO_ESTADO[a.estado] - PESO_ESTADO[b.estado] || ordenar(a, b));
}

export const hayFiltrosActivos = (f) =>
  Object.keys(FILTROS_INICIALES).some((k) => {
    if (k === 'orden') return false;
    const inicial = FILTROS_INICIALES[k];
    return Array.isArray(inicial) ? f[k].length > 0 : f[k] !== inicial;
  });

/** Valores únicos de un campo, ordenados, para poblar filtros. */
export const valoresUnicos = (autos, campo) =>
  [...new Set(autos.map((a) => a[campo]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'es'));

/** Cuántos autos hay por cada valor de un campo: { Toyota: 3, ... } */
export const contarPor = (autos, campo) =>
  autos.reduce((acc, a) => ((acc[a[campo]] = (acc[a[campo]] ?? 0) + 1), acc), {});
