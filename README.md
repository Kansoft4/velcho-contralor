# Que la plata se vea

Sitio de campaña a la **Contraloría Estudiantil** del Colegio Jefferson.
Sebastián Vélez Taylor.

→ **https://kansoft4.github.io/velcho-contralor/**

Una sola página, estática, sin dependencias: hero animado por scroll, tres
historias, seis propuestas y un buzón de ideas. Todo responde a
`prefers-reduced-motion` y el contenido se lee sin JavaScript.

## Estructura

| Carpeta | Qué es |
|---|---|
| `site/` | lo que se publica — y lo único que se publica |
| `notas/` | documentación del proyecto, prompts del arte, backend del formulario |

Las imágenes originales sin comprimir no están en el repositorio; `site/assets/`
lleva las versiones WebP que usa la página.

## Verlo en local

```bash
cd site && python3 -m http.server 8766
```

→ http://127.0.0.1:8766

## Publicación

Cada push a `main` dispara `.github/workflows/pages.yml`, que sube `site/` a
GitHub Pages. `notas/` no llega a la página.

## Estado

El formulario todavía no recibe mensajes: falta publicar el backend de Google
Apps Script. Los pasos están en `notas/apps-script/COMO-PUBLICAR.md`.

El resto del detalle técnico está en `CLAUDE.md` y `notas/INTEGRACION.md`.
