# Sitio de campaña — Contraloría Estudiantil (Colegio Jefferson)

Sitio estático de una sola página. Lema: **QUE LA PLATA SE VEA**.
Construido con Codex; falta terminarlo y publicarlo.

## Estructura

```
site/     ← esto y solo esto se publica
  index.html
  styles.css · art-direction.css · proposals.css · feedback.css
  scroll.js · story-scroll.js · proposals-motion.js · feedback.js
  assets/  (9,6 MB — todo en WebP, salvo el .mp4)
notas/    ← NO se publica
  INTEGRACION.md        documentación completa del sitio (versiones 1 a 23)
  PROMPT*.md            prompts exactos de cada imagen generada
  apps-script/          backend del formulario + cómo publicarlo
  alternativas-poster/  variantes de póster descartadas
  assets-sin-usar/      versiones viejas de imágenes, ya no referenciadas
  assets-originales/    los PNG/JPG sin comprimir (41 MB), por si se rehace el arte
```

Previsualizar: `cd site && python3 -m http.server 8766` → http://127.0.0.1:8766

**Ojo con el puerto 8765:** suele haber ahí un servidor apuntando a
`~/Documents/Codex/2026-09-17/qu/outputs/scroll-hero`, que es la carpeta vieja
de Codex de donde salió este proyecto. Es una copia anterior —todavía tiene el
`<select>` malformado— y editarla no afecta a `site/`. La copia buena es esta.

Secciones de la página, en orden: hero animado por scroll → frase → tres
historias (Canadá, deporte, tecnología) → seis propuestas con desplegables →
formulario → pie. Todo responde a `prefers-reduced-motion` y funciona sin JS.
Los detalles de cada animación están en `notas/INTEGRACION.md`.

---

## Lo que falta

### 1. Conectar el formulario ← falta un paso, en Google

Decisión tomada: las respuestas van a una **hoja de Google**. El enlace a la
hoja no se guarda en el repositorio, que es público; lo tiene Sebastián.

Del lado del sitio ya está todo hecho y probado contra un servidor que imita el
contrato de Apps Script: el formulario envía, recibe `{ok:true}` y muestra
«¡Tu idea llegó!».

Lo que falta es publicar el backend desde la cuenta de Google de Sebastián:

- Código listo para pegar: `notas/apps-script/Codigo.gs`
- Pasos: `notas/apps-script/COMO-PUBLICAR.md`
- Después, pegar la URL `/exec` en `site/feedback.js` línea 12.

Mientras `FEEDBACK_ENDPOINT` siga vacío, el botón queda deshabilitado y el sitio
muestra «Este buzón todavía no recibe mensajes» — que es el estado actual.

Dos cosas que no hay que romper:

- `feedback.js` envía `Content-Type: text/plain`, **no** `application/json`.
  Apps Script no contesta la petición *preflight* de CORS; con
  `application/json` el formulario deja de funcionar desde el navegador.
- La regla sigue: ningún token ni secreto en `feedback.js`. La URL `/exec` sí
  puede ir ahí — es un punto de entrada público, no una credencial.

### 2. Comprimir las imágenes ✅ hecho

`site/assets/` pasó de **44 MB a 9,6 MB** (2,7 MB de eso es el video, que no se
tocó). La carga inicial —el hero, lo único que no es `lazy`— bajó de 6,4 MB a
1 MB.

- Todo en WebP: `q=85` para el arte, `q=82` para las fotos, sin pérdida para el
  logo. El alfa se guardó con `-alpha_q 100`: la transparencia del lettering
  recortado quedó **idéntica bit a bit** (PSNR ∞).
- Solo se redimensionó una imagen: `amigos-winnipeg` (4160 px → 1600 px). El
  resto conserva su resolución original; no hacía falta bajarla para llegar al
  peso.
- Los originales están completos en `notas/assets-originales/`.
- Verificado en el navegador: las 26 imágenes cargan, sin 404 ni errores de
  consola.

Si se agrega arte nuevo, convertirlo igual:
`cwebp -q 85 -alpha_q 100 -m 6 imagen.png -o imagen.webp`

### 3. Publicar ✅ hecho

**En línea: https://kansoft4.github.io/velcho-contralor/**
Repositorio público: https://github.com/Kansoft4/velcho-contralor

Cada push a `main` dispara `.github/workflows/pages.yml`, que sube **solo
`site/`** a GitHub Pages. Comprobado: `notas/`, `CLAUDE.md` y `README.md`
responden 404 en la web. GitHub Pages ya sirve gzip y fuerza HTTPS, así que las
tres cosas de rendimiento que hacían falta quedaron resueltas sin configurar
nada.

Fuera del repositorio quedan las imágenes pesadas (`assets-originales/`,
`assets-sin-usar/`, `alternativas-poster/`, 72 MB); están en el Mac y en
`.gitignore`.

Ya resuelto antes de publicar: `<title>`, meta description, favicon, icono de
pantalla de inicio e imagen Open Graph (`site/assets/og.jpg`, 1200×630) para que
el enlace se vea bien al compartirlo por WhatsApp.

**Si más adelante se pasa al VPS:** copiar `site/` y configurar en el servidor
gzip o brotli para HTML/CSS/JS, `Cache-Control: max-age=31536000, immutable`
para `assets/`, y HTTPS con HTTP/2. Habría que actualizar `og:url`, `og:image`
y `canonical` en `index.html`, que hoy apuntan a la URL de GitHub Pages.

---

## Ya corregido

- El `<select>` de año tenía HTML malformado (`</option value="4">`), quedó
  cortado cuando ChatGPT llegó a su límite de uso. Ya está arreglado: las
  10 opciones abren y cierran bien.
- Se apartaron 10 imágenes de versiones anteriores que ya no referencia
  nadie (25 MB); están en `notas/assets-sin-usar/` por si acaso.
- Se verificó que ninguna ruta de `index.html` o los CSS apunte a un
  archivo que no exista.

## Convenciones del proyecto

- Las rutas de CSS y JS llevan `?v=N` para romper caché. Si cambias un
  archivo, sube su número en `index.html`.
- Cada imagen con texto tiene un equivalente accesible en el HTML. Si
  cambias el arte, actualiza también ese texto.
- Los textos de las propuestas describen mejoras **por hacer**, no cosas
  ya implementadas. Mantener ese tiempo verbal: es una campaña, no un
  informe de gestión. **Excepción: la propuesta 01** (el tablero) va en
  presente y su desplegable dice «¿Cómo funciona?», porque el tablero ya
  está construido — el tráiler de debajo lo muestra.
- El contenido de las seis propuestas sale de los PDF de campaña de
  Sebastián. Si vuelve a mandar una versión nueva, mandan esos PDF: han
  cambiado de una versión a otra (por ejemplo, en la 04 pasó de «reúno los
  pedidos y los entrego» a «consigo el precio, no compro»).
- **Nada visual puede depender de `mix-blend-mode` ni de `mask-composite`.**
  Safari no los aplica aquí, y el sitio se veía con rectángulos de otro tono
  alrededor del retrato del hero y de la frase «Nadie te obliga a pagar».
  La regla ahora es: si una imagen tiene que integrarse al fondo, su papel se
  corrige **en el archivo** (tono igual a `--paper` y bordes que se desvanecen
  a transparente), no con CSS.
- Los símbolos `↗ ↘ ↙ ✳` llevan `&#xFE0E;` detrás. Sin eso, iOS los pinta como
  emoji a color. Si se agrega otra flecha de ese rango, ponerle el mismo sufijo.
- La propuesta 02 lleva una animación CSS de 3 escenas en bucle de 12 s
  (`.plan-anim`, al final de `proposals.css`). Sin JS ni imágenes; las medidas
  van en `cqw` sobre un contenedor cuadrado. Dos trampas si se edita: sus
  titulares son `<div>` y no `<p>`, porque `.proposal .proposal-detail p` del
  sitio le impone `line-height:1.55` y descuadra las escenas; y `[data-pm]` no
  debe llevar `opacity:0`, porque la barra de progreso solo anima `transform`
  y quedaría invisible. Si se cambia `--pm-dur`, hay que escalar a mano los
  `animation-delay` en segundos: los keyframes van en % y escalan solos, los
  retardos no. Los envoltorios sin entrada propia (`.ficha`, `.lista`,
  `.fichas`) flotan en bucle para que la escena nunca quede del todo quieta
  mientras se sostiene.
- La propuesta 03 lleva otra igual (`.hoja-anim`), sobre papel rayado. Sus
  keyframes van con prefijo `sh-` porque el archivo original reutilizaba los
  nombres `pm-` con definiciones distintas y se habrían pisado con los de la
  02. Si llega una animación nueva, darle su propio prefijo.
- La propuesta 04 lleva una tercera (`.conv-anim`, prefijo `cv-`), de 4 escenas
  en 10 s y **después del texto**, no antes. El archivo original cambiaba el DOM
  con JavaScript; aquí las cuatro escenas van superpuestas y se turnan con CSS.
- La propuesta 05 lleva la cuarta (`.cal-anim`, prefijo `cal-`), también de 4
  escenas en 10 s y después del texto. Resumen: 02 y 03 van **antes** del
  texto, 04 y 05 **después**.
- En escritorio las propuestas van de a dos por fila y sus `<details>` quedan
  alineados con **`grid-template-rows:subgrid`** en las cuatro pareadas
  (`goals`/`ledger` con `span 4`, `shopping`/`calendar` con `span 5`: cada par
  tiene el mismo número de hijos). Si se agrega o quita un hijo a una de ellas,
  hay que ajustar el `span` de las dos.
  Dos caminos que **no** funcionan y ya se probaron: `margin-top:auto` en el
  `details` alinea con ambas cerradas, pero al abrir una la otra crece y su
  resumen se va hasta el fondo; y aplicar la regla a `.proposal` en general pisa
  a la 01 (`proposal-board`) y la 06 (`proposal-credit`), que son de ancho
  completo con `display:grid` a dos columnas internas, y les duplica el alto.
- **Demo del hero por inactividad** (`scroll.js`, al final): si en 10 s nadie
  ha hecho scroll, la página baja sola en ~5,5 s, con curva suave para que se
  vea la animación, y aterriza en la frase (`.statement-section`). Se detiene
  al instante con cualquier toque, rueda, clic o tecla; no se arma si el
  usuario ya deslizó, si la página abre fuera de arriba o con
  `prefers-reduced-motion`; el reloj se pausa con la pestaña oculta; una sola
  vez por visita. El cue «DESLIZA PARA VER» es una pastilla azul centrada con
  pulso y flecha que rebota (`styles.css`, al final); se centra con la propiedad
  `translate`, no con `transform`, y en celular la firma sube a `bottom:90px`
  para no quedar pegada.
- **Páginas ocultas** en `site/p/<código al azar>/`: no las enlaza nada del sitio y
  llevan `noindex`. Solo las ve quien tenga el enlace, **pero el repositorio es
  público**, así que cualquiera que revise GitHub puede encontrarlas. No poner
  ahí nada que no pueda ver cualquiera. No agregar `robots.txt` con esas rutas:
  las publicaría. Hoy: `p/4u71ka286f/` — póster «Juntos rinde más», para un
  correo (el JPG es para clientes de correo que no leen WebP).
- **Métricas: Umami Cloud** (sin cookies, sin datos personales). Script en el
  `<head>` con `async` —para no frenar los scripts del sitio— y
  `data-domains="kansoft4.github.io"`, así las pruebas en local no cuentan.
  Eventos propios en `metricas.js`: `llego-a` (frase, historias, propuestas,
  formulario; una vez por visita), `abrir-propuesta` (01–06); en `scroll.js`:
  `demo-hero` (inicio, completa, interrumpida); en `feedback.js`:
  `idea-enviada` con **solo el año**. Nunca mandar el nombre ni el texto del
  formulario. El panel es de la cuenta de Sebastián en cloud.umami.is.
- **Tráiler del tablero**, a pantalla completa justo debajo de la propuesta 01
  (reemplazó el video `cuentas-demo.mp4`, que quedó en `notas/assets-sin-usar/`).
  Es la composición «Trailer wow» de Claude Design, **compilada** para el sitio:
  `site/tablero/` (iframe) se genera con `bun notas/tablero/compilar.ts` desde
  `notas/tablero/fuente/`. El original compilaba JSX en el navegador con Babel
  (~3 MB); compilado pesa ~25 KB comprimido. El compilador además cambia el
  lienzo de `<svg><foreignObject>` a `<div>` (Safari pinta mal lo animado dentro
  de foreignObject), quita la barra de reproducción y arranca siempre en 0.
  Trampa: el runtime marca también `<html>` con `data-om-starter`, así que el
  CSS que oculta la barra va acotado a `#lienzo`.
  `tablero.js` carga el iframe al acercarse, lo arranca al entrar en pantalla y
  hace el efecto de tarjeta → ancho completo. **Sin botón de pantalla completa**:
  Sebastián lo pidió quitar. Con `prefers-reduced-motion` no arranca solo:
  muestra «Reproducir el tráiler». Umami: evento `tablero` (`reproducir`).
  Sin el video, la 01 va en dos columnas: título a la izquierda, texto y
  desplegable a la derecha.
