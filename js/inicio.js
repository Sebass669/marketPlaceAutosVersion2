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

})();
