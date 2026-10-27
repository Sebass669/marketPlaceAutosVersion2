/**
 * Configuración del sitio. Es el único archivo JS que necesitás tocar.
 * Los autos se editan en data/autos.json (ver README.md).
 */
export const SITE = Object.freeze({
  nombre: 'Solera',

  // Número de WhatsApp que recibe TODOS los mensajes (compradores y vendedores).
  // Formato internacional sin "+", espacios ni guiones. Ej: 50688887777
  whatsapp: '50662379935',

  // Datos que se muestran en la sección de contacto y en el pie de página.
  correo: 'solera.automotriz@gmail.com',
  horario: 'lun a sáb · 9:00 a. m. a 6:00 p. m.',
  direccion: 'Costa Rica', // no hay local físico: solo el país
  redes: {
    instagram: '', // ej: https://instagram.com/solera.cr  (vacío = no se muestra)
    facebook: '',
  },


  // Tipo de cambio para mostrar el precio aproximado en dólares. 0 = no mostrar.
  tipoCambio: 510,

  // Ruta del catálogo. Relativa a index.html.
  datos: 'data/autos.json',

  locale: 'es-CR',
  moneda: 'CRC',
});

/** Valores válidos para los campos con opciones fijas del JSON. */
export const CATALOGO = Object.freeze({
  tipos: ['SUV', 'Pickup', 'Sedán', 'Hatchback', 'Van', 'Coupé', 'Moto'],
  provincias: ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'],
  estados: ['disponible', 'reservado', 'vendido'],
  // Topes del filtro de precio, en colones.
  preciosMaximos: [5000000, 8000000, 10000000, 12000000, 15000000, 20000000, 30000000],
});
