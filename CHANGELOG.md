# CHANGELOG

Registro del estado conocido y la evolución del proyecto. No se dispone de fechas exactas de cada cambio, por lo que se usan versiones conceptuales y la sección `Unreleased` para el estado actual.

> El código es la fuente de verdad. Este changelog describe hitos funcionales, no commits individuales.

## Unreleased

### Estado actual

- **Home**: tres secciones (Destacados, Nuevos, Más populares), buscador global, tarjetas con aparición progresiva, botones "Ver todo".
- **Explorar**: filtros (categoría, género, sistema operativo, año), ordenamiento (recientes/populares/A-Z), paginación (12 por página), contador, "Limpiar filtros".
- **Herramientas**: enlaces externos (WinRAR, UltraISO, DAEMON Tools, qBittorrent, µTorrent) en pestaña nueva con `rel="noopener noreferrer"`.
- **Ventana del juego (overlay)**: marco tipo ventana de escritorio, tres puntos de control, portada 2:3, información, pestañas (Información/Requisitos/Galería), botones Descargar y Comprar (visuales).
- **Datos**: `NOXIS.Data` con 30 juegos y 5 herramientas.

### Cambios recientes

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