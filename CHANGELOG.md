# CHANGELOG

Registro del estado conocido y la evolución del proyecto. No se dispone de fechas exactas de cada cambio, por lo que se usan versiones conceptuales y la sección `Unreleased` para el estado actual.

> El código es la fuente de verdad. Este changelog describe hitos funcionales, no commits individuales.

## Unreleased

### Estado actual

- **Home**: dos secciones (Destacados y Nuevos), buscador global, tarjetas con aparición progresiva, botones "Ver todo".
- **Explorar**: filtros (categoría, género, sistema operativo, año), ordenamiento (recientes/populares/A-Z), paginación (12 por página), contador, "Limpiar filtros".
- **Herramientas**: enlaces externos (WinRAR, UltraISO, DAEMON Tools, qBittorrent, µTorrent) en pestaña nueva con `rel="noopener noreferrer"`.
- **Ventana del juego (overlay)**: marco tipo ventana de escritorio, tres puntos de control, portada 2:3, descripción real, pestañas (Información/Requisitos/Galería), botones Descargar y Comprar que abren enlaces externos.
- **Analítica + ranking**: `NOXIS.Analytics` envía eventos al Worker; `NOXIS.Data.init()` reordena por popularidad real (con fallback estático). Tráfico medido con Cloudflare Web Analytics.
- **Datos**: `NOXIS.Data` con 11 juegos reales (descripción, requisitos, ficha técnica, enlaces y galería) y 5 herramientas.

### Cambios recientes

- **Home: se elimina "Más populares" y "Destacados" se ordena por popularidad**: *Más populares* era redundante con *Destacados* (todos los juegos tienen `featured: true` y el dedupe dejaba ese carril con una sola tarjeta). Ahora la Home tiene **dos secciones**: *Destacados* (todos los `featured`, ordenados por popularidad real —descargas/interacciones— con fallback al campo estático `popular`) y *Nuevos* (por año). Se quitó el corte a 8 dentro de cada `select`, así el reparto sin repetidos muestra los **11** juegos (6 + 5). `?v=` subido a `33`.

- **5 juegos nuevos**: se agregaron **Gears of War: E-Day — Premium Edition** (2026), **Grand Theft Auto V** (2015), **Little Nightmares III** (2025), **The Last of Us Part I** (2023) y **The Witcher 3: Wild Hunt — Remastered** (2026). Assets en `assets/images/games/<id>/` + objetos en `js/data.js` (descripción, requisitos, ficha, enlaces, galería y DLC; GTA V sin requisitos por no estar en su ficha). El catálogo pasa de 6 a **11 juegos**. DLC cargados: Gears (7), Little Nightmares III (8), The Last of Us Part I (2), The Witcher 3 (5); GTA V sin `dlc`. `?v=` subido a `32`.

- **Escritura de encabezados**: al entrar a Inicio (eyebrow, título, subtítulo) o a Explorar (cabecera) el texto se "escribe" letra a letra con un cursor fino y brillante (módulo autónomo `js/typewriter.js`, invocado por `home.js` y `explore.js` con la vista como *scope*). Las letras se envuelven y **se ocultan apenas carga el módulo** (no se ve el texto completo antes de animar) y la escritura **arranca sincronizada con el fundido del loader** en la primera carga; incluye **cadencia orgánica** y **micro-pausas tras comas y puntos**. El título de Inicio conserva el degradado (`--grad-hero`) repartido de forma continua entre las letras (medido tras `document.fonts.ready`); el texto animado es `aria-hidden` con `aria-label` completo; se omite con `prefers-reduced-motion` y se re-ejecuta al volver a cada vista.
- **Fondo dinámico (orbes flotantes)**: nueva capa fija global (`.orbs` en `global.css`) con **40 orbes pequeños e idénticos** (mismo tamaño, color y brillo del acento; solo cambian posición y tempo) que ascienden lentamente con leve vaivén, visibles en Inicio y Explorar y por detrás del contenido. Los genera `js/orbs.js` (también aplica un **parallax sutil** de ±16px con el puntero, solo en punteros finos). Solo usa `transform`/`opacity` (sin `filter: blur`); se apagan con `prefers-reduced-motion` (quedan estáticos) y se reducen en móvil.
- **DLC / contenido adicional**: nuevo campo opcional `dlc` en `data.js` (array de nombres). La ficha del juego muestra un bloque **"Contenido adicional (DLC)"** dentro de la pestaña *Información* (solo si el juego tiene `dlc`). Retro-cargado en los juegos que lo incluían (Thrones and Patriots, Uprising, Phantom Liberty, Red Dead Online, Lord of Destruction). Flujo de detección documentado en `AGREGAR-JUEGO.md`.
- **Google Search Console**: se agrega la meta etiqueta de verificación (`google-site-verification`) en `index.html` y un `sitemap.xml` en la raíz con la URL pública, para habilitar la indexación en Google.
- **Nuevo juego**: **Diablo II: Resurrected — Infernal Edition** (PC, 2021) agregado al catálogo (assets en `assets/images/games/diablo-ii-resurrected/` + objeto en `js/data.js`).
- **Favicon**: se declaran `assets/images/favicon-32.png` y `assets/images/apple-touch-icon.png`, más `theme-color` y `color-scheme: dark`. Se elimina el 404 de `favicon.ico`.
- **Fix visual de las tarjetas**: la portada escalada + `filter` se recortaba mal en las esquinas redondeadas y dejaba un borde irregular (visible sobre todo en hover). Ahora la portada y su `.game-card__cover` se recortan de forma robusta (`isolation`, `border-radius` propio, `translateZ(0)`, `backface-visibility`); el reveal/hover usa `translate3d` para conservar la capa promovida. El texto de la tarjeta queda perfectamente alineado.
- **Home sin juegos repetidos**: `Data.getSections()` reparte los carriles (Destacados / Nuevos / Más populares) sin repetir títulos, adapta el tamaño por sección (máx. 8) y **omite las secciones vacías** (la vista las oculta).
- **"Ver todo" con contexto**: cada botón de sección navega a Explorar heredando el orden de esa sección (`featured`/`popular` → populares, `new` → recientes).
- **Buscador unificado**: las sugerencias (`#global-search` / `#search-suggest`) se movieron de `home.js` a `app.js` y son compartidas por Home y Explorar. Salir del buscador (Escape, clic afuera o elegir una sugerencia) limpia el input y **restaura** la vista.
- **Botón "Volver arriba"**: botón flotante (`#back-to-top`) que aparece tras 600 px de scroll.
- **Accesibilidad**: foco de teclado visible y consistente (`:focus-visible`); la ventana del juego atrapa el foco (Tab), enfoca al abrir y **devuelve el foco** al cerrar; el punto de cierre es un `<button>` real y la ventana usa `aria-labelledby`. Se corrige la fuga del listener de `Escape` (antes solo se desregistraba al cerrar con Esc).
- **Áreas táctiles**: en dispositivos de puntero grueso, los interactivos (enlaces, píldoras, paginación, galería, botones) alcanzan ≥44 px.
- **Rendimiento**: los halos de fondo del `body` pasan a una capa fija (`body::before`) en vez de `background-attachment: fixed`; se quita `will-change` de la portada y se agrega `decoding="async"` a las imágenes.
- **Detalles de UI**: aparición escalonada de tarjetas (`--i`) y estado vacío en Explorar ("No se encontraron juegos con esos filtros").
- **Documentación**: nuevo **[AGREGAR-JUEGO.md](AGREGAR-JUEGO.md)** con el flujo paso a paso para cargar un juego; `DEPLOY.md` advierte que el hosting es **Cloudflare Workers** (no GitHub Pages).
- **Logo de marca**: el header usa `assets/images/logo.webp` (generado desde `Logo1.png`, recortado y con el fondo crema eliminado). Se muestra **cuadrado y llenando** el espacio del logo (`object-fit: cover`) con esquinas redondeadas (`--radius-sm`), sin caja, borde ni fondo detrás.
- **Chip de tamaño en las tarjetas**: la vista previa de cada juego (Home y Explorar) ahora muestra el tamaño real (`specs.tamano`) como chip sobre la portada, sin necesidad de abrir la ficha.
- **Publicado en producción (Cloudflare)**: el sitio se sirve desde Cloudflare Workers (`noxis-hub-app.nicolabarranco2.workers.dev`), con **deploy automático al hacer push a `main`**. Se abandonó GitHub Pages.
- **Worker de ranking publicado**: `noxis-rank` desplegado en Cloudflare con binding a KV `NOXIS_EVENTS` (id `d41ce0b8a6894be9a5cafa4042a3cd54`). Endpoints verificados en vivo: `GET /popular` y `POST /event`.
- **Documentación de despliegue**: nuevo `DEPLOY.md`; actualizados `AI_CONTEXT`, `ARCHITECTURE`, `PROJECT_STATUS`, `DECISIONS`, `README`, `CONTRIBUTING` y `DEVELOPMENT` con el estado real (hosting, Worker, analítica, datos reales y flujo de deploy).
- **Ranking por interacciones (backend)**: nuevo `worker/index.js` (Cloudflare Worker + KV) con endpoints `POST /event` y `GET /popular`. Score ponderado `open=1, download=5, purchase=2` con decaimiento exponencial de 30 días y dedupe por sesión.
- **`NOXIS.Analytics`**: nuevo módulo `js/analytics.js` que envía eventos anónimos (apertura de ficha, Descargar, Comprar) vía `sendBeacon`; inactivo en localhost/file.
- **Popularidad dinámica**: `NOXIS.Data.init()` consulta `/popular` y reordena la sección "Más populares" y el orden "populares" de Explorar según interacciones reales. Sin backend o sin conexión, usa el campo estático `popular`.
- **Analítica de tráfico**: el sitio se sirve desde Cloudflare con **Cloudflare Web Analytics** activado (visitas, páginas, referrers).
- **Header responsive (móvil)**: el nav pasa a dos filas vía grid (marca+cuenta / enlaces+buscador), eliminando el desbordamiento horizontal de la página en celulares.
- **Fix del enlace activo en móvil**: "Inicio" dejaba de verse más alto/desparejo que "Explorar"; los `.nav__link` ahora son cajas atómicas (`inline-flex` + `nowrap`) y el subrayado activo vuelve a renderizarse (antes quedaba con ancho 0).
- Agregado `rating` a todos los juegos y `url` oficial a las herramientas en `js/data.js`.
- Agregada herramienta **qBittorrent** y actualizadas las URLs de las herramientas a las oficiales.
- Convertida la ficha del juego de vista placeholder a **overlay** (`NOXIS.Game`).
- Añadido botón **Comprar** (secundario) debajo de **Descargar**.
- Control de ventana: el **punto rojo** cierra la ventana; eliminada la "X" del extremo derecho.

## Versiones conceptuales anteriores

### v0.1 — Núcleo y navegación

- Router manual (`NOXIS.App`), loader inicial, header sticky.
- Vistas `home` y `explore`.
- Fuente de datos `NOXIS.Data` con datos de prueba.

### v0.2 — Home y Explorar

- Secciones de Home y buscador.
- Filtros, ordenamiento y paginación en Explorar.
- Tarjetas reutilizables (`.game-card`).

### v0.3 — Ventana del juego

- Ficha individual del juego (inicialmente placeholder, luego overlay).
- Pestañas y botones de acción preparados.
- Herramientas como enlaces externos reales.

---

> Para el estado detallado actual, ver [PROJECT_STATUS.md](PROJECT_STATUS.md). Para pendientes y deuda técnica, ver su sección "Deuda técnica / riesgos conocidos".