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

> **Nota**: esta sección describe la identidad **actual** (lo que el código implementa hoy). Las *ideas futuras* (fondo dinámico, etc.) no forman parte de la identidad actual.

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

## La ventana del juego — `css/game.css`

- Overlay `fixed` centrado, fondo translúcido con blur (`backdrop-filter`).
- Marco (`__frame`) con: borde fino, esquina `16px`, sombra profunda, fondo con degradado azul sutil.
- Barra superior (`__bar`) con tres puntos de control (rojo/amarillo/verde) y título `NOXIS / juego`.
- Portada 2:3, nombre con `--font-display`, pills de hechos (año, plataformas, rating).
- Botones: `.btn-primary` (Descargar, acento azul) y `.btn-secondary` (Comprar, neutro).
- Pestañas: *Información / Requisitos / Galería* con subrayado activo.

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