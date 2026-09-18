/* Native scrolling; each piece enters once, then stays readable. */
(() => {
  const section = document.querySelector('.proposals');
  if (!section || !('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const seen = new WeakSet();
  const running = new Set();
  const pieces = section.querySelectorAll('.proposal-head-art, .proposals-lead, .proposal-label, .proposal-title-art, .proposal-copy > p:not(.proposal-label), .proposal > p:not(.proposal-label), .proposal details, .board-video, .proposals-footer > p');

  function enter(element) {
    if (seen.has(element)) return;
    seen.add(element);
    if (reduced.matches || !element.animate) return;
    const headline = element.matches('.proposal-title-art, .proposal-head-art');
    const art = element.matches('.shopping-collage, .calendar-collage, .credit-art, .board-video');
    // Preserve the existing collage rotation at the end of every entrance.
    const resting = getComputedStyle(element).transform;
    const base = resting === 'none' ? '' : resting;
    const direction = element.closest('.proposal-ledger, .proposal-calendar') ? -1 : 1;
    const frames = headline ? [
      {opacity: 0, transform: `translateY(45px) rotate(${direction * -5}deg) scale(.92) ${base}`},
      {opacity: 1, transform: `translateY(-3px) rotate(${direction * .7}deg) scale(1.012) ${base}`, offset: .76},
      {opacity: 1, transform: resting}
    ] : [
      {opacity: 0, transform: `translateY(${art ? 34 : 18}px) ${base}`},
      {opacity: 1, transform: resting}
    ];
    const animation = element.animate(frames, {
      duration: headline ? 800 : art ? 700 : 470,
      easing: 'cubic-bezier(.2,.75,.25,1)'
    });
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => running.delete(animation));
  }

  const entrances = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      enter(entry.target);
      entrances.unobserve(entry.target);
    }
  }, {threshold: .12});
  pieces.forEach(piece => entrances.observe(piece));

  section.querySelectorAll('details').forEach(details => {
    details.addEventListener('toggle', () => {
      if (!details.open || reduced.matches) return;
      details.querySelector('.proposal-detail').animate([
        {opacity: 0, transform: 'translateY(-7px)'},
        {opacity: 1, transform: 'translateY(0)'}
      ], {duration: 260, easing: 'ease-out'});
    });
  });
  // Keyboard navigation always exposes the focused content immediately.
  section.addEventListener('focusin', event => {
    pieces.forEach(piece => {
      if (piece.contains(event.target)) {
        seen.add(piece);
        piece.getAnimations().forEach(animation => animation.finish());
      }
    });
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) section.getAnimations({subtree: true}).forEach(animation => animation.cancel());
  });
  /* El video ya no lleva controles: es decoración en bucle, sin sonido. Como
     nadie puede pausarlo a mano, se queda en su póster cuando el sistema pide
     menos movimiento, igual que el resto de las animaciones. */
  const demo = section.querySelector('.accounts-demo');
  if (demo) {
    const ajustarDemo = () => {
      if (reduced.matches) {
        // load() reinicia el elemento y vuelve a mostrar el póster. Congelarlo
        // en el segundo 0 no sirve: el primer cuadro del video está en blanco.
        demo.removeAttribute('autoplay');
        demo.pause();
        demo.load();
      } else {
        demo.setAttribute('autoplay', '');
        demo.play().catch(() => {});
      }
    };
    ajustarDemo();
    reduced.addEventListener('change', ajustarDemo);
  }
})();
