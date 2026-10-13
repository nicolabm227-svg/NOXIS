# Guía de contribución — NOXIS

Filosofía, convenciones y reglas para contribuir sin romper el proyecto.

## Filosofía de contribución

- Cambios **pequeños, controlados y verificables** por encima de refactorizaciones amplias.
- Respetar la **arquitectura** y las **decisiones** ya tomadas ([ARCHITECTURE.md](ARCHITECTURE.md), [DECISIONS.md](DECISIONS.md)).
- Documentar lo que se cambia.

## NOXIS GOLDEN RULES

1. **No rompas Home** al trabajar en otras vistas.
2. **No dupliques fuentes de datos**; usá `NOXIS.Data`.
3. **Inspeccioná antes de modificar**; leé el archivo real.
4. **Mantené la identidad visual** (oscuro, acento azul, tokens CSS). Ver [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
5. **Evitá sobrecargar la interfaz**; microinteracciones discretas.
6. **Preferí cambios pequeños y controlados.**
7. **No implementes roadmap futuro sin autorización** (Firebase, descargas, requisitos, galería, auth).
8. **Verificá JS después de cambios** (`node --check js/*.js`).
9. **Verificá responsive** después de cambios visuales.
10. **No introduzcas frameworks** sin decisión explícita.
11. **No reemplaces la arquitectura existente** (namespaces IIFE, `NOXIS.Data`) sin justificación.
12. **No inventes funcionalidades como implementadas.**
13. **Respetá el despliegue**: el sitio se publica solo con `git push`; el **Worker se despliega a mano** con `wrangler` (ver [DEPLOY.md](DEPLOY.md)).
14. **Si tocás CSS/JS, subí `?v=N`** en `index.html` (cache-busting).
15. **No commitees `Contenedor de juegos/`** (está en `.gitignore`; material crudo con posible copyright).
16. **Actualizá la documentación** cuando cambie la arquitectura o el comportamiento.
17. **No rediseñes componentes existentes** sin instrucción explícita (portada 2:3, paleta, layout de la ventana).

## Estructura y convenciones

- **JS**: un IIFE por archivo, expuesto en `window.NOXIS`. Ver [AI_CONTEXT.md](AI_CONTEXT.md).
- **CSS**: tokens en `global.css`; componentes compartidos en `components.css`; estilos por pantalla en `home.css`/`explore.css`/`game.css`.
- **HTML**: estructura estática en `index.html`; contenido dinámico generado por JS desde `NOXIS.Data`.

## Cambios visuales

1. Usá las variables CSS (`--bg`, `--accent`, `--radius-*`, `--font-*`, etc.).
2. No hardcodees colores/radios fuera de los tokens.
3. Respetá breakpoints existentes y `prefers-reduced-motion`.
4. Proba en escritorio (1280 px), tablet (900 px) y móvil (520/480 px).

## Cambios en JS

1. Leé el módulo y sus dependencias.
2. Hacé el cambio mínimo.
3. `node --check` antes y después.
4. Verificá consola limpia en el navegador.

## Cómo agregar un juego

Guía completa paso a paso en **[AGREGAR-JUEGO.md](AGREGAR-JUEGO.md)**. Resumen:

1. Poné el material crudo en `Contenedor de juegos/<Nombre>/` (gitignored).
2. Copiá la portada a `assets/images/games/<id>/portada.jpg` y la galería a `assets/images/games/<id>/complementaria-N.webp` (nombres renombrados y exactos).
3. Agregá un objeto al array `games` de `js/data.js` con la estructura documentada en [ARCHITECTURE.md](ARCHITECTURE.md#estructura-de-un-juego).
4. `node --check js/data.js`.
5. Subí `?v=N` en `index.html` y hacé `git push` (se publica solo).

No toques los módulos de vista: facetas, secciones y ficha se generan a partir de los datos.

## Despliegue

- **Sitio**: `git push origin main` → Cloudflare publica automáticamente (≈1–2 min).
- **Worker** (si cambiaste `worker/`): `npx.cmd wrangler deploy` desde `worker/`.
- Detalle, URLs y rollback: [DEPLOY.md](DEPLOY.md).

## Pruebas / validación

- No hay test framework. La validación es manual + `node --check`.
- Probar flujos: Home (búsqueda, "Ver todo"), Explorar (filtros, orden, paginación, herramientas), ventana del juego (abrir/cerrar, pestañas, botones).
- Ver [DEVELOPMENT.md](DEVELOPMENT.md).

## Reglas para no romper la arquitectura

- No leas datos fuera de `NOXIS.Data`.
- No navegues a `#view-game` como vista normal; usá `NOXIS.Game.open`.
- No sobreescribas `NOXIS.RouterHooks`; encadenalo (ver `explore.js`).
- No quites el `target="_blank" rel="noopener noreferrer"` de las herramientas.

## Seguridad

- **Enlaces externos**: las herramientas salen a sitios oficiales con `target="_blank"` y `rel="noopener noreferrer"` (mitiga `tabnabbing`). Mantené esta convención para todo enlace externo futuro.
- **Datos externos**: hoy los datos son estáticos y de confianza. Si en el futuro se cargan URLs o contenido de fuentes externas, habrá que **validar y sanitizar** antes de renderizar.
- **Futura validación de URLs**: antes de insertar una URL dinámica en un `href`, validar el esquema/protocolo para evitar `javascript:` u otros esquemas peligrosos.
- **Firebase (futuro)**: si se migra, gestionar reglas de seguridad en Firestore/Storage, y no exponer claves/secretos en el front-end.

## Checklist antes de enviar un cambio

- [ ] `node --check` en los JS modificados.
- [ ] Sin errores ni 404 en consola.
- [ ] Flujos probados (Home, Explorar, ventana del juego).
- [ ] Responsive verificado.
- [ ] Si cambió CSS/JS: subido `?v=N` en `index.html`.
- [ ] Si cambió el Worker: `wrangler deploy` ejecutado.
- [ ] Documentación actualizada (PROJECT_STATUS, CHANGELOG, etc. si aplica).