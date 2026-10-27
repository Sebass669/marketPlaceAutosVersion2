/*
 * PRUEBA (temporal): selector de paleta para el modo oscuro.
 * Sirve solo para decidir el color que acompaña al negro. Cuando se elija, pasar esos
 * valores a [data-tema='negro'] en css/tokens.css y borrar: este archivo, css/paleta-prueba.css,
 * el bloque .paleta-prueba de index.html, su import en main.js y PALETA-PRUEBA en inicio.js.
 */
import { $, $$ } from '../../utils/dom.js';

const CLAVE = 'solera-paleta-prueba';
const PALETAS = [
  { id: 'dorado', nombre: 'dorado', nota: 'la actual' },
  { id: 'bosque', nombre: 'verde bosque' },
  { id: 'oliva', nombre: 'verde oliva' },
  { id: 'marino', nombre: 'azul marino' },
  { id: 'burdeos', nombre: 'burdeos' },
  { id: 'plata', nombre: 'plata' },
];

export function initPaletaPrueba() {
  const raiz = $('[data-paleta-prueba]');
  if (!raiz) return;
  const boton = $('[data-paleta-boton]', raiz);
  const menu = $('[data-paleta-menu]', raiz);
  const muestra = $('.paleta-prueba__muestra', boton);

  menu.innerHTML = '<p class="paleta-prueba__aviso">modo oscuro · prueba</p>';
  for (const p of PALETAS) {
    const op = document.createElement('button');
    op.type = 'button';
    op.className = 'paleta-prueba__opcion';
    op.setAttribute('role', 'radio');
    op.dataset.paleta = p.id;
    op.innerHTML = `<span class="paleta-prueba__muestra paleta-prueba__muestra--${p.id}" aria-hidden="true"></span><span></span>`;
    op.lastChild.textContent = p.nota ? `${p.nombre} (${p.nota})` : p.nombre;
    menu.append(op);
  }
  const opciones = $$('[role="radio"]', menu);

  const abrir = (abierto) => {
    menu.hidden = !abierto;
    boton.setAttribute('aria-expanded', String(abierto));
  };

  const aplicar = (id, { guardar = true } = {}) => {
    const html = document.documentElement;
    if (id === 'dorado') delete html.dataset.paleta;
    else html.dataset.paleta = id;
    // La paleta es solo del modo oscuro: si está en claro, pasa a negro para verla.
    if (guardar && html.dataset.tema !== 'negro') $('[data-tema-opcion="negro"]')?.click();
    muestra.className = `paleta-prueba__muestra paleta-prueba__muestra--${id}`;
    boton.setAttribute('aria-label', `Paleta de prueba: ${PALETAS.find((p) => p.id === id).nombre}`);
    for (const op of opciones) {
      const activo = op.dataset.paleta === id;
      op.setAttribute('aria-checked', String(activo));
      op.tabIndex = activo ? 0 : -1;
    }
    if (guardar) {
      try {
        if (id === 'dorado') localStorage.removeItem(CLAVE);
        else localStorage.setItem(CLAVE, id);
      } catch {
        /* Navegación privada: la prueba vale solo para esta visita. */
      }
    }
  };

  boton.addEventListener('click', () => {
    const abierto = menu.hidden;
    abrir(abierto);
    if (abierto) opciones.find((op) => op.tabIndex === 0)?.focus();
  });

  menu.addEventListener('click', (e) => {
    const op = e.target.closest('[data-paleta]');
    if (op) aplicar(op.dataset.paleta);
  });

  menu.addEventListener('keydown', (e) => {
    const paso = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!paso) return;
    e.preventDefault();
    const i = opciones.indexOf(document.activeElement);
    const siguiente = opciones[(i + paso + opciones.length) % opciones.length];
    aplicar(siguiente.dataset.paleta);
    siguiente.focus();
  });

  document.addEventListener('click', (e) => !raiz.contains(e.target) && abrir(false));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || menu.hidden) return;
    abrir(false);
    boton.focus();
  });

  const guardada = document.documentElement.dataset.paleta;
  aplicar(PALETAS.some((p) => p.id === guardada) ? guardada : 'dorado', { guardar: false });
}
