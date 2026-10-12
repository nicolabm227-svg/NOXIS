# AI_CONTEXT — Contexto para una IA de programación

> Leé este documento **antes** de modificar NOXIS. Está escrito para que una IA (o un desarrollador) comprenda el proyecto y evite romperlo.

## 1. Qué es NOXIS

Aplicación web **front-end** (HTML + CSS + JS vanilla) que muestra un catálogo de videojuegos con estética oscura premium. Sin frameworks, sin build, sin backend. Front-end puro que corre abriendo `index.html` en un servidor local.

## 2. Arquitectura (resumen)

- **Namespace global `window.NOXIS`**: todos los módulos se registran ahí.
- Módulos JS (IIFE, orden de carga en `index.html`):
  1. `data.js` → **`NOXIS.Data`** (única fuente de datos).
  2. `app.js` → **`NOXIS.App`** (router/núcleo).
  3. `home.js` → **`NOXIS.Home`** (render Home) + define `NOXIS.RouterHooks`.
  4. `explore.js` → **`NOXIS.Explore`** (filtros/paginación) + encadena `RouterHooks`.
  5. `game.js` → **`NOXIS.Game`** (ventana overlay del juego).
- CSS: `global.css` (tokens), `components.css` (header/tarjetas/loader), `home.css`, `explore.css`, `game.css`.
- Datos: `data.js` contiene arrays `games` (30) y `tools` (5), en memoria.

## 3. REGLAS FUNDAMENTALES

1. **NO asumás que una funcionalidad existe solo porque aparece en el roadmap o en la documentación de "pendiente".** Verificá siempre en el código.
2. **Inspeccioná el código antes de modificarlo.** Leé el archivo real y sus dependencias.
3. **No rediseñes componentes existentes sin una instrucción explícita.** Tamaños de portada, colores, tipografías, layout y animaciones actuales son decisiones ya tomadas.
4. **No dupliques fuentes de datos.** Toda lectura de datos debe pasar por `NOXIS.Data`. No introduzcas un segundo `games` o `tools`.
5. **No rompas Home al trabajar en otras vistas.** El router hook está encadenado; ver punto 5.
6. **Mantené la identidad visual** (ver DESIGN_SYSTEM.md): oscuro, acento azul, tokens CSS.
7. **Preferí cambios pequeños y controlados** sobre refactorizaciones amplias.
8. **No implementes roadmap futuro sin autorización** (Firebase, descargas, requisitos, galería, auth).
9. **Verificá JS después de cada cambio** con `node --check js/<archivo>.js`.
10. **Verificá responsive** después de cambios visuales.
11. **No introduzcas frameworks** (React, Vue, etc.) sin una decisión explícita.
12. **No reemplaces la arquitectura existente** (namespaces IIFE, `NOXIS.Data`) sin justificación.
13. **No inventes funcionalidades como implementadas** en la documentación.
14. **Actualizá la documentación** (PROJECT_STATUS, CHANGELOG, etc.) cuando cambie la arquitectura o el comportamiento.

## 4. Cómo trabaja el código (lo que debés saber)

- **Arranque**: `DOMContentLoaded` → `NOXIS.App.init()`.
- **Cambio de vista**: `App.navigate(route)` → `App.showRoute(route)` → oculta vistas `main[id^='view-']`, muestra la objetivo, invoca `NOXIS.RouterHooks(route, state)`.
- **RouterHooks** es una sola función global que `home.js` define y que `explore.js` **encadena** (envuelve). Si añadís otra vista con hook, seguí ese patrón (guardar `existingHook` y llamarlo).
- **Abrir juego**: el clic en una tarjeta llama `App.openGame(id)` → `NOXIS.Game.open(id)`. **No se navega a una ruta "game"**; es un overlay.
- **Cerrar juego**: punto rojo, clic en backdrop, o `Escape` → `Game.close()` (misma transición en todos los casos).
- **Fuente de datos**: el origen es `data.js`; el objetivo es poder migrar a Firebase **sin tocar las vistas** (solo habría que cambiar `Data` internamente).

## 5. Cómo hacer un cambio pequeño (receta)

1. Leé el/los archivo/s implicados.
2. Hacé el cambio mínimo que cumpla la instrucción.
3. `node --check` sobre los JS tocados.
4. Recargá en el navegador y verificá consola limpia.
5. Probá las pantallas afectadas (Home, Explorar, ventana del juego).

## 6. Cómo probar

- Servidor local (Live Server, `python -m http.server`, etc.).
- `node --check js/*.js` para sintaxis.
- Verificar que no haya 404 en consola (CSS/JS/imágenes).
- Flujos: Home (búsqueda, "Ver todo"), Explorar (filtros, orden, paginación, herramientas), ventana del juego (abrir/cerrar, pestañas, botones).

## 7. Cómo documentar

- Actualizá `PROJECT_STATUS.md` si cambió qué está implementado/pendiente.
- Registrá cambios en `CHANGELOG.md`.
- Si cambió la arquitectura, actualizá `ARCHITECTURE.md` y `DECISIONS.md`.
- Si cambió la capa de datos (`data.js`), actualizá la sección de datos y los ejemplos.

## 8. Dónde está cada cosa

- **Datos**: `js/data.js` (array `games`, array `tools`, `sections`, API `Data`).
- **Navegación**: `js/app.js`.
- **Home**: `js/home.js` + `css/home.css`.
- **Explorar**: `js/explore.js` + `css/explore.css`.
- **Ventana del juego**: `js/game.js` + `css/game.css`.
- **Componentes compartidos** (header, tarjeta, loader): `css/components.css`.
- **Tokens/paleta**: `css/global.css`.
- **Portadas**: `assets/images/cover-*.svg` (30 archivos).

## 9. Errores conocidos que no debés reintroducir

- No navegues a `#view-game` como si fuera una vista normal del router; usá `Game.open`.
- No dupliques el markup de tarjeta en otros archivos; reusá el patrón de `home.js`/`explore.js`.
- No desregistres `RouterHooks` global; encadenalo.