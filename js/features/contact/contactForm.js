import { SITE } from '../../config.js';
import { alCambiarIdioma, t } from '../../i18n.js';
import { $, $$, h } from '../../utils/dom.js';
import { formatTelefono, tituloAuto } from '../../utils/format.js';
import { abrirSeguro, esBot, limpiarTexto, muyRapido, registrarEnvio, segundosParaEnviar } from '../../utils/seguridad.js';
import { linkWhatsApp, mensajeContacto } from '../../utils/whatsapp.js';

const TELEFONO_VALIDO = /^[+\d][\d\s()-]{5,19}$/;

/**
 * Formulario "hablemos de tu próximo auto" (compradores). Arma el mensaje y abre WhatsApp.
 * El formulario de vendedores es sellForm.js; ambos comparten la tarjeta con pestañas.
 */
export function createContactForm({ form }) {
  const exito = $('[data-exito]', form);
  const aviso = $('[data-aviso]', form);
  const errNombre = $('#error-c-nombre', form);
  const errTelefono = $('#error-c-telefono', form);
  let autosValidos = new Set();

  const marcar = (input, error, clave) => {
    input.setAttribute('aria-invalid', String(Boolean(clave)));
    error.dataset.clave = clave;
    error.textContent = clave ? t(clave) : '';
    return !clave;
  };

  const validarNombre = () => marcar(form.elements.nombre, errNombre, limpiarTexto(form.elements.nombre.value, 60).length < 2 ? 'form.errNombre' : '');
  const validarTelefono = () => {
    const tel = form.elements.telefono.value.trim();
    return marcar(form.elements.telefono, errTelefono, tel && !TELEFONO_VALIDO.test(tel) ? 'form.errTelefono' : '');
  };

  form.elements.nombre.addEventListener('blur', validarNombre);
  form.elements.telefono.addEventListener('blur', validarTelefono);

  alCambiarIdioma(() => {
    for (const error of [errNombre, errTelefono]) if (error.dataset.clave) error.textContent = t(error.dataset.clave);
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

    const okNombre = validarNombre();
    const okTelefono = validarTelefono();
    if (!okNombre || !okTelefono) {
      (okNombre ? form.elements.telefono : form.elements.nombre).focus();
      return;
    }

    const espera = segundosParaEnviar('contacto');
    if (espera) {
      aviso.textContent = t('form.errEspera', { s: espera });
      return;
    }

    // El auto de interés solo puede ser uno de la lista (se ignora cualquier valor inyectado).
    const auto = autosValidos.has(form.elements.auto.value) ? form.elements.auto.value : '';
    const mensaje = mensajeContacto({
      nombre: limpiarTexto(form.elements.nombre.value, 60),
      telefono: limpiarTexto(form.elements.telefono.value, 20),
      auto,
      mensaje: limpiarTexto(form.elements.mensaje.value, 500),
    });
    registrarEnvio('contacto');
    abrirSeguro(linkWhatsApp(mensaje));
    exito.hidden = false;
  });

  return {
    /** Llena "auto de interés" con los autos disponibles. */
    setAutos(autos) {
      const lista = autos.filter((a) => a.estado !== 'vendido').map((a) => `${tituloAuto(a)} (${a.id})`);
      autosValidos = new Set(lista);
      form.elements.auto.append(...lista.map((texto) => h('option', { value: texto }, texto)));
    },
  };
}

/** Pestañas "quiero comprar / quiero vender" de la tarjeta de contacto. */
export function initPestanasContacto(root) {
  const tabs = $$('[role="tab"]', root);
  const activar = (tab) => {
    for (const tb of tabs) {
      const activo = tb === tab;
      tb.setAttribute('aria-selected', String(activo));
      tb.tabIndex = activo ? 0 : -1;
      $(`#${tb.getAttribute('aria-controls')}`).hidden = !activo;
    }
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activar(tab));
    tab.addEventListener('keydown', (e) => {
      const paso = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!paso) return;
      const sig = tabs[(i + paso + tabs.length) % tabs.length];
      activar(sig);
      sig.focus();
    });
  });
  // Links con data-abrir-venta (ej. "vendé tu auto" del pie) abren directo la pestaña de venta.
  $$('[data-abrir-venta]').forEach((a) => a.addEventListener('click', () => activar(tabs[1])));
}

/** Rellena los datos de contacto del negocio desde la configuración ([data-dato="..."]). */
export function pintarDatosContacto() {
  const valores = {
    whatsapp: formatTelefono(SITE.whatsapp),
    correo: SITE.correo,
    horario: SITE.horario,
    direccion: SITE.direccion,
  };
  for (const el of $$('[data-dato]')) {
    const v = valores[el.dataset.dato];
    if (!v) continue;
    el.textContent = v;
    if (el.dataset.dato === 'correo' && el.tagName === 'A') el.href = `mailto:${SITE.correo}`;
  }
  for (const el of $$('[data-red]')) {
    const url = SITE.redes[el.dataset.red];
    if (url && /^https:\/\//.test(url)) {
      el.href = url;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    } else el.hidden = true;
  }
}
