/* Each poster scrolls fully into view before its lower edge pins.
   The next poster then covers it. Native scrolling remains in control. */
(() => {
  const stack = document.querySelector('.story-panels');
  if (!stack) return;
  const panels = [...stack.querySelectorAll('.story-poster')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, start = 0, heights = [], offsets = [], viewport = 0;
  const clamp = value => Math.max(0, Math.min(1, value));

  function render() {
    frame = 0;
    if (reduced.matches) return;
    panels.forEach((panel, index) => {
      const next = offsets[index + 1];
      const progress = next === undefined ? 0 : clamp((scrollY + viewport - start - next) / viewport);
      const eased = progress * progress * (3 - 2 * progress);
      panel.style.setProperty('--cover-progress', eased.toFixed(4));
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  function measure() {
    viewport = document.documentElement.clientHeight;
    start = stack.getBoundingClientRect().top + scrollY;
    heights = panels.map(panel => panel.offsetHeight);
    let offset = 0;
    offsets = heights.map(height => { const top = offset; offset += height; return top; });
    panels.forEach((panel, index) => {
      panel.style.setProperty('--story-top', `${Math.min(0, viewport - heights[index])}px`);
      panel.style.setProperty('--story-layer', index + 1);
      panel.style.setProperty('--cover-progress', 0);
    });
    stack.classList.toggle('story-scroll-enabled', !reduced.matches);
    schedule();
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('pageshow', measure);
  reduced.addEventListener('change', measure);
  const observer = new ResizeObserver(measure);
  panels.forEach(panel => observer.observe(panel));
  document.fonts.ready.then(measure);
  measure();
})();
