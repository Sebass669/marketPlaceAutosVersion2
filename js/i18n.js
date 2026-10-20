/**
 * Idiomas del sitio (español / inglés).
 *
 * - Textos fijos del HTML: el español vive en index.html; el elemento se marca con
 *   data-i18n="clave" (texto) o data-i18n-attr="placeholder:clave,aria-label:clave" (atributos).
 *   Al pasar a inglés se usa EN[clave]; al volver a español se restaura el original.
 * - Textos que arma el JS: t('clave', { variable }) busca en el idioma actual (ES o EN).
 * - Datos del JSON: valor(campo, texto) traduce tipo, transmisión, combustible y estado.
 *   Descripción y extras pueden traer su versión en inglés: "descripcion_en", "extras_en".
 */
const IDIOMAS = ['es', 'en'];
const CLAVE = 'solera-idioma';

const ES = {
  'meta.titulo': 'Solera | Autos con historia en Costa Rica',
  'tema.negro': 'Tema negro',
  'tema.hueso': 'Tema claro',
  'menu.abrir': 'Abrir menú',
  'menu.cerrar': 'Cerrar menú',
  'conteo.vacio': 'Sin resultados',
  'conteo.resultado': '{n} {autos} · {d} {disponibles}',
  'conteo.auto': 'auto encontrado',
  'conteo.autos': 'autos encontrados',
  'conteo.disponible': 'disponible',
  'conteo.disponibles': 'disponibles',
  'vacio.titulo': 'ningún auto coincide',
  'vacio.texto': 'Probá con menos filtros o escribinos y lo buscamos por vos.',
  'vacio.favTitulo': 'todavía no tenés favoritos',
  'vacio.favTexto': 'Tocá el corazón de un auto para guardarlo aquí.',
  'vacio.limpiar': 'limpiar filtros',
  'error.titulo': 'no pudimos cargar los autos',
  'error.reintentar': 'reintentar',
  'filtro.todoPais': 'Todo el país',
  'filtro.cualquierPrecio': 'Cualquier precio',
  'filtro.hasta': 'Hasta ₡{n} millones',
  'orden.recientes': 'ordenar: más recientes',
  'orden.precio-asc': 'ordenar: menor precio',
  'orden.precio-desc': 'ordenar: mayor precio',
  'orden.km': 'ordenar: menos kilometraje',
  'orden.anio': 'ordenar: año más nuevo',
  'card.verDetalles': 'ver detalles',
  'card.verDetallesDe': 'Ver detalles: {auto}',
  'card.vendido': 'vendido',
  'card.favorito': 'Guardar {auto} en favoritos',
  'card.foto': '{auto}, color {color}',
  'ficha.fotoN': '{auto}, foto {n} de {total}',
  'ficha.verFoto': 'Ver foto {n}',
  'ficha.ficha': 'ficha {id}',
  'ficha.consultar': 'consultar por whatsapp',
  'ficha.agendar': 'agendar visita',
  'ficha.compartir': 'compartir',
  'ficha.copiado': 'link copiado',
  'ficha.vendido': 'este auto ya se vendió',
  'ficha.verOtros': 'ver otros autos',
  'ficha.check1': 'Revisado antes de publicarse',
  'ficha.check2': 'Traspaso acompañado de principio a fin',
  'ficha.check3': 'Coordinamos la visita por WhatsApp',
  'ficha.tabs': 'Información del auto',
  'ficha.tabDescripcion': 'descripción',
  'ficha.tabTecnica': 'ficha técnica',
  'ficha.tabProceso': 'proceso de compra',
  'ficha.nota': 'Antes de pagar, pedí el estudio registral en el Registro Nacional y llevalo a revisar con tu mecánico.',
  'ficha.publicado': 'Publicado el {fecha}',
  'ficha.similaresSobre': 'te puede interesar',
  'ficha.similares': 'autos similares',
  'proceso.1t': 'Nos escribís',
  'proceso.1p': 'Consultás por WhatsApp desde esta ficha y te confirmamos disponibilidad.',
  'proceso.2t': 'Coordinamos la visita',
  'proceso.2p': 'Acordamos un día y un lugar para que lo veas y lo pruebes.',
  'proceso.3t': 'Revisás y cerrás',
  'proceso.3p': 'Pedí el estudio registral y la revisión mecánica antes de pagar.',
  'spec.anio': 'Año',
  'spec.km': 'Kilometraje',
  'spec.transmision': 'Transmisión',
  'spec.combustible': 'Combustible',
  'spec.motor': 'Motor',
  'spec.traccion': 'Tracción',
  'spec.color': 'Color',
  'spec.tipo': 'Tipo',
  'spec.ubicacion': 'Ubicación',
  'form.errNombre': 'Escribí tu nombre (mínimo 2 letras).',
  'form.errMarca': 'Indicá la marca.',
  'form.errModelo': 'Indicá el modelo.',
  'form.errAnio': 'Año entre 1980 y {max}.',
  'form.errKm': 'Kilometraje entre 0 y 2 000 000.',
  'form.errPrecio': 'Precio en colones, solo números (entre ₡100 000 y ₡2 000 000 000).',
  'form.errProvincia': 'Elegí la provincia.',
  'form.errTransmision': 'Elegí la transmisión.',
  'form.errTelefono': 'Solo números, espacios, + y guiones.',
  'form.errEspera': 'Esperá {s} segundos antes de enviar otra solicitud.',
  'form.elegirAuto': 'Seleccioná un auto',
  'wa.consulta': 'Hola Solera, tengo una consulta.',
  'wa.info': 'Hola Solera, quiero información sobre sus autos.',
  'wa.vender': 'Hola Solera, quiero publicar mi auto.',
  'wa.interes': 'Hola Solera, me interesa el {auto} (código {id}).\nPrecio publicado: {precio}.\n¿Sigue disponible?',
  'wa.agendar': 'Hola Solera, quiero agendar una visita para ver el {auto} (código {id}).\n¿Qué días tienen disponibles?',
  'wa.contactoHola': 'Hola Solera, soy {nombre}.',
  'wa.contactoAuto': 'Me interesa: {auto}.',
  'wa.contactoTel': 'Mi teléfono: {tel}.',
  'wa.ventaHola': 'Hola Solera, quiero publicar mi auto.',
  'wa.ventaNombre': 'Nombre: {v}',
  'wa.ventaAuto': 'Auto: {v}',
  'wa.ventaKm': 'Kilometraje: {v}',
  'wa.ventaTransmision': 'Transmisión: {v}',
  'wa.ventaPrecio': 'Precio que espero: {v}',
  'wa.ventaUbicacion': 'Ubicación: {v}',
  'wa.ventaComentarios': 'Comentarios: {v}',
  'wa.ventaFotos': 'Ahora les mando las fotos por aquí.',
  'actualizado': 'Inventario actualizado el {fecha}.',
};

const EN = {
  'meta.titulo': 'Solera | Cars with history in Costa Rica',
  'tema.negro': 'Dark theme',
  'tema.hueso': 'Light theme',
  'menu.abrir': 'Open menu',
  'menu.cerrar': 'Close menu',
  'conteo.vacio': 'No results',
  'conteo.resultado': '{n} {autos} · {d} {disponibles}',
  'conteo.auto': 'car found',
  'conteo.autos': 'cars found',
  'conteo.disponible': 'available',
  'conteo.disponibles': 'available',
  'vacio.titulo': 'no cars match',
  'vacio.texto': 'Try fewer filters, or message us and we will find it for you.',
  'vacio.favTitulo': 'no favorites yet',
  'vacio.favTexto': 'Tap the heart on a car to save it here.',
  'vacio.limpiar': 'clear filters',
  'error.titulo': 'we could not load the cars',
  'error.reintentar': 'retry',
  'filtro.todoPais': 'Whole country',
  'filtro.cualquierPrecio': 'Any price',
  'filtro.hasta': 'Up to ₡{n} million',
  'orden.recientes': 'sort: newest listings',
  'orden.precio-asc': 'sort: lowest price',
  'orden.precio-desc': 'sort: highest price',
  'orden.km': 'sort: lowest mileage',
  'orden.anio': 'sort: newest year',
  'card.verDetalles': 'view details',
  'card.verDetallesDe': 'View details: {auto}',
  'card.vendido': 'sold',
  'card.favorito': 'Save {auto} to favorites',
  'card.foto': '{auto}, {color}',
  'ficha.fotoN': '{auto}, photo {n} of {total}',
  'ficha.verFoto': 'View photo {n}',
  'ficha.ficha': 'listing {id}',
  'ficha.consultar': 'ask on whatsapp',
  'ficha.agendar': 'book a viewing',
  'ficha.compartir': 'share',
  'ficha.copiado': 'link copied',
  'ficha.vendido': 'this car has been sold',
  'ficha.verOtros': 'see other cars',
  'ficha.check1': 'Inspected before listing',
  'ficha.check2': 'Ownership transfer handled start to finish',
  'ficha.check3': 'Viewings arranged on WhatsApp',
  'ficha.tabs': 'Car information',
  'ficha.tabDescripcion': 'description',
  'ficha.tabTecnica': 'specifications',
  'ficha.tabProceso': 'buying process',
  'ficha.nota': 'Before paying, request the registry report from the Registro Nacional and have your mechanic inspect the car.',
  'ficha.publicado': 'Listed on {fecha}',
  'ficha.similaresSobre': 'you may also like',
  'ficha.similares': 'similar cars',
  'proceso.1t': 'Message us',
  'proceso.1p': 'Ask on WhatsApp from this listing and we confirm availability.',
  'proceso.2t': 'We arrange a viewing',
  'proceso.2p': 'We agree on a day and place so you can see and test drive it.',
  'proceso.3t': 'Check and close',
  'proceso.3p': 'Get the registry report and a mechanical inspection before paying.',
  'spec.anio': 'Year',
  'spec.km': 'Mileage',
  'spec.transmision': 'Transmission',
  'spec.combustible': 'Fuel',
  'spec.motor': 'Engine',
  'spec.traccion': 'Drive',
  'spec.color': 'Color',
  'spec.tipo': 'Type',
  'spec.ubicacion': 'Location',
  'form.errNombre': 'Enter your name (at least 2 letters).',
  'form.errMarca': 'Enter the make.',
  'form.errModelo': 'Enter the model.',
  'form.errAnio': 'Year between 1980 and {max}.',
  'form.errKm': 'Mileage between 0 and 2,000,000.',
  'form.errPrecio': 'Price in colones, numbers only (between ₡100,000 and ₡2,000,000,000).',
  'form.errProvincia': 'Choose a province.',
  'form.errTransmision': 'Choose the transmission.',
  'form.errTelefono': 'Only numbers, spaces, + and hyphens.',
  'form.errEspera': 'Please wait {s} seconds before sending another request.',
  'form.elegirAuto': 'Choose a car',
  'wa.consulta': 'Hi Solera, I have a question.',
  'wa.info': 'Hi Solera, I would like information about your cars.',
  'wa.vender': 'Hi Solera, I want to list my car.',
  'wa.interes': 'Hi Solera, I am interested in the {auto} (code {id}).\nListed price: {precio}.\nIs it still available?',
  'wa.agendar': 'Hi Solera, I would like to book a viewing of the {auto} (code {id}).\nWhich days are available?',
  'wa.contactoHola': 'Hi Solera, my name is {nombre}.',
  'wa.contactoAuto': 'I am interested in: {auto}.',
  'wa.contactoTel': 'My phone: {tel}.',
  'wa.ventaHola': 'Hi Solera, I want to list my car.',
  'wa.ventaNombre': 'Name: {v}',
  'wa.ventaAuto': 'Car: {v}',
  'wa.ventaKm': 'Mileage: {v}',
  'wa.ventaTransmision': 'Transmission: {v}',
  'wa.ventaPrecio': 'Asking price: {v}',
  'wa.ventaUbicacion': 'Location: {v}',
  'wa.ventaComentarios': 'Comments: {v}',
  'wa.ventaFotos': 'I will send the photos here.',
  'actualizado': 'Inventory updated on {fecha}.',

  /* ---- Textos fijos de index.html ---- */
  'skip': 'Skip to inventory',
  'nav.principal': 'Main',
  'nav.inicio': 'home',
  'nav.inventario': 'inventory',
  'nav.contacto': 'contact',
  'nav.conocenos': 'about us',
  'logo.lema': 'automotive · costa rica',
  'tema.grupo': 'Color theme',
  'idioma.grupo': 'Language',
  'hero.sobre': 'automotive · costa rica',
  'hero.titulo': 'cars with history, ready for your road',
  'hero.sub': 'New, used and classic cars, hand-picked one by one, with a mechanical inspection and a hassle-free ownership transfer.',
  'hero.ver': 'view inventory',
  'hero.autoAlt': 'Silver Aston Martin in side view',
  'hero.datoAutos': 'cars available',
  'hero.datoDesde': 'prices from',
  'hero.datoMarcas': 'brands in stock',
  'hero.datoLema': 'owner to owner',
  'marcas.titulo': 'Brands we find for you',
  'hero.whatsapp': 'message us on whatsapp',
  'dest.sobre': 'selection',
  'dest.titulo': 'featured cars',
  'dest.anterior': 'Previous cars',
  'dest.siguiente': 'More cars',
  'dest.pista': 'Featured cars, swipe to see more',
  'inv.sobre': 'our cars',
  'inv.titulo': 'inventory',
  'inv.filtrar': 'Filter cars',
  'inv.buscar': 'search',
  'inv.buscarPh': 'Make, model or place',
  'inv.tipo': 'type',
  'inv.marca': 'make',
  'inv.transmision': 'transmission',
  'inv.combustible': 'fuel',
  'inv.provincia': 'province',
  'inv.precio': 'max price',
  'inv.favoritos': 'only my favorites',
  'inv.limpiar': 'clear filters',
  'inv.ordenar': 'Sort by',
  'con.sobre': 'contact',
  'con.titulo': "let's talk about your next car",
  'con.tipo': 'Type of request',
  'con.comprar': 'i want to buy',
  'con.vender': 'i want to sell',
  'con.nombre': 'Name',
  'con.nombrePh': 'Your name',
  'con.telefono': 'Phone',
  'con.opcional': '(optional)',
  'con.auto': 'Car of interest',
  'con.mensaje': 'Message',
  'con.mensajePh': 'Tell us what you are looking for...',
  'con.enviar': 'send on whatsapp',
  'con.exito': 'Done. If WhatsApp did not open, check that your browser allows new windows.',
  'con.trampa': 'Do not fill in this field',
  'ven.nombre': 'Your name',
  'ven.marca': 'Make',
  'ven.modelo': 'Model',
  'ven.anio': 'Year',
  'ven.km': 'Mileage',
  'ven.transmision': 'Transmission',
  'ven.elegir': 'Choose',
  'ven.automatica': 'Automatic',
  'ven.manual': 'Manual',
  'ven.provincia': 'Province',
  'ven.precio': 'Asking price (colones)',
  'ven.precioAyuda': 'Numbers only, no dots or ₡ symbol. You send the photos on WhatsApp.',
  'ven.comentario': 'Anything else we should know',
  'ven.comentarioPh': 'Single owner, dealer maintenance, details worth mentioning...',
  'dat.whatsapp': 'whatsapp',
  'dat.correo': 'email',
  'dat.horario': 'hours',
  'cono.sobre': 'about us',
  'cono.titulo': 'the car of your dreams, within reach',
  'cono.p1': 'Solera was born with a simple idea: anyone should be able to get the car they have always wanted. We find and select cars from well-known brands, check every detail and stay with you until it is parked in your garage.',
  'cono.p2': "Can't find the one you want in the inventory? Tell us the make, model and budget, and we will search for it for you.",
  'cono.cita': 'solera: heritage, tradition and quality that improves with time.',
  'cono.v1': 'well-known brands',
  'cono.v2': 'transparency',
  'cono.v3': 'backing',
  'cono.v4': 'personal service',
  'cono.pedir': 'ask for a car',
  'res.sobre': 'why solera',
  'res.titulo': 'buy and sell with confidence',
  'res.1t': 'certified mechanical inspection',
  'res.1p': 'We inspect every vehicle before listing it, so you buy with real information and no surprises.',
  'res.2t': 'hassle-free ownership transfer',
  'res.2p': 'A lawyer handles the transfer and the paperwork. You just sign.',
  'res.3t': 'personal service',
  'res.3p': 'We stay with you through the whole negotiation, from the first question to delivery.',
  'gar.1t': 'mechanical inspection',
  'gar.1p': 'Every car is inspected before it is listed.',
  'gar.2t': 'transfer with a lawyer',
  'gar.2p': 'We handle the paperwork from start to finish.',
  'gar.3t': 'escrow payment',
  'gar.3p': 'Your money stays protected until the transfer is complete.',
  'faq.sobre': 'questions',
  'faq.titulo': 'what people ask us most',
  'faq.otra': 'Another question?',
  'faq.escribinos': 'Message us on WhatsApp',
  'faq.1q': 'Can you find me a car that is not in the inventory?',
  'faq.1a': 'Yes. Send us the make, model, year and budget on WhatsApp and we will look for it for you.',
  'faq.2q': 'Can I see the car before buying it?',
  'faq.2a': 'Yes. Message us from the car listing and we arrange a day and place to see and test drive it.',
  'faq.3q': 'What should I check before paying?',
  'faq.3a': 'Request the registry report from the Registro Nacional to confirm the owner, liens and annotations, and check that the circulation tax (marchamo) and technical inspection (RTV) are up to date.',
  'faq.4q': 'Can I sell my car through Solera?',
  'faq.4a': 'Yes. Use the "i want to sell" tab in the contact section and send us the photos on WhatsApp. We review the car before listing it.',
  'pie.navegacion': 'navigation',
  'pie.autos': 'cars',
  'pie.contacto': 'contact',
  'pie.desc': 'Cars with history, ready for your road. Honest brokerage to buy and sell in Costa Rica.',
  'pie.vende': 'sell your car',
  'pie.sedan': 'sedan',
  'pie.derechos': '© 2026 Solera Automotriz. All rights reserved.',
  'pie.creditos': 'Sample photos from Wikimedia Commons; cover car by Vauxford (CC BY-SA 4.0).',
  'pie.firma': 'Made with calm and coffee by DODO Estudio ·',
  'wa.flotante': 'Message us on WhatsApp',
  'ficha.cerrar': 'Close listing',
};

/** Traducción de valores que vienen del JSON (el español es el valor original). */
const VALORES_EN = {
  tipo: { 'Sedán': 'Sedan', 'Coupé': 'Coupe', Moto: 'Motorcycle' },
  transmision: { 'Automática': 'Automatic', Manual: 'Manual' },
  combustible: { Gasolina: 'Gasoline', 'Diésel': 'Diesel', 'Híbrido': 'Hybrid', 'Eléctrico': 'Electric' },
  estado: { reservado: 'reserved', vendido: 'sold', disponible: 'available' },
  traccion: {},
};

const DICCIONARIOS = { es: ES, en: EN };
const oyentes = new Set();

function leerGuardado() {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

let actual = IDIOMAS.includes(leerGuardado()) ? leerGuardado() : 'es';

export const idioma = () => actual;
export const locale = () => (actual === 'en' ? 'en-US' : 'es-CR');

/** Texto traducido. Variables entre llaves: t('ficha.ficha', { id: 'MV-001' }). */
export function t(clave, vars = {}) {
  const texto = DICCIONARIOS[actual][clave] ?? ES[clave] ?? clave;
  return texto.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

/** Traduce un valor del JSON (tipo, transmisión, combustible, estado). */
export function valor(campo, texto) {
  if (actual === 'es' || !texto) return texto;
  return VALORES_EN[campo]?.[texto] ?? texto;
}

/** Campo de texto del auto con versión en inglés opcional ("descripcion_en", "extras_en"). */
export const campoAuto = (auto, campo) => (actual === 'en' && auto[`${campo}_en`]) || auto[campo];

/** Aplica el idioma a los textos fijos del HTML. Guarda el español original la primera vez. */
function aplicarEstaticos() {
  for (const el of document.querySelectorAll('[data-i18n]')) {
    if (el.dataset.i18nEs === undefined) el.dataset.i18nEs = el.textContent;
    el.textContent = actual === 'es' ? el.dataset.i18nEs : (EN[el.dataset.i18n] ?? el.dataset.i18nEs);
  }
  for (const el of document.querySelectorAll('[data-i18n-attr]')) {
    for (const par of el.dataset.i18nAttr.split(',')) {
      const [attr, clave] = par.split(':').map((s) => s.trim());
      const guardado = `i18nEs${attr.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase())}`;
      if (el.dataset[guardado] === undefined) el.dataset[guardado] = el.getAttribute(attr) ?? '';
      el.setAttribute(attr, actual === 'es' ? el.dataset[guardado] : (EN[clave] ?? el.dataset[guardado]));
    }
  }
  document.documentElement.lang = actual === 'en' ? 'en' : 'es-CR';
  document.title = t('meta.titulo');
}

export function setIdioma(nuevo) {
  if (!IDIOMAS.includes(nuevo) || nuevo === actual) return;
  actual = nuevo;
  try {
    localStorage.setItem(CLAVE, nuevo);
  } catch {
    /* Navegación privada: vale solo para esta visita. */
  }
  aplicarEstaticos();
  oyentes.forEach((fn) => fn(nuevo));
}

/** Registra una función para repintar contenido dinámico cuando cambia el idioma. */
export const alCambiarIdioma = (fn) => oyentes.add(fn);

/** Botones ES / EN del header (data-idioma-opcion). */
export function initIdioma() {
  const botones = [...document.querySelectorAll('[data-idioma-opcion]')];
  const marcar = () => botones.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.idiomaOpcion === actual)));
  botones.forEach((b) => b.addEventListener('click', () => setIdioma(b.dataset.idiomaOpcion)));
  alCambiarIdioma(marcar);
  aplicarEstaticos();
  marcar();
}
