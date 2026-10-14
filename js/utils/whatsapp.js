import { SITE } from '../config.js';
import { formatKm, formatPrecio, tituloAuto } from './format.js';

const PLACEHOLDER = '50600000000';

export const whatsappConfigurado = () => SITE.whatsapp && SITE.whatsapp !== PLACEHOLDER;

/** Link wa.me hacia el número del negocio con el mensaje ya escrito. */
export function linkWhatsApp(mensaje) {
  const texto = encodeURIComponent(mensaje);
  return `https://wa.me/${SITE.whatsapp}${texto ? `?text=${texto}` : ''}`;
}

export function mensajeInteres(auto) {
  return [
    `Hola ${SITE.nombre}, me interesa el ${tituloAuto(auto)} (código ${auto.id}).`,
    `Precio publicado: ${formatPrecio(auto.precio)}.`,
    '¿Sigue disponible?',
  ].join('\n');
}

/** Arma el mensaje de "quiero vender mi auto" a partir de los datos del formulario. */
export function mensajeVenta(d) {
  const lineas = [
    `Hola ${SITE.nombre}, quiero publicar mi auto.`,
    '',
    `Nombre: ${d.nombre}`,
    `Auto: ${d.marca} ${d.modelo} ${d.anio}`,
    `Kilometraje: ${formatKm(d.kilometraje)}`,
    `Transmisión: ${d.transmision}`,
    `Precio que espero: ${formatPrecio(d.precio)}`,
    `Ubicación: ${d.provincia}`,
  ];
  if (d.comentario) lineas.push(`Comentarios: ${d.comentario}`);
  lineas.push('', 'Ahora les mando las fotos por aquí.');
  return lineas.join('\n');
}

export function mensajeAgendar(auto) {
  return [
    `Hola ${SITE.nombre}, quiero agendar una visita para ver el ${tituloAuto(auto)} (código ${auto.id}).`,
    '¿Qué días tienen disponibles?',
  ].join('\n');
}

/** Mensaje del formulario de contacto (compradores). */
export function mensajeContacto(d) {
  const lineas = [`Hola ${SITE.nombre}, soy ${d.nombre}.`];
  if (d.auto) lineas.push(`Me interesa: ${d.auto}.`);
  if (d.telefono) lineas.push(`Mi teléfono: ${d.telefono}.`);
  if (d.mensaje) lineas.push('', d.mensaje);
  return lineas.join('\n');
}
