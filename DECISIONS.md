# Decisiones de arquitectura — NOXIS

Registro de las decisiones importantes adoptadas hasta ahora. El código es la fuente de verdad; estas decisiones se deducen de él.

## 1. Vanilla HTML/CSS/JS

No se usa ningún framework ni librería JS. Decisión tomada para mantener el proyecto liviano, sin build ni dependencias, y fácil de auditar.

## 2. Módulos JS con IIFE y namespace global

Cada archivo JS encapsula su lógica en una IIFE y se expone bajo `window.NOXIS` (`NOXIS.Data`, `NOXIS.App`, `NOXIS.Home`, `NOXIS.Explore`, `NOXIS.Game`). No se usan módulos ESM.

Motivo: carga directa por `<script>` en `index.html`, sin necesidad de bundler.

## 3. `NOXIS.Data` como única fuente de datos

Ninguna vista lee datos directamente de un array propio; siempre consulta `NOXIS.Data`. Esto permite migrar el origen (local → Firebase) sin tocar la interfaz.

## 4. Separación de CSS por pantalla + tokens globales

- `global.css` define la paleta y tokens (`--bg`, `--accent`, `--radius-*`, `--font-*`, etc.).
- `components.css` para componentes reutilizables (header, loader, tarjetas).
- Un CSS específico por pantalla (`home.css`, `explore.css`, `game.css`).

## 5. Router propio simple

Un router manual (`App.navigate`/`App.showRoute`) sin librería. Las vistas son elementos `main` que se ocultan/muestran con `is-hidden`. La comunicación con las vistas se hace mediante un hook `NOXIS.RouterHooks`.

## 6. La ventana del juego es un overlay, no una vista

Inicialmente la ficha del juego era una vista placeholder (`#view-game` como `main`). Se decidió convertirlo en un **overlay** (`Game.open`/`Game.close`) que se superpone a la vista activa, para abrir/cerrar sin romper el router y conservar el contexto del fondo.

## 7. Estética de "ventana de escritorio moderna"

La ventana del juego usa tres puntos de control (rojo/amarillo/verde) y un marco con sombra profunda, inspirada en ventanas de Linux modernas. El cierre se hace por el punto rojo, el fondo o `Escape`.

## 8. Preparación para Firebase (intención, no implementación)

`data.js` documenta (en comentarios) que el interior de `Data` puede sustituirse por consultas a Firebase manteniendo la misma API. Es una decisión de diseño para el futuro, no un código activo.

## 9. Enlaces externos seguros

Las herramientas se abren con `target="_blank"` y `rel="noopener noreferrer"` (mitigación de `tabnabbing`).

## 10. Accesibilidad básica

Uso de `aria-*` en vistas ocultas, overlays y controles; `aria-hidden`/`aria-label`; `prefers-reduced-motion` respetado en `global.css`.

## Decisiones NO tomadas (rechazadas por ahora)

- **Framework JS** (React/Vue/Svelte): rechazado; se mantiene vanilla.
- **Backend real / sistema de descargas**: no implementado; solo estructura visual.
- **Autenticación**: no implementada.
- **Test framework**: no se usa; la verificación es manual + `node --check`.