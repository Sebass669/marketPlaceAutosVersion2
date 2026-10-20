import { SITE } from '../config.js';
import { t, valor } from '../i18n.js';
import { formatKm, formatPrecio, tituloAuto } from './format.js';
import { limitarMensaje } from './seguridad.js';

const PLACEHOLDER = '50600000000';

export const whatsappConfigurado = () => SITE.whatsapp && SITE.whatsapp !== PLACEHOLDER;

/** Link wa.me hacia el número del negocio con el mensaje ya escrito (largo limitado). */
export function linkWhatsApp(mensaje = '') {
  const texto = encodeURIComponent(limitarMensaje(mensaje));
  return `https://wa.me/${SITE.whatsapp}${texto ? `?text=${texto}` : ''}`;
}

export const mensajeInteres = (auto) => t('wa.interes', { auto: tituloAuto(auto), id: auto.id, precio: formatPrecio(auto.precio) });

export const mensajeAgendar = (auto) => t('wa.agendar', { auto: tituloAuto(auto), id: auto.id });

/** Mensaje del formulario de venta (los datos ya vienen limpios y validados). */
export function mensajeVenta(d) {
  const lineas = [
    t('wa.ventaHola'),
    '',
    t('wa.ventaNombre', { v: d.nombre }),
    t('wa.ventaAuto', { v: `${d.marca} ${d.modelo} ${d.anio}` }),
    t('wa.ventaKm', { v: formatKm(d.kilometraje) }),
    t('wa.ventaTransmision', { v: valor('transmision', d.transmision) }),
    t('wa.ventaPrecio', { v: formatPrecio(d.precio) }),
    t('wa.ventaUbicacion', { v: d.provincia }),
  ];
  if (d.comentario) lineas.push(t('wa.ventaComentarios', { v: d.comentario }));
  lineas.push('', t('wa.ventaFotos'));
  return lineas.join('\n');
}

/** Mensaje del formulario de contacto (compradores). */
export function mensajeContacto(d) {
  const lineas = [t('wa.contactoHola', { nombre: d.nombre })];
  if (d.auto) lineas.push(t('wa.contactoAuto', { auto: d.auto }));
  if (d.telefono) lineas.push(t('wa.contactoTel', { tel: d.telefono }));
  if (d.mensaje) lineas.push('', d.mensaje);
  return lineas.join('\n');
}
