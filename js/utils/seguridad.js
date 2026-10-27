/**
 * Protecciones de los formularios (del lado del navegador).
 *
 * Los formularios de Solera NO envían nada a un servidor: arman un mensaje y abren WhatsApp.
 * Por eso no generan solicitudes a Vercel ni costos por uso. Estas reglas evitan abusos
 * básicos (bots que llenan todo, envíos repetidos, textos gigantes o con caracteres raros).
 * La protección contra ataques de tráfico la da la plataforma (ver README, "Seguridad").
 */

const ESPERA_MS = 30_000; // tiempo mínimo entre dos envíos del mismo formulario
const MINIMO_EN_PAGINA_MS = 3_000; // un humano tarda más que esto en llenar un formulario
const MAX_MENSAJE = 1_500; // largo máximo del texto que se manda a WhatsApp

const cargaPagina = performance.now();
const ultimosEnvios = new Map();

/**
 * Quita etiquetas HTML (<script>, <a ...>), los signos < >, caracteres de control y espacios
 * repetidos, y corta al largo máximo. El texto nunca se pinta como HTML (solo viaja en el link
 * de WhatsApp), pero así ni siquiera llega código pegado en un campo.
 */
export function limpiarTexto(valor, max = 500) {
  return String(valor ?? '')
    .normalize('NFC')
    .replace(/<\/?[a-z!][^>]*>?/gi, '')
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

/** Corta el mensaje final antes de mandarlo a WhatsApp. */
export const limitarMensaje = (texto) => (texto.length > MAX_MENSAJE ? `${texto.slice(0, MAX_MENSAJE - 1)}…` : texto);

/** true si el campo trampa (invisible para personas) vino lleno: casi seguro es un bot. */
export const esBot = (form) => Boolean(form.elements.sitio_web?.value);

/** true si se intentó enviar demasiado rápido después de cargar la página (típico de bots). */
export const muyRapido = () => performance.now() - cargaPagina < MINIMO_EN_PAGINA_MS;

function leerUltimo(clave) {
  try {
    return Number(sessionStorage.getItem(`solera-envio-${clave}`)) || ultimosEnvios.get(clave) || 0;
  } catch {
    return ultimosEnvios.get(clave) || 0;
  }
}

/**
 * Límite de frecuencia: devuelve los segundos que faltan para poder volver a enviar,
 * o 0 si ya se puede. registrarEnvio() marca el envío actual.
 */
export function segundosParaEnviar(clave) {
  const restante = ESPERA_MS - (Date.now() - leerUltimo(clave));
  return restante > 0 ? Math.ceil(restante / 1000) : 0;
}

export function registrarEnvio(clave) {
  const ahora = Date.now();
  ultimosEnvios.set(clave, ahora);
  try {
    sessionStorage.setItem(`solera-envio-${clave}`, String(ahora));
  } catch {
    /* Sin almacenamiento: queda en memoria. */
  }
}

/** Abre WhatsApp en una pestaña nueva sin dar acceso a esta página (noopener). */
export function abrirSeguro(url) {
  const ventana = window.open(url, '_blank', 'noopener,noreferrer');
  if (ventana) ventana.opener = null;
}
