# CHANGELOG

Registro del estado conocido y la evolución del proyecto. No se dispone de fechas exactas de cada cambio, por lo que se usan versiones conceptuales y la sección `Unreleased` para el estado actual.

> El código es la fuente de verdad. Este changelog describe hitos funcionales, no commits individuales.

## Unreleased

### Estado actual

- **Home**: tres secciones (Destacados, Nuevos, Más populares), buscador global, tarjetas con aparición progresiva, botones "Ver todo".
- **Explorar**: filtros (categoría, género, sistema operativo, año), ordenamiento (recientes/populares/A-Z), paginación (12 por página), contador, "Limpiar filtros".
- **Herramientas**: enlaces externos (WinRAR, UltraISO, DAEMON Tools, qBittorrent, µTorrent) en pestaña nueva con `rel="noopener noreferrer"`.
- **Ventana del juego (overlay)**: marco tipo ventana de escritorio, tres puntos de control, portada 2:3, descripción real, pestañas (Información/Requisitos/Galería), botones Descargar y Comprar que abren enlaces externos.
- **Analítica + ranking**: `NOXIS.Analytics` envía eventos al Worker; `NOXIS.Data.init()` reordena por popularidad real (con fallback estático). Tráfico medido con Cloudflare Web Analytics.
- **Datos**: `NOXIS.Data` con 5 juegos reales (descripción, requisitos, ficha técnica, enlaces y galería) y 5 herramientas.

### Cambios recientes

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