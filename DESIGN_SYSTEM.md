# NOXIS Design System

Documentación de la identidad visual actual de NOXIS, deducida del código real.

## Identidad actual

NOXIS usa una estética **oscura, tecnológica y premium**, inspirada en interfaces de escritorio modernas, con microinteracciones discretas:

- Fondos oscuros / negro profundo.
- Blanco y grises para texto.
- Azul eléctrico como acento principal; violeta en degradados muy sutiles.
- Superficies oscuras elevadas, bordes discretos, sombras marcadas.
- Glass / blur en header y ventana de juego.
- Minimalismo; sin saturación visual.

> **Nota**: esta sección describe la identidad **actual** (lo que el código implementa hoy). Las *ideas futuras* que aún no están en el código no forman parte de la identidad actual.

## Tokens (variables CSS) — `css/global.css`

Definidas en `:root`:

### Paleta

| Variable | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#05060a` | fondo principal |
| `--bg-elev` | `#0b0d12` | fondo elevado (ventana) |
| `--bg-soft` | `#0f1218` | fondo suave |
| `--surface` | `#10141b` | superficie (tarjetas) |
| `--surface-2` | `#171b23` | superficie 2 (scrollbar) |
| `--text` | `#f5f7fc` | texto principal |
| `--text-dim` | `#98a1b0` | texto secundario |
| `--text-faint` | `#5c6472` | texto tenue |
| `--line` | `rgba(148,163,184,0.10)` | borde sutil |
| `--line-strong` | `rgba(148,163,184,0.20)` | borde fuerte |
| `--accent` | `#3b82f6` | acento azul |
| `--accent-soft` | `#6ea8ff` | acento suave |
| `--accent-deep` | `#2f6fe0` | acento profundo |
| `--accent-glow` | `rgba(59,130,246,0.32)` | resplandor |
| `--violet-soft` | `#a78bfa` | violeta sutil |

### Degradados

| Variable | Valor |
| --- | --- |
| `--grad-brand` | `linear-gradient(135deg, #3b82f6 0%, #7c5cf5 100%)` |
| `--grad-card` | degradado vertical para el cuerpo de las tarjetas |
| `--grad-card-top` | degradado superior sutil para profundidad |
| `--grad-hero` | `linear-gradient(92deg, #ffffff, #cfe3ff, #6ea8ff, #a78bfa)` (texto con clip) |

### Sombras

| Variable | Uso |
| --- | --- |
| `--shadow-sm` | sombra suave |
| `--shadow-md` | sombra media (portada ventana) |
| `--shadow-lift` | hover de tarjeta (incluye anillo azul) |
| `--shadow-card` | sombra base de tarjeta |

### Radios

| Variable | Valor |
| --- | --- |
| `--radius-sm` | `9px` |
| `--radius-md` | `13px` |
| `--radius-lg` | `18px` |
| `--radius-pill` | `999px` |

### Tipografía

| Variable | Valor |
| --- | --- |
| `--font-display` | `"Sora", system-ui, sans-serif` (títulos, botones) |
| `--font-body` | `"Inter", system-ui, sans-serif` (texto) |

### Otros tokens

| Variable | Valor | Uso |
| --- | --- | --- |
| `--ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | curva de easing estándar |
| `--dur` | `0.34s` | duración de transición estándar |
| `--maxw` | `1320px` | ancho máximo del contenedor |
| `--nav-h` | `60px` | altura del header |

## Tipografía

- **Sora** (600–800) para títulos, branding, botones y nombres de juego.
- **Inter** (400–600) para cuerpo, meta y controles.
- Escala fluida con `clamp()` en títulos principales (ej. `.home__title`, `.game-window__name`).

## Componentes reutilizados — `css/components.css`

- **Loader**: overlay de carga con tres puntos que pulsan.
- **Chip de tamaño**: `.game-card__size`, pill translúcida sobre la portada (arriba a la derecha) con el tamaño real del juego; presente en las tarjetas de Home y Explorar.
- **Header / nav**: sticky, con blur, contiene la marca (logo `assets/images/logo.webp` en un cuadro de 30×30 con esquinas redondeadas y `object-fit: cover`), enlaces (Inicio/Explorar), buscador y slot de cuenta (deshabilitado).
- **Tarjeta de juego** (`.game-card`): portada 2:3 con `object-fit: cover`, degradado inferior, meta (uppercase, acento), título y subtítulo. Hover: elevación + zoom leve + borde azul. Aparición progresiva por `IntersectionObserver`.
- **Backdrop** (`#app-backdrop`): capa de transición entre vistas.
- **Footer legal** (`.site-footer`): cierre de página con borde superior (`--line`), texto en `--text-dim`/`--text-faint`, copyright (`© NOXIS — Todos los derechos reservados`, año dinámico) y aviso de contenido de terceros. Presente en Inicio y Explorar.

## La ventana del juego — `css/game.css`

- Overlay `fixed` centrado, fondo translúcido con blur (`backdrop-filter`).
- Marco (`__frame`) con: borde fino, esquina `16px`, sombra profunda, fondo con degradado azul sutil.
- Barra superior (`__bar`) con tres puntos de control (rojo/amarillo/verde) y título `NOXIS / juego`.
- Portada 2:3, nombre con `--font-display`, pills de hechos (año, plataformas, rating).
- Botones: `.btn-primary` (Descargar, acento azul) y `.btn-secondary` (Comprar, neutro).
- Pestañas: *Información / Requisitos / Galería* con subrayado activo.

## Escritura de encabezados (Inicio y Explorar) — `css/home.css` + `js/typewriter.js`

- **Efecto máquina de escribir**: al entrar a Inicio (eyebrow, título, subtítulo) o a Explorar (cabecera), el texto se "escribe" letra a letra (con un cursor fino y brillante), dando entrada gradual al contenido.
- **Sin destello previo**: `js/typewriter.js` envuelve cada letra y las deja ocultas (`opacity: 0`) apenas carga el módulo (prepara Inicio y Explorar), de modo que **nunca se ve el texto completo** antes de la animación. El ancho/altura quedan reservados (las letras ocupan su lugar), así no hay saltos de layout.
- **Trabaja por scope**: cada llamada `NOXIS.Typewriter.play(vista)` reconstruye solo los encabezados de esa vista, así Inicio y Explorar no se pisan entre sí. `home.js` y `explore.js` la invocan en su `init`.
- **Arranque sincronizado**: la escritura comienza exactamente cuando el loader inicial empieza a fundirse (`transitionstart`) en la primera carga; en las visitas siguientes (sin loader) arranca al entrar a la vista.
- **Ritmo premium**: velocidad distinta por bloque, **cadencia orgánica** (leve variación por letra) y **micro-pausas tras comas y puntos**, como un mecanografiado real. Solo `opacity` (GPU).
- **Degradado continuo**: el título de Inicio conserva el degradado de `--grad-hero` en la palabra `aventura`; el módulo reparte el mismo degradado entre las letras (fondo escalado al ancho del tramo + desplazado por letra) para que el color fluya sin cortes aunque cada letra sea un elemento. Se mide tras `document.fonts.ready` para no desalinearse al cargar la tipografía.
- **Accesibilidad/rendimiento**: el texto animado va en un contenedor `aria-hidden` y se expone `aria-label` con el texto completo; con `prefers-reduced-motion` se omite por completo (texto plano, sin spans). Se re-ejecuta cada vez que se vuelve a una vista.

## Fondo dinámico — orbes flotantes (`css/global.css` + `js/orbs.js`)

Capa fija global (visible en Inicio y Explorar, por detrás de todo el contenido: `.orbs`, `z-index: -1`, `pointer-events: none`).

- **40 orbes idénticos**: los genera `js/orbs.js` como `<span class="orbs__orb">`. Todos tienen **el mismo tamaño (7px), el mismo color y el mismo brillo** (núcleo claro tenue + glow azul del acento `--accent-soft`); solo cambian en posición y tempo. Sin distinciones de tamaño/opacidad entre ellos. Son **discretos** (opacidad 0.75, glow suave) para no robar la atención del contenido.
- **Movimiento** (`@keyframes orb-float`): ascenso de ~100vh con vaivén horizontal suave y opacidad 0.75 en el tramo central; solo `transform`/`opacity` (GPU). Cada orbe con duración (34–60s) y `animation-delay` negativo distintos para que no sincronicen; aparecen/desaparecen con opacidad 0 (loop invisible).
- **Parallax**: `js/orbs.js` mueve `.orbs__layer` (máx. ±16px) según el puntero, vía las variables CSS `--orbs-px` / `--orbs-py`; la suavidad la da la `transition` de la capa. Inactivo en punteros gruesos (táctil) y con `prefers-reduced-motion`.
- **Accesibilidad/rendimiento**: la capa es `aria-hidden`; en `prefers-reduced-motion` los orbes quedan **estáticos**; en `max-width: 640px` se ocultan los últimos 16 (quedan 24).

## Reglas visuales que deben respetarse

1. Mantener la paleta oscura y el acento azul eléctrico.
2. Usar las variables de `global.css`; no hardcodear colores/radios fuera de los tokens.
3. No agrandar botones ni portadas más allá de lo actual; mantener jerarquía.
4. Microinteracciones discretas: hover sutil, animaciones suaves (`--ease`, `--dur`).
5. Evitar saturación visual y exceso de efectos.
6. Mantener tarjetas y superficies consistentes (mismos radios, bordes, sombras).
7. Respetar `prefers-reduced-motion` (ya cubierto en `global.css`).
8. Cualquier pantalla nueva debe reusar los tokens y componentes existentes.

## Breakpoints reales

- `components.css`: `1024px`, `768px`, `480px` (grid de tarjetas).
- `explore.css`: `900px` (sidebar a 1 columna), `560px` (header/sidebar a 1 columna).
- `game.css`: `820px` (portada apilada), `520px` (ventana a pantalla completa).