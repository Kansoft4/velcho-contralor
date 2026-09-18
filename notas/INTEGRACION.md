# Hero con animación de scroll

Abrir `index.html` para probar. Funciona localmente y sin instalar dependencias.

## Secuencia

- Inicio: el póster elegido, con cabeza, titular y firma.
- Primer tramo: la cabeza se desplaza y gira suavemente; las líneas se separan.
- Tramo central: desaparecen cabeza y primeras líneas; «SE VEA» crece hacia el centro.
- Salida: una mancha circular de tinta morada ocupa la pantalla.
- Frase: aparece una única composición gráfica con «Nadie te obliga a pagar. Pero nadie te ha dado una razón para hacerlo.»
- Historias: tres experiencias en franjas de color, directamente después de la frase.
- Propuestas: seis iniciativas de campaña, con resúmenes y detalles desplegables.

El hero y las transiciones entre historias responden al scroll. La frase es una pieza editorial fija: no tiene secuencia, recuadro ni animaciones adicionales. Subir invierte el hero. No se intercepta la rueda ni se fuerza el desplazamiento. La preferencia de movimiento reducido muestra el póster estático y permite pasar directamente al contenido. El enlace «Saltar animación» aparece con el teclado. El video de propuestas se reproduce automáticamente, sin sonido y en bucle; sus controles permiten pausarlo.

## Integrar

1. Copiar las secciones `.scroll-scene`, `.statement-section`, `.about-section` y `.proposals`, junto a `styles.css`, `art-direction.css`, `proposals.css`, `scroll.js`, `story-scroll.js` y la carpeta `assets/` completa al proyecto.
2. Ajustar las rutas. Cargar `art-direction.css` y luego `proposals.css` después de `styles.css`, y los scripts `scroll.js` y `story-scroll.js` con `defer` después de que exista el HTML.
   Cargar también `proposals-motion.js` con `defer` para las animaciones de propuestas.
3. La sección `#propuestas` contiene las seis iniciativas del PDF de campaña. Sus textos son HTML editable; los detalles usan elementos nativos `details` y `summary`.
4. Si el sitio tiene una cabecera fija, reservar su altura o ajustar `top` y la altura de `.sticky-frame`.
5. Evitar `overflow: hidden/auto/scroll` en los padres de `.scroll-scene`, porque puede cambiar el contenedor de referencia de `position: sticky`.

El CSS incluye algunas reglas globales para la demo (`body`, enlaces y `box-sizing`): fusionarlas con las del sitio en lugar de pegarlas ciegamente. En React, iniciar la lógica al montar el componente y retirar listeners/observer y cancelar el frame al desmontarlo; no ejecutar el script durante el render del servidor.

## Ajustes

- Duración del hero: `--scroll-distance` en `styles.css` (240svh en escritorio y 190svh en móvil).
- Distancias, giros y escala del hero: función `render()` en `scroll.js`.
- Tiempos de cada fase: intervalos de `ease(p, inicio, fin)`, entre 0 y 1.
- Colores: variables de `styles.css` y `art-direction.css`. La salida usa morado y la frase está sobre papel crema.
- Tamaño y margen de la frase: `.statement-section` y `.statement-art` en `styles.css`.

Las frases del hero son tres PNG transparentes independientes: `que-la.png`, `plata.png` y `se-vea.png`, generados con `image_gen` a partir del estilo del póster. La cola completa de la Q pertenece a `que-la.png`; ninguna línea contiene partes de otra. Los límites de tinta de `phraseAssets` sirven para alinear las imágenes completas; no se recortan las letras. Las capas de texto usan `overflow: visible`.

La frase posterior está en `assets/statement.png`, una composición gráfica generada a partir de las referencias tipográficas. La imagen se marca como decorativa y un encabezado equivalente contiene la frase completa para lectores de pantalla. Para cambiar el texto se debe regenerar o reemplazar el arte y actualizar ese encabezado.

El retrato y la firma siguen usando ventanas CSS del póster original. El texto rasterizado no es editable: para cambiar el eslogan habrá que sustituir el arte o reconstruir las letras como texto web. El H1 semántico conserva el contenido accesible para lectores de pantalla. El diseño móvil reorganiza los bloques y muestra una firma HTML legible. Se espera la carga de todos los archivos antes de activar las capas; ante un error se conserva el póster completo.

La composición de frase mide 1672 × 941 px. Aumentar mucho su tamaño puede revelar píxeles; se mantiene una escala contenida para esta demo.

## Quién soy

La sección `#quien-soy` queda entre la frase introductoria y las propuestas. El bloque de presentación y retrato se eliminó en la versión 12. Se conserva el identificador para mantener los enlaces existentes.

La biografía tiene tres franjas de lectura directa, estilo póster: Canadá, deporte y tecnología. Alternan texto a la izquierda, derecha e izquierda, con collages al lado opuesto. La cronología deportiva actual es: entrenamientos en Canadá, maratón, dos terceros lugares en Cali, fractura haciendo kitesurf y natación actual. El Ironman se presenta como aspiración. El total mostrado es $5.600.000 recibidos en siete meses, calculado con los $800.000 mensuales indicados por el usuario. El nombre confirmado de la constructora es Acción Raíz y se usa su logo original.

Canadá combina la foto en la nieve y la foto con amigos en Winnipeg. Deporte incluye `maraton-recorte.png`, generado con imagegen desde la captura entregada, además de la foto del cheque y la radiografía originales. Tecnología incorpora la foto de la pizarra del archivo personal, el logo de Acción Raíz y un rótulo de siete meses en uso. La foto de la pizarra no se identifica como un registro del proyecto del bot. Los originales se conservan; los encuadres e inclinaciones se aplican en CSS. La versión 14 incorpora la transición entre pósters descrita al final.

Las tres franjas siempre están apiladas. En escritorio cada una tiene dos columnas; hasta 700 px, texto e imágenes quedan uno debajo del otro. Las historias desembocan directamente en las seis iniciativas de campaña. El enlace `#historias` permite ir directamente a los pósters.

## Dirección artística — versión 11

| Color | Hex | Uso |
| --- | --- | --- |
| Azul principal | `#0B2F77` | Texto, formas, cierre y continuidad con el hero |
| Naranja acción | `#FF6A00` | Halo del retrato y acentos deportivos |
| Amarillo visible | `#FFC400` | Tecnología, marcos y acentos |
| Morado acento | `#4A0090` | Deporte, lettering, salida del hero y formas |
| Blanco base | `#FAFAF2` | Fondo general, Canadá y texto sobre morado |

Los tres titulares están en `titulo-canada-v11.png`, `titulo-deporte-v11.png` y `titulo-tecnologia-v11.png`. Los prompts exactos están en `PROMPTS-TITULARES-V11.md`. Cada imagen es decorativa dentro de un H3 que incluye el mismo texto accesible; al cambiar una frase hay que actualizar ambos. Tecnología dice «Un agente que sí trabaja» y su relato presenta el trabajo para Acción Raíz sin mencionar una primera oportunidad.

Se eliminaron los pies de foto y el título visible «Quién soy». Los collages añaden órbitas, tramas, estrellas y formas asimétricas, con la transición entre historias de la versión 14. La foto del cheque ocupa casi todo el ancho de su collage y conserva el encuadre completo. La foto grupal de Canadá se recorta mediante `.group-crop` hasta el amigo de camiseta negra, incluido; el archivo original queda intacto.


## Ajustes de la versión 12

La base vuelve al beige `#EAE5DC` del hero. `--white` conserva `#FAFAF2` para el texto claro. La frase usa mezcla multiplicada, ajuste de luminancia y una máscara suave en los bordes para integrar el papel del PNG con el fondo beige; el original queda intacto.

Tecnología usa fondo azul, texto blanco y amarillo, con acentos naranja. El título es HTML/CSS editable: «Un agente de IA que sí trabaja». La generación de la nueva imagen no pudo completarse por límite de uso; se implementó lettering web sin alterar el raster anterior. Los dos titulares restantes siguen siendo imágenes con texto accesible equivalente.


## Transiciones de historias — versión 14

`story-scroll.js` activa el apilado progresivo. Cada póster se desplaza hasta que su borde inferior llega al borde inferior de la pantalla; entonces queda fijo mientras el siguiente lo cubre. Esto permite leer historias más altas que la pantalla, especialmente en móvil. Durante la superposición, el contenido anterior se reduce hasta un 3,5 %, sube hasta 18 px y pierde un 14 % de opacidad. Todo se invierte al subir.

No se intercepta la rueda ni se fuerza el desplazamiento. La altura y los puntos de fijación se recalculan al redimensionar, cambiar fuentes o variar el contenido. Con movimiento reducido, o sin JavaScript, las historias se leen en flujo normal. Para desactivar esta prueba basta retirar la carga de `story-scroll.js`; el diseño estático permanece disponible.

Verificado en 1440, 390 y 320 px: ambas transiciones, lectura completa antes de fijar, retorno al subir, enlace a propuestas y movimiento reducido.


## Propuestas — versión 15

Contenido basado en `VELCHO POSTS.pdf`, páginas 3 a 8, entregado por el usuario. Se reorganiza para presentar primero el tablero, luego metas, plantilla común, compras conjuntas, planeación anual y reconocimientos. Los textos explican las propuestas sin presentar los sistemas o convenios futuros como ya implementados.

La sección `#propuestas` usa `proposals.css`: cabecera beige, tablero gráfico azul, paneles amarillo, beige, morado y naranja, y cierre de reconocimientos. La versión 16 incorpora titulares e ilustraciones generados; conserva textos HTML accesibles y explicaciones editables. No usa cifras ilustrativas que puedan confundirse con cuentas reales.

Cada iniciativa tiene un desplegable «¿Cómo funcionaría?», disponible con ratón, táctil y teclado. No requiere JavaScript. La sección fluye normalmente después de las historias animadas. Revisada en 1440, 768, 390 y 320 px, incluyendo los seis desplegables, Enter, enlaces y desbordamientos.


## Arte de propuestas — versión 16

Se incorporan diez PNG transparentes en `assets/proposals/`: un titular general, seis titulares de iniciativas y tres ilustraciones en semitonos. El recibo con lupa representa las cuentas; las manos con una caja, las compras conjuntas; la escarapela con pulgar arriba, el reconocimiento. Son ilustraciones conceptuales, no documentos ni registros reales.

Los prompts exactos están en `PROMPTS-PROPUESTAS.md`. El fondo beige, las tintas azul, amarillo, naranja y morado, las órbitas y la tarjeta de calendario se componen en `proposals.css`. Las imágenes se cargan de forma diferida y reservan su tamaño para evitar saltos. Cada titular conserva una versión HTML accesible dentro de su encabezado.

El contenido de las seis propuestas y sus desplegables se mantiene. Se comprobó la carga de las diez imágenes, lectura visual en escritorio y celular, navegación con teclado, enlaces y ausencia de desbordamientos en 1440, 768, 390 y 320 px.

## Mascotas y demostración — versión 17

«Las cuentas, a la vista» incorpora el archivo `Demo cuadrado.mp4` entregado por el usuario, copiado sin modificar a `assets/proposals/cuentas-demo.mp4`. Sustituye la ilustración de la factura. Conserva el encuadre cuadrado completo, con reproducción automática en bucle, sin sonido, inline en móviles y controles nativos para pausar o ampliar. El poster de carga es un fotograma del mismo video. El contenido del video es una demostración del tablero.

Tres ilustraciones nuevas adaptan al jaguar y la iguana del colegio al acabado en semitonos: ambos llevan una caja en compras, la iguana organiza el calendario y ambos aparecen en la escarapela de reconocimiento. Se usan las referencias sin gorra proporcionadas para esta versión. Los prompts exactos y las rutas de referencia están en `PROMPTS-MASCOTAS.md`. La factura con patas de jaguar también se generó, pero se dejó fuera de la página por la solicitud posterior del video.

Verificado: carga de las diez imágenes, reproducción automática del video y reinicio al llegar al final, seis desplegables, teclado, enlaces y ausencia de desbordamiento en 1440, 768, 390 y 320 px. Se revisaron capturas de las ilustraciones en móvil y el tablero en escritorio.


## Versión 18

Se retira el bloque «Ya sabes un poco de mí. Ahora vamos con el colegio» y su enlace. Las historias pasan directamente a la cabecera de propuestas.

## Título de tecnología — versión 19

«Un agente de IA que sí trabaja» ahora usa lettering generado con image_gen, en `assets/titulo-tecnologia-v19.png`: letras irregulares crema y amarillo, IA destacada y acentos naranja, sobre transparencia. El encabezado conserva el texto accesible. Prompt en `PROMPT-TITULO-TECNOLOGIA-V19.md`. Carga y encuadre revisados en 1440, 390 y 320 px, sin desbordamientos.

## Propuestas animadas — versión 20

`proposals-motion.js` introduce los titulares con giro y una pequeña recuperación de escala. Textos, etiquetas, ilustraciones y video entran al aparecer en pantalla; cada entrada ocurre una sola vez. No se fija el scroll ni se oculta contenido antes de activar JavaScript.

Las mascotas flotan suavemente y la medalla se balancea. Las órbitas y la flecha de cabecera acompañan ese movimiento, que se pausa fuera de pantalla. Los titulares reaccionan al cursor; los desplegables muestran su contenido con una entrada breve y conservan el comportamiento nativo y el teclado.

Con `prefers-reduced-motion: reduce`, se desactivan los efectos de propuestas. Sin JavaScript todo el contenido permanece visible. El video conserva la reproducción en bucle pedida por el usuario y sus controles de pausa.

## Detalles y mascotas quietas — versión 21

Se retiran los movimientos continuos de mascotas, medalla, órbitas y flecha. Las ilustraciones tampoco participan en la entrada al hacer scroll. Se conservan las entradas breves de títulos y textos, y las respuestas al cursor y teclado.

La cabecera incluye un índice de seis enlaces a las propuestas, con números encerrados en contornos irregulares. Los separadores imitan trazos de tinta; el texto de entrada subraya su idea final en naranja. Los desplegables incorporan indicadores circulares y una guía lateral al abrirse. El cierre termina con un borde irregular de papel. Todo se construye con HTML/CSS, sin nuevas imágenes ni dependencias.


## Versión 22

Se retira el índice numerado de propuestas y sus estilos. La cabecera conecta directamente con la primera propuesta.

## Propuestas más concretas — versión 23

Se reescriben los resúmenes y las explicaciones de las seis propuestas con lenguaje directo y ejemplos de uso. Las mejoras planteadas incluyen recibos consultables desde cada gasto, metas elegidas por el salón, cierre de cada actividad, una hoja que calcule saldos y alimente el tablero, historial de cambios, comparación de precios antes de un pedido conjunto y estados visibles de cada evento.

El reconocimiento mensual incorpora criterios públicos y ejemplos que otros salones puedan aprovechar. El avance se compara por porcentaje dentro de cada sección. Estos mecanismos se presentan como propuestas por desarrollar; no como funciones ya construidas. Se mantienen el diseño, los titulares generados, el video y las mascotas quietas.
