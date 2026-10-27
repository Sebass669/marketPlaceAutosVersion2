/*
 * Se ejecuta antes de pintar la página (script normal en <head>, no módulo):
 * aplica el tema y el idioma guardados para que no parpadeen al cargar,
 * y controla la pantalla de carga.
 * Va en un archivo aparte (no en línea) para que la política de seguridad (CSP)
 * pueda bloquear cualquier script que no sea del propio sitio.
 */
(function () {
  try {
    var raiz = document.documentElement;
    var tema = localStorage.getItem('solera-tema');
    if (tema === 'negro' || tema === 'hueso') raiz.dataset.tema = tema;
    if (localStorage.getItem('solera-idioma') === 'en') raiz.lang = 'en';
    // PALETA-PRUEBA (temporal): paleta elegida para el modo oscuro; borrar junto con paletaPrueba.js.
    var paleta = localStorage.getItem('solera-paleta-prueba');
    if (/^(bosque|oliva|marino|burdeos|plata)$/.test(paleta)) raiz.dataset.paleta = paleta;
  } catch (e) {
    /* Sin almacenamiento (navegación privada): quedan los valores por defecto. */
  }

  /*
   * Pantalla de carga: .cargando la muestra; al terminar de cargar la página pasa a .cargado
   * (se desvanece y arrancan las animaciones de la portada). Queda al menos 700 ms para que
   * no parpadee si la página carga al instante, y nunca más de 6 s aunque algo tarde.
   */
  var html = document.documentElement;
  var inicio = Date.now();
  html.classList.add('cargando');

  function listo() {
    if (html.classList.contains('cargado')) return;
    setTimeout(function () {
      html.classList.remove('cargando');
      html.classList.add('cargado');
      setTimeout(function () {
        var cargador = document.querySelector('[data-cargador]');
        if (cargador) cargador.hidden = true;
      }, 700);
    }, Math.max(0, 700 - (Date.now() - inicio)));
  }

  window.addEventListener('load', listo);
  setTimeout(listo, 6000);
})();
