import { SITE, CATALOGO } from '../config.js';

const CAMPOS_TEXTO = ['id', 'marca', 'modelo', 'tipo', 'transmision', 'combustible', 'provincia'];
const CAMPOS_NUMERO = ['anio', 'precio', 'kilometraje'];

/**
 * Revisa un auto del JSON. Devuelve la lista de problemas (vacía si está bien).
 * Pensado para que, si te equivocás editando el JSON a mano, la consola
 * del navegador te diga exactamente qué auto y qué campo revisar.
 */
function validar(auto) {
  const problemas = [];
  for (const campo of CAMPOS_TEXTO) {
    if (typeof auto[campo] !== 'string' || !auto[campo].trim()) problemas.push(`falta "${campo}"`);
  }
  for (const campo of CAMPOS_NUMERO) {
    if (!Number.isFinite(auto[campo]) || auto[campo] < 0) problemas.push(`"${campo}" debe ser un número`);
  }
  if (!Array.isArray(auto.fotos) || auto.fotos.length === 0) problemas.push('necesita al menos una foto en "fotos"');
  if (auto.estado && !CATALOGO.estados.includes(auto.estado)) {
    problemas.push(`"estado" debe ser uno de: ${CATALOGO.estados.join(', ')}`);
  }
  return problemas;
}

/** Completa valores opcionales para que el resto del código no tenga que adivinar. */
function normalizar(auto) {
  return {
    version: '',
    motor: '',
    traccion: '',
    color: '',
    canton: '',
    descripcion: '',
    extras: [],
    destacado: false,
    publicado: '',
    ...auto,
    estado: auto.estado ?? 'disponible',
  };
}

/** Carga, valida y normaliza el catálogo. Lanza un Error con mensaje legible si falla. */
export async function cargarAutos() {
  let respuesta;
  try {
    respuesta = await fetch(SITE.datos, { cache: 'no-cache' });
  } catch {
    throw new Error(
      'No se pudo leer el catálogo. Si abriste index.html con doble clic, usá un servidor local (ver README).',
    );
  }
  if (!respuesta.ok) throw new Error(`No se encontró ${SITE.datos} (${respuesta.status}).`);

  let json;
  try {
    json = await respuesta.json();
  } catch {
    throw new Error(`${SITE.datos} tiene un error de formato. Revisá comas y comillas.`);
  }

  const crudos = Array.isArray(json.autos) ? json.autos : [];
  const ids = new Set();
  const autos = [];

  for (const [i, auto] of crudos.entries()) {
    const problemas = validar(auto);
    if (ids.has(auto.id)) problemas.push(`el id "${auto.id}" está repetido`);
    if (problemas.length) {
      console.warn(`[${SITE.nombre}] Auto #${i + 1} (${auto.id ?? 'sin id'}) omitido: ${problemas.join('; ')}`);
      continue;
    }
    ids.add(auto.id);
    autos.push(normalizar(auto));
  }

  return { autos, actualizado: json.actualizado ?? '' };
}
