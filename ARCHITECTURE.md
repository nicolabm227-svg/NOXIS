# Arquitectura de NOXIS

Este documento describe la arquitectura técnica real del proyecto. Es más técnico que el [README.md](README.md). Para el despliegue, ver [DEPLOY.md](DEPLOY.md).

## Principios generales

- **Vanilla**: HTML + CSS + JavaScript puro. Sin frameworks, sin bundlers, sin dependencias de terceros en el front (salvo Google Fonts).
- **IIFEs sin módulos ESM**: cada archivo JS encapsula su lógica en un módulo IIFE (`(function (global) { ... })(window)`), exponiéndose globalmente bajo el namespace `window.NOXIS`.
- **Separación de responsabilidades**: cada pantalla tiene su archivo CSS y su módulo JS. La fuente de datos está aislada en `data.js`.
- **Desacoplamiento de datos**: la interfaz solo consulta datos a través de `NOXIS.Data`, de modo que el origen (local → Firebase) pueda cambiarse sin tocar las vistas.
- **Backend mínimo y opcional**: el único backend es un Cloudflare Worker (`worker/index.js`) con KV para el ranking por interacciones. El sitio funciona igual sin él (fallback estático).

## Capas

```
  index.html  (estructura estática + contenedores)
       |
       v
  CSS (5 archivos)                    JS (6 módulos)
  ----------------                    --------------------
  global.css      tokens              analytics.js  envío de eventos (Worker)
  components.css  header/loader/tarjeta  data.js    fuente de datos
  home.css        estilos Home        app.js        router / núcleo
  explore.css     estilos Explorar    home.js       render Home
  game.css        estilos ventana     explore.js    filtros/paginación
                                      game.js       ventana del juego

  Backend (Cloudflare):  worker/index.js  ──►  KV "NOXIS_EVENTS"
```

## Flujo de arranque

1. El navegador carga `index.html`, que incluye los 5 CSS y los **6 JS** (en orden: `analytics.js`, `data.js`, `app.js`, `home.js`, `explore.js`, `game.js`), todos con `?v=N`.
2. Cada módulo JS se registra en `window.NOXIS`.
3. Al dispararse `DOMContentLoaded`, se ejecuta `window.NOXIS.App.init()`.
4. `App.init()` cachea el DOM, enlaza eventos, oculta el loader, muestra la ruta `home` y llama a `NOXIS.Data.init()` (carga asíncrona de popularidad).
5. El router invoca `NOXIS.RouterHooks(route, state)`, encadenado por `home.js` y `explore.js`.

## Diagrama de arquitectura

```
        UI (DOM)
          │  eventos (click, input, change)
          ▼
        Router (NOXIS.App)
          │  navigate(route) / showRoute(route)
          │  openGame(id)
          ▼
   Views / Controllers
   (NOXIS.Home, NOXIS.Explore, NOXIS.Game)
          │  consultan y renderizan
          ▼
      NOXIS.Data
          │  getFacets / filterGames / getSections / searchGames / getTools / init
          ▼
   Datos locales (arrays `games`, `tools` en data.js)
          ▲
          │  GET /popular   (popularidad dinámica)
   NOXIS.Analytics ──► POST /event ──► Worker (Cloudflare) ──► KV NOXIS_EVENTS
```

## El router (`NOXIS.App`)

- Estado: `{ route, selectedGameId }`.
- Vistas registradas en `App.views`: `home → #view-home`, `explore → #view-explore`, `game → #view-game`.
- `navigate(route)`: cambia el estado, anima `#app-backdrop`, llama a `showRoute` y hace scroll suave al inicio.
- `showRoute(route)`: marca el enlace activo, oculta todas las vistas (`main[id^='view-']` → `is-hidden` + `aria-hidden`), muestra la objetivo con transición de entrada e invoca `NOXIS.RouterHooks(route, state)`.
- Nota: `#view-game` **no es una vista del router**. Aunque `App.views.game` apunta a él, el juego se abre como **overlay** mediante `Game.open(id)`. `openGame(id)` guarda `selectedGameId` y delega en `NOXIS.Game.open(id)`.

## El router hook

- `home.js` asigna `NOXIS.RouterHooks = function (route, state) { if (route === "home") Home.init(); }`.
- `explore.js` **encadena** el hook existente: guarda `existingHook`, reasigna `NOXIS.RouterHooks` para que primero inicialice Explorar y luego llame al hook anterior.

## La fuente de datos (`NOXIS.Data`)

Módulo `data.js` que encierra en memoria:

- `games`: array de **6 juegos reales**.
- `tools`: array de 5 herramientas con URL externa.
- `sections`: configuración de las 3 secciones de la Home (función `select` sobre `games`).
- `popularity`: mapa `{ gameId: score }` cargado del backend (o `null` si no se cargó).

API pública:

| Método | Retorno |
| --- | --- |
| `init()` | `Promise`: carga `popularity` desde `/popular` y dispara `noxis:popularity`. No hace nada en local. |
| `getAllGames()` | array completo de juegos |
| `getSectionGames(key)` | juegos de una sección de Home |
| `getSections()` | `[{ key, heading, games }]` |
| `searchGames(query)` | juegos que coinciden con la búsqueda |
| `getFacets()` | `{ categories, genres, os, years }` |
| `getTools()` | array de herramientas |
| `filterGames({ category, genre, os, year, sort })` | listado filtrado y ordenado |

El orden "popular" usa `comparePopular`: ordena por `popularity[gameId]` (score dinámico) con desempate por el campo estático `popular`; si no hay datos, usa solo el campo estático.

`getSections()` arma los **carriles de la Home sin repetir juegos**: cada sección aporta su propia selección (destacados / más nuevos / más populares) y toma los primeros que aún no aparecieron arriba. El tamaño por sección se adapta al catálogo (máx. 8) para que todas tengan contenido aunque la biblioteca sea chica, y las secciones vacías se omiten (la vista las oculta).

## Renderizado

- **Tarjetas**: `home.js` y `explore.js` comparten el mismo markup (`<a class="game-card" data-game-id="...">`). Estilos en `components.css`.
- **Home** (`home.js`): construye cada sección a partir de `Data.getSections()`, registra tarjetas en un `IntersectionObserver`, enlaza el clic a `App.openGame(id)` y **re-renderiza al recibir `noxis:popularity`**.
- **Explorar** (`explore.js`): `init()` → `cacheDom()`, `renderFacets()`, `renderTools()`, `bindEvents()`, `apply()`. `apply()` obtiene el listado filtrado, calcula paginación (`PER_PAGE = 12`) y vuelve a renderizar. Escucha `noxis:popularity` para re-renderizar.
- **Ventana del juego** (`game.js`): `Game.open(id)` busca el juego en `Data.getAllGames()`, envía el evento `open`, inyecta el markup y añade `is-open`. `Game.close()` aplica `is-closing` y, tras 220 ms, restaura el estado. Los botones **Descargar/Comprar** abren `game.links.download`/`game.links.purchase` en pestaña nueva y envían los eventos correspondientes.

## Fuente de datos en detalle (`NOXIS.Data`)

### Estructura de un juego

Cada elemento del array `games` en `js/data.js` tiene esta forma (campos reales):

```js
{
  id: "cyberpunk-2077",          // string único
  title: "Cyberpunk 2077",       // título mostrado
  category: "Acción",            // categoría (filtro)
  genre: "RPG de mundo abierto", // género (filtro)
  os: ["Windows"],               // plataformas (filtro por OS)
  year: 2020,                    // año (filtro y orden)
  popular: 96,                   // popularidad estática (fallback de orden)
  rating: 8.7,                   // valoración numérica
  featured: true,                // aparece en "Destacados"
  sub: "RPG de mundo abierto · 2020", // subtítulo de la tarjeta
  cover: "assets/images/games/cyberpunk-2077/portada.jpg",
  description: "…",              // sinopsis (texto real)
  requirements: {                // pestaña "Requisitos"
    min: { os, cpu, ram, gpu, vram, directx, storage, sound, notes },
    rec: { os, cpu, ram, gpu, vram, directx, storage, sound, notes },
  },
  specs: {                       // ficha "Información"
    plataforma, genero, anio, idiomaTextos, idiomaVoces, idioma, tamano, formato,
  },
  links: {                       // acciones (abren en pestaña nueva)
    download: "https://…",       // botón "Descargar" (normalmente MediaFire)
    purchase: "https://…",       // botón "Comprar" (Steam, etc.)
  },
  gallery: [                     // pestaña "Galería"
    "assets/images/games/cyberpunk-2077/complementaria-1.webp",
    "assets/images/games/cyberpunk-2077/complementaria-2.webp",
  ],
}
```

Campos y su uso:
- `id`, `title`, `cover`, `sub` → presentación.
- `category`, `genre`, `os`, `year` → facetas de filtro en Explorar.
- `popular`, `year`, `rating` → ordenamiento (con `popular` como fallback).
- `featured` → sección "Destacados".
- `description`, `specs`, `requirements`, `gallery`, `links` → ventana del juego.

> Cada juego puede no tener todos los bloques. `game.js` degrada con elegancia: sin `links` los botones quedan `disabled`; sin `requirements`/`gallery` muestra "próximamente".

### Estructura de una herramienta

```js
{ id: "winrar", name: "WinRAR", url: "https://winrar.es/descargas" }
```

`url` se usa como `href` de un `<a target="_blank" rel="noopener noreferrer">`.

### Cómo agregar un juego

Guía paso a paso completa en **[AGREGAR-JUEGO.md](AGREGAR-JUEGO.md)**. Resumen:

1. Poné el material crudo en `Contenedor de juegos/<Nombre>/` (portada, complementarias, `.torrent`, `informacion.txt`). Esa carpeta está **gitignored**.
2. Copiá la portada a `assets/images/games/<id>/portada.jpg` y las imágenes de galería a `assets/images/games/<id>/complementaria-N.webp` (nombres exactos, renombrados desde `Portada`/`Complementaria N`).
3. Extraé requisitos, ficha técnica (`specs`), descripción y enlaces del `informacion.txt`.
4. Agregá un objeto al array `games` de `js/data.js` con la estructura de arriba.
5. `node --check js/data.js`, subí `?v=N` en `index.html` y `git push` (se publica solo).

No hace falta tocar los módulos de vista: las facetas, las secciones y la ficha se generan a partir de los datos.

> El material crudo y lo publicado deben quedar **1:1**: cada `<id>` en `assets/images/games/` corresponde a un objeto en `games` y viceversa.

### Facetas

`getFacets()` infiere de los datos (no hay listas estáticas): `categories`, `genres`, `os` (aplanado), `years` (descendente).

### Preparación para Firebase

El interior de `Data` es la única parte que debería cambiar al migrar a Firebase (devolver `Promise`s). La API pública permanecería igual. Ver la sección de migración al final.

## Comunicación entre módulos

- Los módulos solo se comunican por el namespace global `window.NOXIS`.
- Dependencias de API:
  - `home.js` y `explore.js` → `NOXIS.Data`, `NOXIS.App.openGame`.
  - `game.js` → `NOXIS.Data`, `NOXIS.Analytics`.
  - `app.js` → `NOXIS.Game.open` y `NOXIS.Data.init` (referencias débiles, verifica existencia).
  - `data.js` → lee `NOXIS.Analytics.endpoint` para el `fetch` de `/popular`.
  - `explore.js` → encadena `NOXIS.RouterHooks` definido por `home.js` (importa el orden de carga de scripts).

## El backend de ranking (`worker/index.js`)

> Estado: **implementado y en producción.** Cloudflare Worker sin frameworks, sobre KV.

- **Endpoints**:
  - `POST /event` → body `{ type: "open"|"download"|"purchase", gameId, sid }`. Valida y responde `{ ok: true }` (o `deduped: true`).
  - `GET /popular` → `{ "<gameId>": <score>, ... }` (cache `max-age=60`).
- **Almacenamiento (KV `NOXIS_EVENTS`)**:
  - `agg:<gameId>` → `{ open, download, purchase, at }`.
  - `seen:<sid>:<gameId>:<type>` → dedupe temporal (TTL 12 h).
- **Score**: `open=1`, `download=5`, `purchase=2`, con **decaimiento exponencial de media vida 30 días** (lo reciente pesa más).
- **CORS**: refleja el `Origin`; responde `OPTIONS` con 204.
- **Config**: `worker/wrangler.toml` (`name = "noxis-rank"`, binding `NOXIS_EVENTS`).

## Dependencias externas

- **Google Fonts** (`Sora` e `Inter`) desde `fonts.googleapis.com` en `index.html`.
- **Cloudflare** (hosting + Worker + KV) para producción — ver [DEPLOY.md](DEPLOY.md).
- No hay librerías JS ni frameworks en el front.

## Futura migración a Firebase (intención arquitectónica)

> **Estado: NO implementada.** Propuesta de evolución, coherente con mantener `NOXIS.Data` como única capa de acceso.

La interfaz **no cambiaría**: los módulos de vista seguirían llamando a los mismos métodos de `NOXIS.Data`. Solo cambiaría su implementación interna (de arrays en memoria a consultas a Firebase).

- **Firestore**: colecciones `games` y `tools`; configuración de secciones de Home.
- **Storage**: portadas (`assets/images/games/...`) y galerías.
- **Hosting**: alojamiento del sitio estático.
- **Auth (futuro)**: perfiles, verificador de compatibilidad, descargas asociadas a cuenta.

**Qué debe mantenerse desacoplado**: las vistas no deben importar el SDK de Firebase directamente; `NOXIS.Data` conserva su API (aunque internamente devuelva `Promise`s, único cambio esperado en las vistas).

## Futuro sistema de catálogo basado en carpetas (conceptual)

> **Estado: FUTURA / NO implementada.** Solo documentación conceptual.

Hoy el material crudo vive en `Contenedor de juegos/<Nombre>/` y se copia a mano a `assets/images/games/<id>/`. A futuro podría auto-detectarse:

```
juegos/
└── nombre-del-juego/
    ├── portada.jpg
    ├── complementaria-01.jpg
    ├── trailer.mp4
    └── datos.json        # title, category, genre, os, year, ...
```

Flujo conceptual: detección (scan del filesystem/Storage) → validación (`datos.json` + portada) → lectura → normalización a la estructura de `NOXIS.Data` → publicación. No reemplazaría la API de `Data`; solo el origen de `games`.

---

## Separación de responsabilidades (resumen)

- `index.html`: esqueleto estático y contenedores (loader, header, vistas, overlay del juego, backdrop).
- `analytics.js`: envío anónimo de eventos al Worker de ranking.
- `data.js`: única fuente de datos + popularidad dinámica.
- `app.js`: núcleo (loader, router, navegación).
- `home.js`: render y búsqueda de la Home.
- `explore.js`: filtros, ordenamiento, paginación, herramientas.
- `game.js`: overlay de la ventana del juego.
- `worker/index.js`: backend de ranking (Cloudflare Worker + KV).
- CSS: `global` (tokens/base), `components` (header/loader/tarjetas), `home`, `explore`, `game`.
