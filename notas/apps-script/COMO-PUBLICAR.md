# Conectar el formulario a la hoja de cálculo

Backend: `Codigo.gs` (en esta misma carpeta).
Hoja destino: la hoja de cálculo de la campaña (el enlace lo tiene Sebastián;
no se escribe aquí porque este repositorio es público).

Esta parte hay que hacerla desde tu cuenta de Google; no se puede automatizar
desde aquí. Son unos cinco minutos.

## 1. Crear el script

1. Abre la hoja de cálculo.
2. Menú **Extensiones → Apps Script**. Se abre un editor con un `Codigo.gs` vacío.
3. Borra lo que traiga y pega el contenido completo de `Codigo.gs` de esta carpeta.
4. Guarda (⌘S). Ponle nombre al proyecto, por ejemplo «Buzón campaña».

## 2. Probar antes de publicar

1. En el selector de funciones del editor, elige **probar** y dale a **Ejecutar**.
2. Google va a pedirte permiso para que el script edite la hoja. Acepta.
   Va a aparecer una pantalla de «Google no ha verificado esta aplicación»:
   es normal, es tu propio script. Entra en *Configuración avanzada* →
   *Ir a Buzón campaña (no seguro)*.
3. Revisa la hoja: debe haber aparecido una pestaña **Respuestas** con una fila
   de prueba. Si está, el backend funciona. Borra esa fila cuando quieras.

## 3. Publicar como aplicación web

1. Botón **Implementar → Nueva implementación**.
2. En el engranaje, tipo **Aplicación web**.
3. Configura exactamente así:
   - **Ejecutar como:** Yo (tu correo)
   - **Quién tiene acceso: Cualquier usuario** ← importante

   Si eliges «Cualquier usuario con una cuenta de Google», el formulario va a
   fallar para todo el que no esté con sesión iniciada. Tiene que ser
   **Cualquier usuario**.
4. **Implementar**. Copia la **URL de la aplicación web**; termina en `/exec`.

Para comprobar que quedó: abre esa URL en el navegador. Debe responder
`{"ok":true,"mensaje":"Buzón activo"}`.

## 4. Enchufarla al sitio

En `site/feedback.js`, línea 12:

```js
const FEEDBACK_ENDPOINT = 'https://script.google.com/macros/s/AKfy.../exec';
```

Con eso el botón se habilita solo y el mensaje de «este buzón todavía no recibe
mensajes» desaparece. Sube el `?v=25` de `feedback.js` en `index.html` si vuelves
a editar el archivo después.

## Si más adelante cambias el Codigo.gs

Editar y guardar **no** actualiza lo que está publicado. Hay que ir a
**Implementar → Administrar implementaciones → ✏️ editar → Versión: Nueva
versión → Implementar**. La URL `/exec` no cambia.

## Detalles que ya están resueltos

- **CORS.** Apps Script no responde la petición *preflight*, así que
  `feedback.js` envía `Content-Type: text/plain` en vez de `application/json`.
  El cuerpo sigue siendo JSON y `Codigo.gs` lo lee con
  `JSON.parse(e.postData.contents)`. Si alguien cambia ese header a
  `application/json`, el formulario deja de funcionar desde el navegador.
- **El año** llega como número (`"11"`) y se guarda como palabra («Once»).
- **La URL `/exec` no es un secreto.** Solo permite ejecutar `doPost`; no da
  acceso a la hoja ni a tu cuenta. Por eso puede ir en `feedback.js` sin romper
  la regla de no publicar tokens.
- **Spam.** El buzón queda abierto a cualquiera que encuentre la URL. Para una
  campaña de colegio es asumible. Si llega basura, lo más simple es agregar un
  campo trampa oculto en el formulario y descartar en `Codigo.gs` los envíos que
  lo traigan lleno.
