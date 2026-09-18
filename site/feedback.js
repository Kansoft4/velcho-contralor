/* Destino del formulario: una Web App de Google Apps Script que escribe en la
   hoja de cálculo de la campaña. El código del backend está en
   notas/apps-script/Codigo.gs, junto con las instrucciones para publicarlo.

   Pega abajo la URL que termina en /exec que Google entrega al publicar.
   Mientras esté vacía, el botón queda deshabilitado y el sitio muestra
   «Este buzón todavía no recibe mensajes».

   Esa URL es un punto de entrada público, no una credencial: solo permite
   ejecutar doPost y no da acceso a la hoja. Sigue en pie la regla de no poner
   tokens ni secretos de webhook en este archivo. */
const FEEDBACK_ENDPOINT = '';

(() => {
  const form = document.querySelector('#feedback-form');
  if (!form) return;
  const button = form.querySelector('button[type="submit"]');
  const message = form.elements.message;
  const status = document.querySelector('#feedback-status');
  const count = document.querySelector('#feedback-count');
  let sending = false;
  message.addEventListener('input', () => { count.textContent = message.value.length; });
  if (FEEDBACK_ENDPOINT) {
    button.disabled = false;
    status.textContent = 'Cuéntame tu idea con tus palabras.';
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!FEEDBACK_ENDPOINT || sending || !form.reportValidity()) return;
    const payload = {name: form.elements.name.value.trim(), year: form.elements.year.value, message: message.value.trim()};
    if (!payload.name || !payload.message) {
      status.textContent = 'Escribe tu nombre y tu propuesta o inquietud.';
      return;
    }
    sending = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Enviando tu idea…';
    try {
      /* Apps Script no contesta la petición preflight de CORS, así que el envío
         debe ser una petición simple: por eso text/plain y no application/json.
         El cuerpo sigue siendo JSON; Codigo.gs lo lee con
         JSON.parse(e.postData.contents). */
      const response = await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify(payload), redirect: 'follow', signal: AbortSignal.timeout(15000)
      });
      if (!response.ok || (await response.json()).ok !== true) throw new Error('Submission not confirmed');
      form.reset();
      count.textContent = '0';
      status.textContent = '¡Tu idea llegó! Gracias por contarme.';
    } catch {
      status.textContent = 'No pudimos confirmar el envío. Tu texto sigue aquí; puedes intentar de nuevo.';
    } finally {
      sending = false;
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
