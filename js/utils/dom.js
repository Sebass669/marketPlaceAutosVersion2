/**
 * Crea un elemento DOM de forma declarativa y segura.
 * El contenido de texto siempre va por textContent, nunca por innerHTML,
 * así un dato mal escrito en el JSON no puede inyectar HTML.
 *
 *   h('a', { href: '#', class: 'btn', onclick: fn }, 'Texto', otroNodo)
 */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') el.className = value;
    // style por CSSOM (no por atributo) para que funcione con la política de seguridad (CSP)
    else if (key === 'style') el.style.cssText = value;
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2), value);
    } else if (value === true) el.setAttribute(key, '');
    else el.setAttribute(key, value);
  }

  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
export const ICON_SPRITE = 'assets/icons.svg';

/** Ícono del sprite SVG (Phosphor). Decorativo por defecto (aria-hidden). */
export function icon(name, extraClass = '') {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', `icono ${extraClass}`.trim());
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `${ICON_SPRITE}#i-${name}`);
  svg.append(use);
  return svg;
}

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
