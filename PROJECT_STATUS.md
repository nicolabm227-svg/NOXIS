# Estado del proyecto — NOXIS

Fotografía del proyecto en el momento de redactar este documento. El código es la fuente de verdad; si algo aquí contradice el código, el código gana.

> Para despliegue y operación (Cloudflare, Worker, KV), ver [DEPLOY.md](DEPLOY.md).

---

## Implementado

### Navegación / núcleo
- Router propio en `app.js` con estado `{ route, selectedGameId, exploreSort }`.
- Vistas: `home` (`#view-home`) y `explore` (`#view-explore`). Transición con backdrop y scroll suave.
- Loader inicial con mínimo de presencia visual (450 ms).
- Header sticky con marca (imagen `assets/images/logo.webp`), enlaces Inicio/Explorar, buscador global (**con sugerencias compartidas**) y slot de cuenta (deshabilitado).
- Botón **"Volver arriba"** flotante (`#back-to-top`), visible tras 600 px de scroll.
- **Accesibilidad**: foco de teclado visible (`:focus-visible`), navegación por Tab, `aria-*` en vistas/overlay, y áreas táctiles ≥44 px en punteros gruesos.

### Fondo dinámico
- Capa fija global (`.orbs` en `global.css`) con **40 orbes idénticos** (mismo tamaño 7px, mismo color y brillo del acento) que ascienden con vaivén, visibles en Inicio y Explorar y por detrás del contenido. Los genera `js/orbs.js`; solo varían posición y tempo.
- Solo `transform`/`opacity` (sin `filter: blur`); estáticos con `prefers-reduced-motion`; reducidos en móvil (`≤640px`).
- **Parallax** sutil con el puntero (`js/orbs.js`, ±16px; solo punteros finos).

### Home
- **Encabezado con efecto de escritura**: eyebrow, título y subtítulo se escriben letra a letra al entrar (`js/typewriter.js`, con cursor parpadeante; se omite con `prefers-reduced-motion`).
- Dos secciones: *Destacados* (juegos `featured`, ordenados por popularidad —descargas/interacciones con fallback estático) y *Nuevos* (más recientes). Se quitó *Más populares* por redundante.
- **Sin juegos repetidos** entre secciones; las secciones vacías se ocultan.
- Buscador global (reordena *Destacados*) y botones "Ver todo" que **heredan el orden** de su sección en Explorar.
- Tarjetas con aparición progresiva y escalonada (`IntersectionObserver` + `--i`).

### Explorar
- **Cabecera con efecto de escritura**: eyebrow, título y subtítulo se escriben letra a letra al entrar (`js/typewriter.js`).
- Filtros por **categoría**, **género**, **sistema operativo** y **año** (píldoras), con acordeón.
- Ordenamiento: *Más recientes / Más populares / A-Z* (y el heredado desde "Ver todo").
- Paginación (12 por página), contador, "Limpiar filtros" y **estado vacío** cuando no hay coincidencias.
- Panel de **Herramientas** con enlaces externos.

### Tarjetas de juego (Home y Explorar)
- Cada tarjeta muestra portada, título, meta (categoría · año / subtítulo) y un **chip con el tamaño real** (`specs.tamano`) sobre la portada, visible sin abrir la ficha.
- Portada 2:3 con **recorte robusto** en las esquinas redondeadas (sin bordes irregulares al hacer zoom en hover).

### Ventana del juego (overlay)
- Portada 2:3, kicker, título, pills (año, plataformas, rating).
- **Descripción real** (campo `description`; fallback derivado si falta).
- Pestañas:
  - **Información**: ficha técnica (`specs`: plataforma, género, año, idiomas, tamaño, formato) y, si el juego trae `dlc`, el bloque **"Contenido adicional (DLC)"**.
  - **Requisitos**: bloques *Mínimos* / *Recomendados* (`requirements.min` / `req`).
  - **Galería**: carrusel horizontal con imágenes reales (`gallery` + dots + prev/next).
- Botones **Descargar** (abre `links.download`) y **Comprar** (abre `links.purchase`) en pestaña nueva. Si falta el link, el botón queda `disabled`.
- Cierre por punto rojo, backdrop o `Escape`. Blur del fondo + bloqueo de scroll.
- **Foco gestionado**: se enfoca la ventana al abrir, el `Tab` queda atrapado dentro y el foco vuelve al elemento que la abrió al cerrar.

### Fuente de datos
- `NOXIS.Data` con **11 juegos reales** y 5 herramientas.
- Estructura rica por juego: `description`, `requirements`, `specs`, `links`, `gallery`, `dlc` (opcional) (ver [ARCHITECTURE.md](ARCHITECTURE.md#estructura-de-un-juego)).
- API: `init`, `getAllGames`, `getSectionGames`, `getSections`, `searchGames`, `getFacets`, `getTools`, `filterGames`.

### Analítica y ranking (backend)
- **`NOXIS.Analytics`** (`js/analytics.js`): envía eventos anónimos `open`/`download`/`purchase` al Worker vía `sendBeacon`; inactivo en local (`file:`/`localhost`).
- **Worker `noxis-rank`** (Cloudflare + KV `NOXIS_EVENTS`): endpoints `POST /event` y `GET /popular`.
- **Popularidad dinámica**: `NOXIS.Data.init()` lee `/popular` y reordena *Destacados* y el orden "populares" de Explorar; fallback al campo estático `popular`.
- **Analítica de tráfico**: Cloudflare Web Analytics (visitas/páginas/referrers) en el dashboard.

### Legal
- **Footer** global (Inicio y Explorar) con `© NOXIS — Todos los derechos reservados` (año dinámico vía `app.js`) y aviso de contenido de terceros.
- **[`LICENSE`](LICENSE)**: todos los derechos reservados sobre el sitio, el código, el diseño y la **estructura**; excepción explícita para los **juegos** (nombres/imágenes/marcas de sus titulares).

### Despliegue
- Sitio: GitHub → Cloudflare Workers (**deploy automático al push a `main`**).
- Worker: deploy manual con `wrangler` (ver [DEPLOY.md](DEPLOY.md)).

### Indexación / SEO
- **Google Search Console**: verificación por meta etiqueta (`google-site-verification` en `index.html`) y `sitemap.xml` en la raíz con la URL pública.
- El sitio es una SPA de una sola URL (`/`), por lo que el sitemap contiene una única entrada.

---

## En progreso

- Observación de la analítica de tráfico y ajuste de los pesos del score (`open=1, download=5, purchase=2`, media vida 30 días).
- Limpieza de assets huérfanos (ver deuda técnica).

## Pendientes / próximos pasos

- Reemplazar/completar descripciones y fichas técnicas con contenido definitivo donde falte.
- Limpiar los SVG de portada huérfanos (`assets/images/cover-*.svg`) de la etapa de datos ficticios.
- Migración a Firebase (Firestore/Storage/Auth) — ver [ARCHITECTURE.md](ARCHITECTURE.md#futura-migración-a-firebase-intención-arquitectónica).

---

## Known Limitations

Limitaciones reales detectadas en el código.

**Visuales**
- Las portadas y galerías son imágenes reales (`.jpg`/`.webp`) por juego; no hay arte definitivo optimizado.

**Funcionales**
- "Descargar" y "Comprar" abren **enlaces externos** (`links.*`); no hay descarga propia ni pago.
- "Requisitos" y "Galería" funcionan solo si el juego trae `requirements`/`gallery`; si no, muestran "próximamente".
- La cuenta del header está deshabilitada (sin autenticación).
- El buscador solo reordena la sección "Destacados".

**Arquitectónicas**
- `App.views.game` apunta a `#view-game`, pero el juego es un **overlay** (no una vista del router).
- `PER_PAGE = 12` hardcodeado en `explore.js`.
- El Worker `noxis` (antiguo, `noxis.nicolabarranco2.workers.dev`) sigue existiendo pero **no se usa**.

**Datos temporales**
- 11 juegos reales cargados desde `Contenedor de juegos/`.
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
2. **`App.views.game`**: apunta a `#view-game` aunque no sea una vista del router (confuso, inofensivo).
3. **`PER_PAGE = 12`** hardcodeado en `explore.js`.
4. **`WORKER_URL` duplicado**: el endpoint está como constante en `js/analytics.js`; si cambia el nombre del Worker, actualizarlo allí.
5. **Worker `noxis` huérfano** en la cuenta de Cloudflare.

---

## Checklist de "estado sano"

- [ ] `node --check` pasa en `js/data.js`, `app.js`, `home.js`, `explore.js`, `game.js`, `analytics.js`, `orbs.js`, `typewriter.js`.
- [ ] El sitio en vivo carga y la consola no tiene errores.
- [ ] `GET https://noxis-rank.nicolabarranco2.workers.dev/popular` responde JSON.
- [ ] Un clic en una tarjeta genera `POST /event` (visible en DevTools → Network).
