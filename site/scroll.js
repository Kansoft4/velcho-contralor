/* Native scroll: no dependencies, wheel interception or scroll hijacking. The one
   exception is the idle demo at the end: if nobody scrolls in 10 s, the page
   scrolls itself once, slowly, and any touch, wheel or key hands control back.
   Portrait/signature use the original poster. Each headline row is an independent
   transparent PNG, so the Q tail moves with QUE LA and never leaks into PLATA. */
(() => {
  const scene = document.querySelector('.scroll-scene');
  if (!scene) return;
  const poster = scene.querySelector('.poster');
  const original = scene.querySelector('.fallback');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width:650px)');
  const clips = {
    portrait:[65,54,633,747],
    que:[716,74,882,238],
    plata:[720,313,884,240],
    vea:[716,557,903,233],
    signature:[125,827,1420,54]
  };
  const pieces = {};
  // Visible ink bounds only position/size the full image. No clip or hidden overflow:
  // tails, antialiasing and print texture remain attached to their own phrase.
  const phraseAssets = {
    que:{size:[2038,771],ink:[74,136,1896,503]},
    plata:{size:[2036,772],ink:[110,97,1853,538]},
    vea:{size:[2020,779],ink:[82,136,1878,484]}
  };
  for (const [name,[x,y,w,h]] of Object.entries(clips)) {
    const el = scene.querySelector(`[data-piece="${name}"]`);
    Object.assign(el.style,{left:`${x/1672*100}%`,top:`${y/941*100}%`,width:`${w/1672*100}%`,aspectRatio:`${w}/${h}`});
    if (phraseAssets[name]) {
      const {size:[iw,ih],ink:[ix,iy,bw,bh]}=phraseAssets[name];
      Object.assign(el.firstElementChild.style,{width:`${iw/bw*100}%`,height:`${ih/bh*100}%`,left:`${-ix/bw*100}%`,top:`${-iy/bh*100}%`});
    } else {
      Object.assign(el.firstElementChild.style,{width:`${1672/w*100}%`,left:`${-x/w*100}%`,top:`${-y/h*100}%`});
    }
    pieces[name] = el;
  }
  const clamp = v => Math.max(0,Math.min(1,v));
  const ease = (p,a,b) => {const t=clamp((p-a)/(b-a));return t*t*(3-2*t)};
  const cue = scene.querySelector('.scroll-cue');
  const signature = scene.querySelector('.mobile-signature');
  const meter = scene.querySelector('.scene-meter span');
  const wipe = scene.querySelector('.wipe');
  let start = 0, distance = 1, frame = 0;

  function move(el,x,y,rotation=0,scale=1,alpha=1) {
    el.style.transform=`translate3d(${x}px,${y}px,0) rotate(${rotation}deg) scale(${scale})`;
    el.style.opacity=alpha;
  }

  function render() {
    frame=0;
    const p=reduced.matches ? 0 : clamp((scrollY-start)/distance);
    const w=poster.clientWidth, h=poster.clientHeight;
    const open=ease(p,.035,.30), exit=ease(p,.28,.55), focus=ease(p,.43,.72);
    const mobile=narrow.matches;
    // 1: the printed composition opens in depth, with staggered text.
    move(pieces.portrait,-w*(mobile?.18:.10)*open-w*.40*exit,-h*.04*open-h*.16*exit,-8*open,1+.07*open,1-exit);
    move(pieces.que,w*.04*open+w*.16*exit,-h*.045*open-h*.30*exit,-2.2*open,1,1-exit);
    move(pieces.plata,w*.09*open+w*.34*exit,-h*.008*open-h*.15*exit,1.6*open,1,1-exit);
    // 2: SE VEA moves to the center, filling the space left by the portrait.
    move(pieces.vea,-w*(mobile?0:.20)*focus,-h*(mobile?.25:.17)*focus,0,1+(mobile?.02:.48)*focus,1-ease(p,.76,.85));
    move(pieces.signature,0,h*.02*open,0,1,1-ease(p,.08,.26));
    signature.style.opacity=1-ease(p,.08,.26);
    cue.style.opacity=1-ease(p,.015,.12);
    // 3: one expanding ink disc covers the entire viewport and joins the next section.
    wipe.style.clipPath=`circle(${150*ease(p,.69,.93)}% at ${mobile?'50% 62%':'70% 70%'})`;
    meter.style.transform=`scaleX(${p})`;
    scene.dataset.progress=p.toFixed(3);

  }

  function schedule(){if(!frame)frame=requestAnimationFrame(render)}
  function measure(){
    start=scene.getBoundingClientRect().top+scrollY;
    distance=Math.max(1,scene.offsetHeight-scene.querySelector('.sticky-frame').offsetHeight);
    schedule();
  }
  function ready(){scene.classList.add('is-ready');measure()}
  const images=[original,...scene.querySelectorAll('.sprite img')];
  Promise.all(images.map(img=>img.decode())).then(ready).catch(()=>{
    // Preserve the complete static poster if any independent asset fails to load.
    scene.classList.remove('is-ready');
  });
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',measure,{passive:true});
  reduced.addEventListener('change',measure);
  narrow.addEventListener('change',measure);
  addEventListener('pageshow',measure);
  new ResizeObserver(measure).observe(poster);
  measure();

  // Demo por inactividad: hay quien no sabe que la página se desliza. Si en 10 s
  // nadie ha hecho scroll, baja sola —despacio, para que se vea la animación— y
  // aterriza en la frase. Cualquier toque, rueda o tecla la detiene al instante.
  // Una sola vez por visita; nada de esto con prefers-reduced-motion.
  const DEMORA = 10000, DURACION = 5500, TOLERANCIA = 40;
  const INTERRUPCIONES = ['wheel','touchstart','pointerdown','keydown'];
  let espera = 0, demoActiva = false;
  const suave = t => -(Math.cos(Math.PI*t)-1)/2;
  const destino = () => {
    const frase = document.querySelector('.statement-section');
    return frase ? frase.getBoundingClientRect().top+scrollY : start+distance;
  };
  function detenerDemo(ev){
    if (ev && demoActiva) window.medir?.('demo-hero', {estado:'interrumpida'});
    demoActiva = false;
    for (const e of INTERRUPCIONES) removeEventListener(e,detenerDemo);
  }
  function demo(){
    desarmar();
    if (reduced.matches || scrollY > TOLERANCIA) return;
    const desde = scrollY, hasta = destino(), t0 = performance.now();
    demoActiva = true;
    window.medir?.('demo-hero', {estado:'inicio'});
    for (const e of INTERRUPCIONES) addEventListener(e,detenerDemo,{passive:true});
    (function paso(ahora){
      if (!demoActiva) return;
      const t = Math.min(1,(ahora-t0)/DURACION);
      scrollTo(0,desde+(hasta-desde)*suave(t));
      if (t < 1) requestAnimationFrame(paso);
      else { window.medir?.('demo-hero', {estado:'completa'}); detenerDemo(); }
    })(t0);
  }
  function armar(){ clearTimeout(espera); if (!document.hidden) espera = setTimeout(demo,DEMORA); }
  function alDeslizar(){ if (scrollY > TOLERANCIA) desarmar(); }
  function alCambiarVisibilidad(){ document.hidden ? clearTimeout(espera) : armar(); }
  function desarmar(){
    clearTimeout(espera);
    removeEventListener('scroll',alDeslizar);
    removeEventListener('keydown',desarmar);
    document.removeEventListener('visibilitychange',alCambiarVisibilidad);
  }
  if (!reduced.matches && scrollY <= TOLERANCIA) {
    addEventListener('scroll',alDeslizar,{passive:true});
    addEventListener('keydown',desarmar);          // quien navega con teclado ya sabe moverse
    document.addEventListener('visibilitychange',alCambiarVisibilidad);
    armar();
  }
})();
