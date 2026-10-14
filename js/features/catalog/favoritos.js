/**
 * Favoritos del visitante (el corazón de cada tarjeta). Se guardan solo en su navegador.
 * Si el almacenamiento no está disponible (navegación privada), funcionan durante la visita.
 */
const CLAVE = 'solera-favoritos';

function leer() {
  try {
    return new Set(JSON.parse(localStorage.getItem(CLAVE) ?? '[]'));
  } catch {
    return new Set();
  }
}

const ids = leer();
const oyentes = new Set();

function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify([...ids]));
  } catch {
    /* Sin almacenamiento: quedan en memoria. */
  }
}

export const favoritos = {
  get ids() {
    return ids;
  },
  tiene: (id) => ids.has(id),
  alternar(id) {
    if (ids.has(id)) ids.delete(id);
    else ids.add(id);
    guardar();
    oyentes.forEach((fn) => fn(id));
    return ids.has(id);
  },
  /** Avisa cada vez que cambia un favorito (para refrescar contadores o la grilla). */
  alCambiar(fn) {
    oyentes.add(fn);
  },
};
