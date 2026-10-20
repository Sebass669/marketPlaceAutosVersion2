/*
 * Se ejecuta antes de pintar la página (script normal en <head>, no módulo):
 * aplica el tema y el idioma guardados para que no parpadeen al cargar.
 * Va en un archivo aparte (no en línea) para que la política de seguridad (CSP)
 * pueda bloquear cualquier script que no sea del propio sitio.
 */
(function () {
  try {
    var raiz = document.documentElement;
    var tema = localStorage.getItem('solera-tema');
    if (tema === 'negro' || tema === 'hueso') raiz.dataset.tema = tema;
    if (localStorage.getItem('solera-idioma') === 'en') raiz.lang = 'en';
  } catch (e) {
    /* Sin almacenamiento (navegación privada): quedan los valores por defecto. */
  }

  // Precarga la foto de portada del tema y tamaño de pantalla actuales: como es un fondo
  // de CSS, sin esto el navegador la descubre tarde y la portada aparece con retraso.
  var claro = raiz.dataset.tema === 'hueso';
  var movil = window.matchMedia('(max-width: 899px)').matches;
  var link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.type = 'image/webp';
  link.href = 'assets/portada/portada-' + (claro ? 'clara' : 'oscura') + (movil ? '-movil' : '') + '.webp';
  link.setAttribute('fetchpriority', 'high');
  document.head.appendChild(link);
})();
