# AI_CONTEXT — Contexto para una IA de programación

> Leé este documento **antes** de modificar NOXIS. Está escrito para que una IA (o un desarrollador) comprenda el proyecto, su estado **real** y evite romperlo.

## 1. Qué es NOXIS

Aplicación web **front-end** (HTML + CSS + JS vanilla) que muestra un catálogo de videojuegos con estética oscura premium. **Sin frameworks, sin bundler, sin build.**

Estado real: es front-end **más un backend mínimo y opcional** para el ranking por interacciones (un Cloudflare Worker + KV). El catálogo y el sitio se alojan en **Cloudflare Workers** y se despliegan solos al hacer push a `main`. Detalle en [DEPLOY.md](DEPLOY.md).

- Sitio en vivo: `https://noxis-hub-app.nicolabarranco2.workers.dev`
- Worker de ranking: `https://noxis-rank.nicolabarranco2.workers.dev`

## 2. Arquitectura (resumen)

- **Namespace global `window.NOXIS`**: todos los módulos se registran ahí.
- Módulos JS (IIFE). Orden de carga en `index.html`:
  1. `analytics.js` → **`NOXIS.Analytics`** (envía eventos anónimos al Worker de ranking).
  2. `data.js` → **`NOXIS.Data`** (única fuente de datos + popularidad dinámica).
  3. `app.js` → **`NOXIS.App`** (router/núcleo).
  4. `home.js` → **`NOXIS.Home`** (render Home) + define `NOXIS.RouterHooks`.
  5. `explore.js` → **`NOXIS.Explore`** (filtros/paginación) + encadena `RouterHooks`.
  6. `game.js` → **`NOXIS.Game`** (ventana overlay del juego).
- CSS: `global.css` (tokens), `components.css` (header/tarjetas/loader), `home.css`, `explore.css`, `game.css`.
- Datos: `js/data.js` contiene arrays `games` (**6 juegos reales**) y `tools` (5), en memoria.
- Backend: `worker/index.js` (Cloudflare Worker) + KV `NOXIS_EVENTS`. Endpoints `POST /event` y `GET /popular`.

## 3. REGLAS FUNDAMENTALES

1. **NO asumas que una funcionalidad existe solo porque aparece en el roadmap o en la documentación de "pendiente".** Verificá siempre en el código.
2. **Inspeccioná el código antes de modificarlo.** Leé el archivo real y sus dependencias.
3. **No rediseñes componentes existentes sin una instrucción explícita.** Tamaños de portada, colores, tipografías, layout y animaciones actuales son decisiones ya tomadas.
4. **No dupliques fuentes de datos.** Toda lectura de datos debe pasar por `NOXIS.Data`. No introduzcas un segundo `games` o `tools`.
5. **No rompas Home al trabajar en otras vistas.** El router hook está encadenado; ver §4.
6. **Mantené la identidad visual** (ver [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)): oscuro, acento azul, tokens CSS.
7. **Preferí cambios pequeños y controlados** sobre refactorizaciones amplias.
8. **No implementes roadmap futuro sin autorización** (Firebase, auth, cuentas).
9. **Verificá JS después de cada cambio** con `node --check js/<archivo>.js`.
10. **Verificá responsive** después de cambios visuales.
11. **No introduzcas frameworks** (React, Vue, etc.) sin una decisión explícita.
12. **No reemplaces la arquitectura existente** (namespaces IIFE, `NOXIS.Data`) sin justificación.
13. **No inventes funcionalidades como implementadas** en la documentación.
14. **Actualizá la documentación** (PROJECT_STATUS, CHANGELOG, etc.) cuando cambie la arquitectura o el comportamiento.
15. **Respetá el despliegue**: el sitio se publica solo con `git push`; el **Worker se despliega a mano** con `wrangler`. Ver [DEPLOY.md](DEPLOY.md).
16. **Si tocás CSS/JS, subí `?v=N`** en `index.html` (cache-busting).
17. **No commitees `Contenedor de juegos/`** (material crudo, con posible copyright; está en `.gitignore`).

## 4. Cómo trabaja el código (lo que debés saber)

- **Arranque**: `DOMContentLoaded` → `NOXIS.App.init()`. Al final, `App.init()` llama a `NOXIS.Data.init()` (carga asíncrona de popularidad, no bloquea el render).
- **Cambio de vista**: `App.navigate(route)` → `App.showRoute(route)` → oculta vistas `main[id^='view-']`, muestra la objetivo, invoca `NOXIS.RouterHooks(route, state)`.
- **RouterHooks** es una sola función global que `home.js` define y que `explore.js` **encadena** (envuelve). Si añadís otra vista con hook, seguí ese patrón (guardar `existingHook` y llamarlo).
- **Abrir juego**: el clic en una tarjeta llama `App.openGame(id)` → `NOXIS.Game.open(id)`. **No se navega a una ruta "game"**; es un overlay.
- **Cerrar juego**: punto rojo, clic en backdrop, o `Escape` → `Game.close()`. La ventana gestiona el foco (trampa de Tab, foco al abrir, devuelve el foco al cerrar) y limpia su listener de teclado.
- **Buscador global**: las **sugerencias** (`#global-search` / `#search-suggest`) viven en `app.js` (`App.bindSuggest`), compartidas por Home y Explorar (antes estaban en `home.js`). Salir del buscador (Escape, clic afuera, o al elegir sugerencia) limpia el input y **restaura** la vista vía el evento `input`.
- **"Ver todo"**: cada sección de la Home navega a Explorar pasando su orden (`App.state.exploreSort`); `explore.js` lo aplica al inicializar.
- **Volver arriba**: botón flotante `#back-to-top` gestionado por `App.bindBackToTop`.
- **Fuente de datos**: el origen es `data.js`; el objetivo es poder migrar a Firebase **sin tocar las vistas** (solo habría que cambiar `Data` internamente).

### Analítica + ranking (flujo real)

1. `NOXIS.Analytics.track(type, { gameId })` envía un evento anónimo (`sendBeacon`, `text/plain`, sin cookies) al Worker. Está **inactivo en local** (`file:`/`localhost`).
2. Se instrumenta en `game.js`: `open` (al abrir la ficha), `download` y `purchase` (al pulsar los botones).
3. El Worker guarda contadores por `gameId` en KV, con dedupe por sesión (12 h) y **decaimiento exponencial de 30 días**.
4. `NOXIS.Data.init()` hace `GET /popular`, guarda el mapa `{ gameId: score }` y dispara el evento `noxis:popularity`.
5. `home.js` y `explore.js` escuchan `noxis:popularity` y **re-renderizan**. Sin backend/conexión, se usa el campo estático `popular`.

## 5. Cómo agregar un juego nuevo

**Guía completa y paso a paso en [AGREGAR-JUEGO.md](AGREGAR-JUEGO.md).** Resumen:

1. Material crudo en `Contenedor de juegos/<Nombre>/` (gitignored): `Portada.jpg`, `Complementaria N.webp`, `informacion.txt`, `.torrent`.
2. Copiá/renombrá a `assets/images/games/<id>/`: `portada.jpg` + `complementaria-1.webp`, `complementaria-2.webp`, …
3. Extraé requisitos, ficha técnica (`specs`), descripción y enlaces del `informacion.txt`.
4. Agregá un objeto al array `games` de `js/data.js` (modelo: `cyberpunk-2077`).
5. `node --check js/data.js`, subí `?v=N` en `index.html`, probá y `git push origin main`.

**No se tocan las vistas**: facetas, secciones, tarjetas y ficha se generan a partir de los datos.

## 6. Cómo hacer un cambio pequeño (receta)

1. Leé el/los archivo/s implicados.
2. Hacé el cambio mínimo que cumpla la instrucción.
3. `node --check` sobre los JS tocados.
4. Recargá en el navegador y verificá consola limpia.
5. Probá las pantallas afectadas (Home, Explorar, ventana del juego).
6. Si tocaste CSS/JS, subí `?v=N`. Si tocaste el Worker, `wrangler deploy`.

## 7. Cómo probar

- Servidor local (VS Code Live Server o `npx.cmd serve .`). **Python no está disponible** en el entorno.
- `node --check js/<archivo>.js` (incluye `js/analytics.js`).
- Consola del navegador sin errores (el favicon ya está declarado: `assets/images/favicon-32.png`).
- Backend: `npx.cmd wrangler dev` desde `worker/` para probar `/event` y `/popular` en local.
- En local, la analítica **no** envía (guard por hostname) y se usa la popularidad estática.

## 8. Despliegue (resumen)

- **Sitio**: `git push origin main` → Cloudflare publica solo (≈1–2 min).
- **Worker**: `npx.cmd wrangler deploy` desde `worker/` (manual).
- **Tráfico**: Cloudflare Web Analytics (dashboard). **Ranking**: `GET /popular`.

Detalle completo, URLs, verificaciones y rollback en [DEPLOY.md](DEPLOY.md).

## 9. Cómo hacer documentación

- Actualizá [PROJECT_STATUS.md](PROJECT_STATUS.md) si cambia el estado.
- Registrá el cambio en [CHANGELOG.md](CHANGELOG.md).
- Si cambia la arquitectura o el despliegue: [ARCHITECTURE.md](ARCHITECTURE.md), [DECISIONS.md](DECISIONS.md), [DEPLOY.md](DEPLOY.md).
- Si cambia la capa de datos: actualizá la sección de datos y los ejemplos.

## 10. Dónde está cada cosa

- **Analítica (front)**: `js/analytics.js` (`NOXIS.Analytics`, `WORKER_URL`).
- **Datos**: `js/data.js` (`games`, `tools`, `popularity`, `Data`).
- **Navegación**: `js/app.js`.
- **Home**: `js/home.js` + `css/home.css`.
- **Explorar**: `js/explore.js` + `css/explore.css`.
- **Ventana del juego**: `js/game.js` + `css/game.css`.
- **Backend de ranking**: `worker/index.js` + `worker/wrangler.toml`.
- **Componentes compartidos**: `css/components.css`. **Tokens/paleta**: `css/global.css`.
- **Portadas/galería**: `assets/images/games/<id>/portada.jpg` y `complementaria-N.jpg`.
- **Logo de marca**: `assets/images/logo.webp` (generado desde `Logo1.png`, recortado, fondo transparente; en el header se muestra cuadrado con `object-fit: cover`).
- **Favicon**: `assets/images/favicon-32.png` y `assets/images/apple-touch-icon.png` (declarados en `index.html`).
- **Flujo para cargar un juego**: [AGREGAR-JUEGO.md](AGREGAR-JUEGO.md). **Material crudo**: `Contenedor de juegos/<Nombre>/` (gitignored).

## 11. Errores conocidos que no debés reintroducir

- No navegues a `#view-game` como si fuera una vista normal del router; usá `Game.open`.
- No dupliques el markup de tarjeta en otros archivos; reusá el patrón de `home.js`/`explore.js`.
- No desregistres `RouterHooks` global; encadenalo.
- No leas datos fuera de `NOXIS.Data`.
- No dejes `WORKER_URL` desactualizado en `js/analytics.js` si cambia el nombre del Worker.
- No commitees `Contenedor de juegos/`.
