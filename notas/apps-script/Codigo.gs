/**
 * Buzón de la campaña "Que la plata se vea".
 * Recibe { name, year, message } desde site/feedback.js y agrega una fila
 * a la hoja de cálculo. Devuelve { ok: true }.
 *
 * Este archivo NO se publica con el sitio: se pega dentro del editor de Google
 * Apps Script, en un proyecto creado desde la hoja (Extensiones → Apps Script).
 * Por eso usa getActiveSpreadsheet() y no hace falta escribir el ID en ningún
 * lado: el script ya está asociado a la hoja correcta.
 */

const NOMBRE_PESTANA = 'Respuestas';

const ANIOS = {
  '4': 'Cuarto', '5': 'Quinto', '6': 'Sexto', '7': 'Séptimo',
  '8': 'Octavo', '9': 'Noveno', '10': 'Décimo', '11': 'Once', '12': 'Doce'
};

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responder({ ok: false, error: 'sin datos' });
    }

    const datos = JSON.parse(e.postData.contents);
    const nombre  = String(datos.name    || '').trim().slice(0, 120);
    const anio    = String(datos.year    || '').trim().slice(0, 10);
    const mensaje = String(datos.message || '').trim().slice(0, 2000);

    if (!nombre || !mensaje) {
      return responder({ ok: false, error: 'faltan nombre o mensaje' });
    }

    hoja().appendRow([new Date(), nombre, ANIOS[anio] || anio, mensaje]);
    return responder({ ok: true });

  } catch (error) {
    console.error(error);
    return responder({ ok: false, error: 'error interno' });
  }
}

/** Abrir la URL /exec en el navegador muestra esto. Sirve para comprobar que quedó publicado. */
function doGet() {
  return responder({ ok: true, mensaje: 'Buzón activo' });
}

/** Envuelve cualquier objeto como respuesta JSON. */
function responder(datos) {
  return ContentService
    .createTextOutput(JSON.stringify(datos))
    .setMimeType(ContentService.MimeType.JSON);
}

function hoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let pestana = libro.getSheetByName(NOMBRE_PESTANA);
  if (!pestana) {
    pestana = libro.insertSheet(NOMBRE_PESTANA);
    pestana.appendRow(['Fecha', 'Nombre', 'Año', 'Propuesta o inquietud']);
    pestana.getRange('A1:D1').setFontWeight('bold');
    pestana.setFrozenRows(1);
    pestana.setColumnWidth(1, 150);
    pestana.setColumnWidth(2, 180);
    pestana.setColumnWidth(4, 520);
  }
  return pestana;
}

/** Prueba manual: ejecuta esta función desde el editor para verificar permisos y que la fila entre. */
function probar() {
  const salida = doPost({ postData: { contents: JSON.stringify({
    name: 'Prueba desde el editor', year: '11', message: 'Si ves esta fila, el buzón funciona.'
  }) } });
  console.log(salida.getContent());
}
