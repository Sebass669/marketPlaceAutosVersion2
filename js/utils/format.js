import { SITE } from '../config.js';
import { locale } from '../i18n.js';

const precioFmt = new Intl.NumberFormat(SITE.locale, {
  style: 'currency',
  currency: SITE.moneda,
  maximumFractionDigits: 0,
});

const numeroFmt = new Intl.NumberFormat(SITE.locale, { maximumFractionDigits: 0 });


/** 13900000 -> "₡13 900 000" */
export const formatPrecio = (valor) => precioFmt.format(valor);

/** 84200 -> "84 200 km" */
export const formatKm = (valor) => `${numeroFmt.format(valor)} km`;

/** 15000000 -> "₡15 millones" (para selects compactos) */
export const formatMillones = (valor) => `₡${numeroFmt.format(valor / 1_000_000)} millones`;

/** "2026-10-09" -> "9 de octubre de 2026" (o "October 9, 2026" en inglés) */
export function formatFecha(iso) {
  // Mediodía local para evitar que la zona horaria corra el día.
  const fecha = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(fecha.getTime())) return '';
  return new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'long', year: 'numeric' }).format(fecha);
}

/** Texto en minúsculas y sin tildes, para búsquedas tolerantes. */
export const normalizarTexto = (texto) =>
  String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export const tituloAuto = (auto) => `${auto.marca} ${auto.modelo} ${auto.anio}`;

/** Precio aproximado en dólares según SITE.tipoCambio, redondeado a 50. "" si no hay tipo de cambio. */
export function formatDolares(colones) {
  if (!SITE.tipoCambio) return '';
  const usd = Math.round(colones / SITE.tipoCambio / 50) * 50;
  return `≈ $${numeroFmt.format(usd)}`;
}

/** "50688887777" -> "+506 8888 7777" */
export function formatTelefono(numero) {
  const d = String(numero).replace(/\D/g, '');
  return d.length === 11 && d.startsWith('506') ? `+506 ${d.slice(3, 7)} ${d.slice(7)}` : `+${d}`;
}
