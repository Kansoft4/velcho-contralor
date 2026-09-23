/* Tráiler del tablero, debajo de la propuesta 01.
   - Carga el iframe cuando la sección se acerca (no antes: no pesa en la carga inicial).
   - Le avisa que arranque cuando ya está en pantalla, para que se vea desde el principio.
   - Al entrar crece de tarjeta a ancho completo.
   - «Ver en pantalla completa»: API del navegador; en iPhone, donde no existe para
     elementos, un modo propio que ocupa toda la pantalla y gira el tráiler.
   - Con prefers-reduced-motion no arranca solo: muestra un botón para reproducirlo.
   Sin JavaScript la sección queda oculta (atributo hidden). */
(() => {
  const fig = document.getElementById('tablero');
  if (!fig) return;
  const marco = fig.querySelector('.tablero-marco');
  const iframe = marco.querySelector('iframe');
  const boton = fig.querySelector('.tablero-grande');
  const cerrar = fig.querySelector('.tablero-cerrar');
  const reproducir = fig.querySelector('.tablero-reproducir');
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const medir = (e, d) => window.medir?.(e, d);
  fig.hidden = false;

  let cargado = false, visible = false, sonando = false;
  const arrancar = () => {
    if (sonando || !cargado || !visible || (reducido && !reproducir.hidden)) return;
    sonando = true;
    iframe.contentWindow.postMessage('tablero:reproducir', location.origin);
    medir('tablero', {accion: 'reproducir'});
  };
  iframe.addEventListener('load', () => { if (iframe.src) { cargado = true; arrancar(); } });
  const cargar = () => { if (!iframe.src) iframe.src = iframe.dataset.src; };

  if (reducido) {
    reproducir.hidden = false;
    reproducir.addEventListener('click', () => { reproducir.hidden = true; cargar(); arrancar(); });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { if (e.isIntersecting && !reducido) cargar(); },
      {rootMargin: '900px 0px'}).observe(fig);
    new IntersectionObserver(([e]) => { visible = e.intersectionRatio >= .35; arrancar(); },
      {threshold: [0, .35, .6]}).observe(marco);
  } else { cargar(); visible = true; }

  // De tarjeta a ancho completo mientras entra en pantalla.
  if (!reducido) {
    let cuadro = 0;
    const pintar = () => {
      cuadro = 0;
      if (fig.classList.contains('grande')) return;
      const r = fig.getBoundingClientRect(), alto = innerHeight;
      const p = Math.min(1, Math.max(0, (alto - r.top) / (alto * .75)));
      marco.style.setProperty('--t-s', (.88 + .12 * p).toFixed(4));
      marco.style.setProperty('--t-r', ((1 - p) * 26).toFixed(1) + 'px');
    };
    const programar = () => { if (!cuadro) cuadro = requestAnimationFrame(pintar); };
    addEventListener('scroll', programar, {passive: true});
    addEventListener('resize', programar, {passive: true});
    pintar();
  }

  // Pantalla completa.
  const salirPropio = () => {
    fig.classList.remove('grande');
    document.documentElement.classList.remove('sin-scroll');
  };
  async function agrandar() {
    cargar(); if (reducido) reproducir.hidden = true; visible = true; arrancar();
    medir('tablero', {accion: 'pantalla-completa'});
    if (document.fullscreenEnabled && marco.requestFullscreen) {
      try {
        await marco.requestFullscreen({navigationUI: 'hide'});
        try { await screen.orientation?.lock?.('landscape'); } catch {}
        return;
      } catch {}
    }
    fig.classList.add('grande');
    document.documentElement.classList.add('sin-scroll');
    cerrar.focus();
  }
  boton.addEventListener('click', agrandar);
  marco.addEventListener('click', e => { if (e.target === marco && !fig.classList.contains('grande')) agrandar(); });
  cerrar.addEventListener('click', () => { salirPropio(); boton.focus(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && fig.classList.contains('grande')) { salirPropio(); boton.focus(); } });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) { try { screen.orientation?.unlock?.(); } catch {} }
  });
})();
