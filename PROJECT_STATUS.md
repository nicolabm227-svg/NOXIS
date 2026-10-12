# Estado del proyecto — NOXIS

Fotografía del proyecto en el momento de redactar este documento. El código es la fuente de verdad; si algo aquí contradice el código, el código gana.

---

## Implementado

### Navegación / núcleo
- Router propio en `app.js` con estado `{ route, selectedGameId }`.
- Vistas: `home` (`#view-home`) y `explore` (`#view-explore`). Transición con backdrop y scroll suave.
- Loader inicial con mínimo de presencia visual (450 ms).
- Header sticky con marca, enlaces Inicio/Explorar, buscador global y slot de cuenta (deshabilitado).

### Home
- Tres secciones: *Destacados* (featured), *Nuevos* (más recientes), *Más populares* (popular).
- Cada sección genera hasta 8 tarjetas desde `NOXIS.Data.getSections()`.
- Buscador global que reordena la sección *Destacados* con resultados (`Data.searchGames`).
- Botones "Ver todo" → navegan a Explorar.
- Aparición progresiva de tarjetas con `IntersectionObserver`.

### Explorar
- Filtros por **categoría**, **género**, **sistema operativo** y **año** (píldoras).
- Acordeón de filtros (un criterio abierto a la vez).
- Ordenamiento: *Más recientes*, *Más populares*, *A-Z*.
- Paginación: 12 juegos por página, con ventana de páginas y elipses.
- Contador de resultados y botón "Limpiar filtros" (habilitado/deshabilitado según estado).
- Panel **Herramientas** con enlaces externos.

### Herramientas
- 5 herramientas con URL oficial, abiertas en pestaña nueva: `target="_blank"` y `rel="noopener noreferrer"`.

| Herramienta | URL |
| --- | --- |
| WinRAR | `https://winrar.es/descargas` |
| UltraISO | `https://ultraiso.es.download.it/` |
| DAEMON Tools | `https://www.daemon-tools.cc/spa/downloads` |
| qBittorrent | `https://www.qbittorrent.org/` |
| µTorrent | `https://www.utorrent.com/intl/es/downloads/win/` |

### Ventana individual del juego (overlay)
- Se abre al hacer clic en una tarjeta (Home o Explorar), vía `App.openGame(id)` → `NOXIS.Game.open(id)`.
- Marco tipo ventana de escritorio: barra superior con tres puntos (rojo/amarillo/verde) y título `NOXIS / <título>`.
- Portada 2:3, kicker (categoría · género), título, pills (año, plataformas, rating).
- Botones **Descargar** (primario) y **Comprar** (secundario), apilados.
- Descripción provisional derivada de los datos.
- Pestañas *Información / Requisitos / Galería* (solo *Información* muestra datos reales).
- Cierre: punto rojo, clic en el fondo, o tecla `Escape`.
- Fondo atenuado con blur; bloqueo de scroll del fondo (`body.no-scroll`).

### Fuente de datos
- `NOXIS.Data` con 30 juegos y 5 herramientas en memoria.
- API: `getAllGames`, `getSectionGames`, `getSections`, `searchGames`, `getFacets`, `getTools`, `filterGames`.

---

## En progreso

- Consolidación de la ventana del juego (cierre por punto rojo y botón "Comprar" recién añadidos; pendiente validación visual fina).

---

## Pendiente / no implementado (estructura preparada)

- **Descargas reales**: el botón *Descargar* no realiza ninguna acción.
- **Compra real**: el botón *Comprar* es visual únicamente.
- **Requisitos de sistema**: pestaña *Requisitos* muestra un placeholder.
- **Galería**: pestaña *Galería* muestra un placeholder.
- **Verificador de hardware/compatibilidad**: no existe.
- **Autenticación / perfiles de usuario**: el slot de cuenta está deshabilitado.
- **Firebase** (Firestore, Storage, Hosting, Auth): no implementado; ver [ARCHITECTURE.md](ARCHITECTURE.md#futura-migración-a-firebase).
- **Catálogo basado en carpetas**: no implementado (ver nota en ARCHITECTURE/ROADMAP).
- **Datos reales de descripción**: la descripción se deriva temporalmente de los campos existentes.

---

## Known Limitations

Limitaciones reales identificadas durante la inspección del código.

**Visuales**
- No hay imágenes raster reales; las portadas son SVGs locales de prueba.
- La descripción de cada juego es provisional (se deriva de los campos, no es contenido definitivo).

**Funcionales**
- "Descargar" y "Comprar" no realizan ninguna acción real.
- "Requisitos" y "Galería" son placeholders ("próximamente").
- La cuenta del header está deshabilitada (sin autenticación).
- El buscador solo reordena la sección "Destacados"; no abre una vista de resultados dedicada.

**Arquitectónicas**
- `App.views.game` apunta a `#view-game`, pero el juego no es una vista del router (es overlay); `showRoute` oculta vistas `main`, así que `#view-game` no se ve afectado por el router.
- `PER_PAGE = 12` hardcodeado en `explore.js`.
- Fuga menor del listener de `Escape` en `game.js` (ver deuda técnica).

**Placeholders / datos temporales**
- 30 juegos ficticios en `data.js`.
- Estructuras `requirements`/`gallery` aún sin reflejar en la fuente de datos.

**Funcionalidades futuras (NO implementadas)**
- Firebase (Firestore/Storage/Hosting/Auth).
- Catálogo basado en carpetas.
- Descargas, requisitos, galería, verificador de compatibilidad.

---

## Qué se debe evitar modificar (salvo instrucción explícita)

- La estructura general de la ventana del juego (diseño consolidado).
- El tamaño 2:3 de las portadas.
- La paleta/tipografía definidas en `global.css`.
- El router y el flujo de apertura/cierre de la ventana.
- La capa `NOXIS.Data` (no duplicar fuentes de datos).

---

## Deuda técnica / riesgos conocidos

1. **Código muerto en `home.css`**: reglas `.game__*`, `.explore__placeholder` y `.explore, .game` (min-height) corresponden al enfoque anterior de "vista de juego placeholder", reemplazado por el overlay. No son dañinas pero deben limpiarse.
2. **Listener de `Escape` en `game.js`**: se añade en cada `open()` vía `document.addEventListener`, y solo se desregistra cuando se pulsa `Escape`. Si la ventana se cierra con el punto rojo o el backdrop, el listener permanece hasta el próximo `Escape`. Riesgo menor de fugas de listeners y de doble ejecución en aperturas repetidas.
3. **`App.views.game`** sigue definido apuntando a `#view-game`, aunque el juego ya no es una vista del router (es overlay). Inofensivo, pero puede confundir.
4. **`table` de `bindEvents(game)`**: el parámetro `game` no se utiliza dentro de `bindEvents`.
5. **Paginación**: `PER_PAGE = 12` está hardcodeado en `explore.js`.
6. **Datos ficticios**: los juegos son de prueba; las URLs de imágenes son SVG locales.

---

## Próximos pasos sugeridos

1. Limpiar código muerto en `home.css`.
2. Corregir la fuga del listener `Escape` en `game.js` (guardar y desregistrar la referencia al cerrar).
3. Completar datos reales de descripción y requisitos en `data.js`.
4. Definir el modelo de datos para migrar a Firebase manteniendo `NOXIS.Data` como única capa de acceso (ver [ARCHITECTURE.md](ARCHITECTURE.md)).