import { CATALOGO } from '../../config.js';
import { alCambiarIdioma, t } from '../../i18n.js';
import { $, h } from '../../utils/dom.js';
import { abrirSeguro, esBot, limpiarTexto, muyRapido, registrarEnvio, segundosParaEnviar } from '../../utils/seguridad.js';
import { linkWhatsApp, mensajeVenta } from '../../utils/whatsapp.js';

const ANIO_MAX = new Date().getFullYear() + 1;
const entero = (v) => (/^\d+$/.test(String(v).trim()) ? Number(v) : NaN);

/** Reglas por campo: devuelven la clave del error o '' si el valor es válido. */
const REGLAS = {
  nombre: (v) => (limpiarTexto(v, 60).length < 2 ? 'form.errNombre' : ''),
  marca: (v) => (!limpiarTexto(v, 30) ? 'form.errMarca' : ''),
  modelo: (v) => (!limpiarTexto(v, 40) ? 'form.errModelo' : ''),
  anio: (v) => {
    const n = entero(v);
    return !(n >= 1980 && n <= ANIO_MAX) ? 'form.errAnio' : '';
  },
  kilometraje: (v) => {
    const n = entero(v);
    return !(n >= 0 && n <= 2_000_000) ? 'form.errKm' : '';
  },
  precio: (v) => {
    const n = entero(v);
    return !(n >= 100_000 && n <= 2_000_000_000) ? 'form.errPrecio' : '';
  },
  provincia: (v) => (!CATALOGO.provincias.includes(v) ? 'form.errProvincia' : ''),
  transmision: (v) => (!['Automática', 'Manual'].includes(v) ? 'form.errTransmision' : ''),
};

export function createSellForm({ form }) {
  const exito = $('[data-exito]', form);
  const aviso = $('[data-aviso]', form);

  form.elements.provincia.append(...CATALOGO.provincias.map((p) => h('option', { value: p }, p)));
  form.elements.anio.max = ANIO_MAX;

  function mostrarError(campo, clave) {
    const input = form.elements[campo];
    input.setAttribute('aria-invalid', String(Boolean(clave)));
    const error = $(`#error-${campo}`, form);
    error.dataset.clave = clave;
    error.textContent = clave ? t(clave, { max: ANIO_MAX }) : '';
  }

  function validarCampo(campo) {
    const clave = REGLAS[campo](form.elements[campo].value);
    mostrarError(campo, clave);
    return !clave;
  }

  // Validamos al salir del campo, y re-validamos en vivo solo si ya tenía error.
  for (const campo of Object.keys(REGLAS)) {
    const input = form.elements[campo];
    input.addEventListener('blur', () => validarCampo(campo));
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validarCampo(campo);
    });
  }

  // Al cambiar de idioma, los errores visibles se traducen.
  alCambiarIdioma(() => {
    for (const error of form.querySelectorAll('.campo-form__error')) {
      if (error.dataset.clave) error.textContent = t(error.dataset.clave, { max: ANIO_MAX });
    }
    aviso.textContent = '';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    aviso.textContent = '';

    // Bots: si llenaron el campo trampa o enviaron al instante, se ignora en silencio.
    if (esBot(form) || muyRapido()) {
      exito.hidden = false;
      return;
    }

    const invalidos = Object.keys(REGLAS).filter((campo) => !validarCampo(campo));
    if (invalidos.length) {
      form.elements[invalidos[0]].focus();
      exito.hidden = true;
      return;
    }

    const espera = segundosParaEnviar('venta');
    if (espera) {
      aviso.textContent = t('form.errEspera', { s: espera });
      return;
    }

    const f = form.elements;
    const datos = {
      nombre: limpiarTexto(f.nombre.value, 60),
      marca: limpiarTexto(f.marca.value, 30),
      modelo: limpiarTexto(f.modelo.value, 40),
      anio: entero(f.anio.value),
      kilometraje: entero(f.kilometraje.value),
      precio: entero(f.precio.value),
      provincia: f.provincia.value,
      transmision: f.transmision.value,
      comentario: limpiarTexto(f.comentario.value, 500),
    };

    registrarEnvio('venta');
    abrirSeguro(linkWhatsApp(mensajeVenta(datos)));
    exito.hidden = false;
  });
}
