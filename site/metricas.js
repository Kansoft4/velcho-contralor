/* Métricas con Umami (sin cookies, sin datos personales).
   Si el script de Umami no carga —bloqueador de anuncios, sin conexión o en
   local, donde data-domains lo desactiva— todo esto simplemente no hace nada.
   Nunca se envía el nombre ni el texto del formulario. */
(() => {
  const medir = (evento, datos) => { try { window.umami?.track(evento, datos); } catch {} };
  window.medir = medir;   // también lo usan scroll.js y feedback.js

  // Hasta dónde llega la gente: una vez por sección y por visita. Además de
  // decir quién pasa del inicio, estos eventos hacen que Umami mida mejor el
  // tiempo de visita (lo calcula entre el primer y el último evento).
  const secciones = {'por-que':'frase','quien-soy':'historias','propuestas':'propuestas','tu-idea':'formulario'};
  if ('IntersectionObserver' in window) {
    // umbral 0 + margen: las secciones son más altas que la pantalla, así que un
    // porcentaje visible nunca se alcanzaría. Cuenta cuando su borde superior
    // pasa la mitad de la pantalla.
    const vigia = new IntersectionObserver(entradas => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        medir('llego-a', {seccion: secciones[e.target.id]});
        vigia.unobserve(e.target);
      }
    }, {rootMargin: '0px 0px -50% 0px'});
    for (const id of Object.keys(secciones)) {
      const el = document.getElementById(id);
      if (el) vigia.observe(el);
    }
  }

  // Qué propuestas se abren.
  document.querySelectorAll('.proposal details').forEach(d => {
    const n = d.closest('.proposal').querySelector('.proposal-label')?.textContent.trim().slice(0, 2);
    d.addEventListener('toggle', () => { if (d.open) medir('abrir-propuesta', {propuesta: n}); });
  });
})();
