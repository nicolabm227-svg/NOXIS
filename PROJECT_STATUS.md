# Estado del proyecto — NOXIS

Fotografía del proyecto en el momento de redactar este documento. El código es la fuente de verdad; si algo aquí contradice el código, el código gana.

> Para despliegue y operación (Cloudflare, Worker, KV), ver [DEPLOY.md](DEPLOY.md).

---

## Implementado

### Navegación / núcleo
- Router propio en `app.js` con estado `{ route, selectedGameId }`.
- Vistas: `home` (`#view-home`) y `explore` (`#view-explore`). Transición con backdrop y scroll suave.
- Loader inicial con mínimo de presencia visual (450 ms).
- Header sticky con marca (imagen `assets/images/logo.webp`), enlaces Inicio/Explorar, buscador global y slot de cuenta (deshabilitado).

### Home
- Tres secciones: *Destacados* (featured), *Nuevos* (más recientes), *Más populares* (orden por popularidad).
- Buscador global y botones "Ver todo".
- Tarjetas con aparición progresiva (`IntersectionObserver`).

### Explorar
- Filtros por **categoría**, **género**, **sistema operativo** y **año** (píldoras), con acordeón.
- Ordenamiento: *Más recientes / Más populares / A-Z*.
- Paginación (12 por página), contador y "Limpiar filtros".
- Panel de **Herramientas** con enlaces externos.

### Tarjetas de juego (Home y Explorar)
- Cada tarjeta muestra portada, título, meta (categoría · año / subtítulo) y un **chip con el tamaño real** (`specs.tamano`) sobre la portada, visible sin abrir la ficha.

### Ventana del juego (overlay)
- Portada 2:3, kicker, título, pills (año, plataformas, rating).
- **Descripción real** (campo `description`; fallback derivado si falta).
- Pestañas:
  - **Información**: ficha técnica (`specs`: plataforma, género, año, idiomas, tamaño, formato).
  - **Requisitos**: bloques *Mínimos* / *Recomendados* (`requirements.min` / `req`).
  - **Galería**: carrusel horizontal con imágenes reales (`gallery` + dots + prev/next).
- Botones **Descargar** (abre `links.download`) y **Comprar** (abre `links.purchase`) en pestaña nueva. Si falta el link, el botón queda `disabled`.
- Cierre por punto rojo, backdrop o `Escape`. Blur del fondo + bloqueo de scroll.

### Fuente de datos
- `NOXIS.Data` con **5 juegos reales** y 5 herramientas.
- Estructura rica por juego: `description`, `requirements`, `specs`, `links`, `gallery` (ver [ARCHITECTURE.md](ARCHITECTURE.md#estructura-de-un-juego)).
- API: `init`, `getAllGames`, `getSectionGames`, `getSections`, `searchGames`, `getFacets`, `getTools`, `filterGames`.

### Analítica y ranking (backend)
- **`NOXIS.Analytics`** (`js/analytics.js`): envía eventos anónimos `open`/`download`/`purchase` al Worker vía `sendBeacon`; inactivo en local (`file:`/`localhost`).
- **Worker `noxis-rank`** (Cloudflare + KV `NOXIS_EVENTS`): endpoints `POST /event` y `GET /popular`.
- **Popularidad dinámica**: `NOXIS.Data.init()` lee `/popular` y reordena "Más populares" y el orden "populares" de Explorar; fallback al campo estático `popular`.
- **Analítica de tráfico**: Cloudflare Web Analytics (visitas/páginas/referrers) en el dashboard.

### Despliegue
- Sitio: GitHub → Cloudflare Workers (**deploy automático al push a `main`**).
- Worker: deploy manual con `wrangler` (ver [DEPLOY.md](DEPLOY.md)).

---

## En progreso

- Observación de la analítica de tráfico y ajuste de los pesos del score (`open=1, download=5, purchase=2`, media vida 30 días).
- Limpieza de assets huérfanos (ver deuda técnica).

## Pendientes / próximos pasos

- Reemplazar/completar descripciones y fichas técnicas con contenido definitivo donde falte.
- Agregar un **favicon** (hoy hay un 404 inofensivo de `favicon.ico`).
- Limpiar los SVG de portada huérfanos (`assets/images/cover-*.svg`) de la etapa de datos ficticios.
- Migración a Firebase (Firestore/Storage/Auth) — ver [ARCHITECTURE.md](ARCHITECTURE.md#futura-migración-a-firebase-intención-arquitectónica).

---

## Known Limitations

Limitaciones reales detectadas en el código.

**Visuales**
- Las portadas y galerías son imágenes reales (`.jpg`/`.webp`) por juego; no hay arte definitivo optimizado.
- No hay favicon declarado (404 en consola).

**Funcionales**
- "Descargar" y "Comprar" abren **enlaces externos** (`links.*`); no hay descarga propia ni pago.
- "Requisitos" y "Galería" funcionan solo si el juego trae `requirements`/`gallery`; si no, muestran "próximamente".
- La cuenta del header está deshabilitada (sin autenticación).
- El buscador solo reordena la sección "Destacados".

**Arquitectónicas**
- `App.views.game` apunta a `#view-game`, pero el juego es un **overlay** (no una vista del router).
- `PER_PAGE = 12` hardcodeado en `explore.js`.
- Fuga menor del listener de `Escape` en `game.js` (ver deuda técnica).
- El Worker `noxis` (antiguo, `noxis.nicolabarranco2.workers.dev`) sigue existiendo pero **no se usa**.

**Datos temporales**
- 5 juegos reales cargados desde `Contenedor de juegos/`.
- Los `assets/images/cover-*.svg` (30) son huérfanos: ya no los referencia `data.js`.

---

## Qué se debe evitar modificar (salvo instrucción explícita)

- La estructura general de la ventana del juego (diseño consolidado).
- El tamaño 2:3 de las portadas.
- La paleta/tipografía de `global.css`.
- El router y el flujo de apertura/cierre de la ventana.
- La capa `NOXIS.Data` (no duplicar fuentes de datos).
- Los pesos del score y la lógica de dedupe del Worker (afectan al ranking en vivo).

---

## Deuda técnica / riesgos conocidos

1. **Assets huérfanos**: 30 `assets/images/cover-*.svg` de la etapa de datos ficticios, ya no referenciados.
2. **Sin favicon**: 404 de `favicon.ico` en la consola del navegador.
3. **Listener de `Escape` en `game.js`**: se añade en cada `open()` y solo se desregistra al cerrar con `Escape`; cerrar con el punto rojo o el backdrop lo deja registrado (riesgo menor de acumulación).
4. **`App.views.game`**: apunta a `#view-game` aunque no sea una vista del router (confuso, inofensivo).
5. **`PER_PAGE = 12`** hardcodeado en `explore.js`.
6. **`WORKER_URL` duplicado**: el endpoint está como constante en `js/analytics.js`; si cambia el nombre del Worker, actualizarlo allí.
7. **Worker `noxis` huérfano** en la cuenta de Cloudflare.

---

## Checklist de "estado sano"

- [ ] `node --check` pasa en `js/data.js`, `app.js`, `home.js`, `explore.js`, `game.js`, `analytics.js`.
- [ ] El sitio en vivo carga y la consola no tiene errores (salvo el 404 de favicon).
- [ ] `GET https://noxis-rank.nicolabarranco2.workers.dev/popular` responde JSON.
- [ ] Un clic en una tarjeta genera `POST /event` (visible en DevTools → Network).
