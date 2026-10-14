import { SITE } from '../../config.js';
import { $, $$, h } from '../../utils/dom.js';
import { formatTelefono, tituloAuto } from '../../utils/format.js';
import { linkWhatsApp, mensajeContacto } from '../../utils/whatsapp.js';

/**
 * Formulario "hablemos de tu próximo auto" (compradores). Arma el mensaje y abre WhatsApp.
 * El formulario de vendedores es sellForm.js; ambos comparten la tarjeta con pestañas.
 */
export function createContactForm({ form }) {
  const exito = $('[data-exito]', form);
  const error = $('#error-c-nombre', form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(form));
    const nombre = String(datos.nombre ?? '').trim();
    form.elements.nombre.setAttribute('aria-invalid', String(nombre.length < 2));
    error.textContent = nombre.length < 2 ? 'Escribí tu nombre.' : '';
    if (nombre.length < 2) {
      form.elements.nombre.focus();
      return;
    }
    const mensaje = mensajeContacto({
      nombre,
      telefono: String(datos.telefono ?? '').trim(),
      auto: String(datos.auto ?? ''),
      mensaje: String(datos.mensaje ?? '').trim(),
    });
    window.open(linkWhatsApp(mensaje), '_blank', 'noopener');
    exito.hidden = false;
  });

  return {
    /** Llena "auto de interés" con los autos disponibles. */
    setAutos(autos) {
      form.elements.auto.append(
        ...autos.filter((a) => a.estado !== 'vendido').map((a) => h('option', { value: `${tituloAuto(a)} (${a.id})` }, tituloAuto(a))),
      );
    },
  };
}

/** Pestañas "quiero comprar / quiero vender" de la tarjeta de contacto. */
export function initPestanasContacto(root) {
  const tabs = $$('[role="tab"]', root);
  const activar = (tab) => {
    for (const t of tabs) {
      const activo = t === tab;
      t.setAttribute('aria-selected', String(activo));
      t.tabIndex = activo ? 0 : -1;
      $(`#${t.getAttribute('aria-controls')}`).hidden = !activo;
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
  // Links con data-abrir-venta (ej. "vendé tu auto" del menú) abren directo la pestaña de venta.
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
    const valor = valores[el.dataset.dato];
    if (!valor) continue;
    el.textContent = valor;
    if (el.dataset.dato === 'correo' && el.tagName === 'A') el.href = `mailto:${SITE.correo}`;
  }
  for (const el of $$('[data-red]')) {
    const url = SITE.redes[el.dataset.red];
    if (url) el.href = url;
    else el.hidden = true;
  }
}
