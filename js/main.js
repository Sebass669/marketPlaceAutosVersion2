import { SITE } from './config.js';
import { cargarAutos } from './data/autosRepository.js';
import { createCatalog, initLinksFiltro } from './features/catalog/catalog.js';
import { createContactForm, initPestanasContacto, pintarDatosContacto } from './features/contact/contactForm.js';
import { renderDestacados } from './features/destacados/destacados.js';
import { createCarDialog } from './features/detail/carDialog.js';
import { createSellForm } from './features/sell/sellForm.js';
import { initAnclas, initNav, initReveal, initTema } from './features/ui/enhancements.js';
import { $, $$ } from './utils/dom.js';
import { formatFecha } from './utils/format.js';
import { linkWhatsApp, whatsappConfigurado } from './utils/whatsapp.js';

const TITULO_BASE = document.title;
const RUTA_AUTO = /^#carro\/(.+)$/;

/** Links genéricos de WhatsApp en el HTML: <a data-wa="mensaje">. */
function initLinksWhatsApp() {
  $$('[data-wa]').forEach((a) => {
    a.href = linkWhatsApp(a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener';
  });
  if (!whatsappConfigurado()) {
    console.warn(`[${SITE.nombre}] Configurá tu número de WhatsApp en js/config.js`);
  }
}

/** Similares para la ficha: mismo tipo primero, después el resto; sin el propio auto ni vendidos. */
function similaresDe(autos) {
  return (auto) =>
    autos
      .filter((a) => a.id !== auto.id && a.estado !== 'vendido')
      .sort((a, b) => Number(b.tipo === auto.tipo) - Number(a.tipo === auto.tipo) || Math.abs(a.precio - auto.precio) - Math.abs(b.precio - auto.precio))
      .slice(0, 3);
}

/** Enlaza el hash #carro/ID con el diálogo de detalle, para que cada auto tenga link propio. */
function initRouter(autos, dialogo) {
  const porId = new Map(autos.map((a) => [a.id, a]));

  const sincronizar = () => {
    const match = location.hash.match(RUTA_AUTO);
    const auto = match && porId.get(decodeURIComponent(match[1]));
    if (auto) dialogo.abrir(auto);
    else dialogo.cerrar();
  };

  window.addEventListener('hashchange', sincronizar);
  sincronizar();
}

async function init() {
  initTema();
  initNav();
  initAnclas();
  initReveal();
  initLinksWhatsApp();
  pintarDatosContacto();
  initPestanasContacto($('[data-contacto]'));
  createSellForm({ form: $('[data-form-venta]') });
  const contacto = createContactForm({ form: $('[data-form-contacto]') });

  const catalogo = createCatalog({ root: $('#carros') });
  initLinksFiltro(catalogo);
  let autos = [];
  const dialogo = createCarDialog({
    dialog: $('[data-dialog]'),
    obtenerSimilares: (auto) => similaresDe(autos)(auto),
    onClose: () => {
      document.title = TITULO_BASE;
      // Quita el #carro/ID sin saltar de posición ni agregar historial.
      if (RUTA_AUTO.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
    },
  });

  catalogo.mostrarCargando();

  try {
    const datos = await cargarAutos();
    autos = datos.autos;
    catalogo.setAutos(autos);
    contacto.setAutos(autos);
    renderDestacados($('[data-destacados]'), autos);
    if (datos.actualizado) $('[data-actualizado]').textContent = `Inventario actualizado el ${formatFecha(datos.actualizado)}.`;
    initRouter(autos, dialogo);
  } catch (error) {
    console.error(error);
    catalogo.mostrarError(error.message);
    $('[data-destacados]').hidden = true;
  }
}

init();
