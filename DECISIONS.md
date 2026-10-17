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

## 11. Hosting en Cloudflare Workers (no GitHub Pages)

El sitio estático se aloja en **Cloudflare Workers** (con assets estáticos), conectado al repo de GitHub y desplegado automáticamente al hacer push a `main`. Se abandonó GitHub Pages.

Motivo: despliegue automático simple, CDN, y la misma plataforma ofrece Web Analytics y Workers/ KV para el backend.

## 12. Analítica de tráfico con Cloudflare Web Analytics

Para "ver el tráfico" se usa **Cloudflare Web Analytics** (visitas, páginas, referrers, dispositivos), sin código en el sitio y sin cookies propias.

Motivo: gratuito, sin cookies, activable desde el dashboard.

## 13. Ranking por interacciones con Worker propio + KV

Cloudflare Web Analytics **no** soporta eventos personalizados (clics por juego). Por eso el ranking se implementa con un **Cloudflare Worker propio** (`worker/index.js`) + **KV** (`NOXIS_EVENTS`), con endpoints `POST /event` y `GET /popular`.

Motivo: control total de la métrica sin introducir otro proveedor.

## 14. Métrica de popularidad: score ponderado con decaimiento

El ranking usa un score `open=1, download=5, purchase=2` con **decaimiento exponencial de media vida 30 días** (lo reciente pesa más) y **dedupe por sesión/juego/tipo** (12 h) para evitar inflar con clics repetidos.

Motivo: ponderar la intención (descargar > comprar > abrir) y evitar que datos viejos dominen para siempre.

## 15. Popularidad dinámica con fallback estático

`NOXIS.Data.init()` carga el score real y lo usa para ordenar; si no hay backend o no hay conexión, se usa el campo estático `popular`. Las vistas no cambian: se suscribe `home.js`/`explore.js` al evento `noxis:popularity`.

Motivo: degradación elegante; el sitio nunca depende del backend para renderizar.

## 16. Datos reales cargados desde "Contenedor de juegos" (gitignored)

El material crudo de cada juego (portada, galería, `.torrent`, `informacion.txt`) vive en `Contenedor de juegos/`, que está en `.gitignore` (archivos pesados y con posible copyright). Lo que se publica es la copia en `assets/images/games/<id>/` y el objeto en `js/data.js`.

Motivo: separar el material fuente del repo público.

## 17. Front y Worker se despliegan distinto

El **sitio** se despliega automáticamente al hacer push; el **Worker** se despliega a mano con `wrangler`. Se documenta explícitamente para evitar la falsa expectativa de que "todo se actualiza solo".

Motivo: el Worker no está conectado a Git; su deploy es una acción manual deliberada.

## 18. Identidad de marca: logo como imagen

La marca del header (`NOXIS`) usa una **imagen** (`assets/images/logo.webp`) en lugar del ícono SVG original. La imagen se deriva de una fuente (`Logo1.png`, no versionada): se **recorta** y se le **elimina el fondo**, dejando fondo transparente. En el header se muestra **cuadrada, llenando** el espacio (`object-fit: cover`) con **esquinas redondeadas** (`--radius-sm`), sin caja, borde ni fondo detrás.

Motivo: dar identidad visual propia al proyecto e integrar la marca con la UI oscura (sin el marco/fondo claros del archivo original).

## 19. Home de dos secciones: "Destacados" ordenado por popularidad

La Home tenía tres carriles (*Destacados*, *Nuevos*, *Más populares*) que se solapaban: como todos los juegos son `featured`, el dedupe de `getSections()` dejaba *Más populares* con una sola tarjeta y ambos carriles mostraban casi lo mismo. Se eliminó *Más populares* y *Destacados* pasó a **ordenarse por popularidad** (score real del Worker —descargas/interacciones—, con fallback al campo estático `popular`). También se quitó el corte `slice(0, 8)` dentro de cada `select` para que el reparto sin repetidos cubra los 11 juegos (6 + 5).

Motivo: cada carril tiene un rol distinto (popularidad vs. novedad) sin duplicar juegos, y la Home muestra el catálogo completo sin una sección "fantasma" de un solo ítem.

## 20. Derechos reservados: licencia propia y aviso en el sitio

Se reservan los derechos sobre **la página y su estructura** (código, diseño, arquitectura, disposición y marca) mediante un archivo `LICENSE` de "todos los derechos reservados", y se hace visible con un **footer** (`© NOXIS — Todos los derechos reservados`, año dinámico) presente en Inicio y Explorar. El contenido de los **juegos** (nombres, imágenes, marcas) queda **explícitamente excluido**: pertenece a sus desarrolladores/editoras y se usa solo con fines informativos, sin afiliación.

Motivo: reservar la autoría y originalidad del sitio y su estructura sin reclamar derechos sobre material de terceros (los videojuegos).

## Decisiones NO tomadas (rechazadas por ahora)

- **Framework JS** (React/Vue/Svelte): rechazado; se mantiene vanilla.
- **Sistema de descargas propio / pagos**: no implementado; los botones abren enlaces externos.
- **Autenticación / cuentas**: no implementada (slot de cuenta deshabilitado).
- **Test framework**: no se usa; la verificación es manual + `node --check` (y, opcionalmente, un smoke test con Edge headless vía `playwright-core`).
- **Firebase**: no implementado (intención de diseño, no código activo).