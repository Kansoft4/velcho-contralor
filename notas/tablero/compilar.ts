// Compila el tráiler del tablero («Trailer wow», exportado de Claude Design) para el sitio.
//
//   bun notas/tablero/compilar.ts
//
// Lee notas/tablero/fuente/*.jsx y escribe site/tablero/trailer.js.
// El original compila el JSX en el navegador de cada visitante con Babel (~3 MB);
// aquí se compila una sola vez, así que el celular solo baja el código listo.
//
// Además adapta el reproductor del editor al sitio:
//   - el lienzo va en un <div> y no en un <svg><foreignObject>: Safari pinta mal
//     el contenido animado dentro de foreignObject;
//   - sin barra de reproducción (barH = 0; el CSS de index.html la oculta);
//   - siempre arranca desde el principio (no retoma el segundo guardado).
// Si Claude Design vuelve a exportar, copiar los .jsx nuevos a fuente/ y correr esto.

const raiz = new URL('../../', import.meta.url).pathname;
const leer = (f: string) => Bun.file(`${raiz}notas/tablero/fuente/${f}`).text();

function reemplazar(txt: string, viejo: string | RegExp, nuevo: string, etiqueta: string) {
  const n = typeof viejo === 'string' ? txt.split(viejo).length - 1 : (txt.match(new RegExp(viejo, 'g')) || []).length;
  if (n !== 1) throw new Error(`parche «${etiqueta}»: se esperaba 1 coincidencia y hay ${n}`);
  return txt.replace(viejo, nuevo);
}

let anim = await leer('animations-v3.jsx');
anim = reemplazar(anim, "const v = parseFloat(localStorage.getItem(persistKey + ':t') || '0');", 'const v = 0;', 'arrancar en 0');
anim = reemplazar(anim, 'const barH = 44; // playback bar height', 'const barH = 0;', 'sin barra');
anim = reemplazar(anim, '  useInlineFontsInto(canvasRef);\n', '', 'sin fuentes en svg');
anim = reemplazar(
  anim,
  /<svg\s+ref=\{canvasRef\}[\s\S]*?<\/svg>/,
  `<div
          ref={canvasRef}
          style={{
            width, height, background,
            position: 'relative', overflow: 'hidden',
            transform: \`scale(\${scale})\`, transformOrigin: 'center',
            flexShrink: 0, display: 'block',
          }}
        >
          <TimelineContext.Provider value={ctxValue}>
            {children}
          </TimelineContext.Provider>
        </div>`,
  'svg → div',
);

const transpilador = new Bun.Transpiler({
  loader: 'jsx',
  target: 'browser',
  minifyWhitespace: true,
  deadCodeElimination: false,
  treeShaking: false,
  tsconfig: { compilerOptions: { jsx: 'react', jsxFactory: 'React.createElement', jsxFragmentFactory: 'React.Fragment' } },
});

// Cada archivo va en su propio ámbito, igual que en el runtime original
// (new Function("React","module","exports","require", código)); se exportan por window.
const partes = [
  ['animations-v3.jsx', anim],
  ['tweaks-panel.jsx', await leer('tweaks-panel.jsx')],
  ['TrailerWow.jsx', await leer('TrailerWow.jsx')],
].map(([nombre, codigo]) =>
  `/* ${nombre} */(function(React,module,exports,require){${transpilador.transformSync(codigo)}\n}).call(window,window.React,{exports:{}},{},function(){});`);

const salida = `/* Generado por notas/tablero/compilar.ts — no editar a mano. */\n${partes.join('\n')}\n`;
await Bun.write(`${raiz}site/tablero/trailer.js`, salida);
console.log(`site/tablero/trailer.js: ${(salida.length / 1024).toFixed(1)} KB`);
