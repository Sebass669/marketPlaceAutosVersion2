import { CATALOGO } from '../../config.js';
import { $, h } from '../../utils/dom.js';
import { linkWhatsApp, mensajeVenta } from '../../utils/whatsapp.js';

const ANIO_MAX = new Date().getFullYear() + 1;

/** Reglas por campo: devuelven un mensaje de error o '' si el valor es válido. */
const REGLAS = {
  nombre: (v) => (v.trim().length < 2 ? 'Escribí tu nombre.' : ''),
  marca: (v) => (!v.trim() ? 'Indicá la marca.' : ''),
  modelo: (v) => (!v.trim() ? 'Indicá el modelo.' : ''),
  anio: (v) => {
    const n = Number(v);
    return !Number.isInteger(n) || n < 1980 || n > ANIO_MAX ? `Año entre 1980 y ${ANIO_MAX}.` : '';
  },
  kilometraje: (v) => (v === '' || Number(v) < 0 ? 'Indicá el kilometraje aproximado.' : ''),
  precio: (v) => (Number(v) < 100000 ? 'Indicá el precio en colones, sin puntos.' : ''),
  provincia: (v) => (!v ? 'Elegí la provincia.' : ''),
  transmision: (v) => (!v ? 'Elegí la transmisión.' : ''),
};

export function createSellForm({ form }) {
  const exito = $('[data-exito]', form);

  form.elements.provincia.append(...CATALOGO.provincias.map((p) => h('option', { value: p }, p)));
  form.elements.anio.max = ANIO_MAX;

  function mostrarError(campo, mensaje) {
    const input = form.elements[campo];
    const error = $(`#error-${campo}`, form);
    input.setAttribute('aria-invalid', String(Boolean(mensaje)));
    error.textContent = mensaje;
  }

  function validarCampo(campo) {
    const mensaje = REGLAS[campo](form.elements[campo].value);
    mostrarError(campo, mensaje);
    return !mensaje;
  }

  // Validamos al salir del campo, y re-validamos en vivo solo si ya tenía error.
  for (const campo of Object.keys(REGLAS)) {
    const input = form.elements[campo];
    input.addEventListener('blur', () => validarCampo(campo));
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validarCampo(campo);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const invalidos = Object.keys(REGLAS).filter((campo) => !validarCampo(campo));
    if (invalidos.length) {
      form.elements[invalidos[0]].focus();
      exito.hidden = true;
      return;
    }

    const datos = Object.fromEntries(new FormData(form));
    datos.kilometraje = Number(datos.kilometraje);
    datos.precio = Number(datos.precio);
    datos.comentario = String(datos.comentario ?? '').trim();

    window.open(linkWhatsApp(mensajeVenta(datos)), '_blank', 'noopener');
    exito.hidden = false;
  });
}
