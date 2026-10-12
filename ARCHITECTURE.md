# Arquitectura de NOXIS

Este documento describe la arquitectura técnica real del proyecto. Es más técnico que el [README.md](README.md).

## Principios generales

- **Vanilla**: HTML + CSS + JavaScript puro. Sin frameworks, sin bundlers, sin dependencias de terceros (salvo Google Fonts).
- **IIFEs sin módulos ESM**: cada archivo JS encapsula su lógica en un módulo IIFE (`(function (global) { ... })(window)`), exponiéndose globalmente bajo el namespace `window.NOXIS`.
- **Separación de responsabilidades**: cada pantalla tiene su archivo CSS y su módulo JS. La fuente de datos está aislada en `data.js`.
- **Desacoplamiento de datos**: la interfaz solo consulta datos a través de `NOXIS.Data`, de modo que el origen (local → Firebase) pueda cambiarse sin tocar las vistas.

## Capas

```
  index.html  (estructura estática + contenedores)
       |
       v
  CSS (5 archivos)                 JS (5 módulos)
  ----------------                 --------------------
  global.css      tokens             data.js      fuente de datos
  components.css  header/loader/tarjeta  app.js   router / núcleo
  home.css        estilos Home       home.js      render Home
  explore.css     estilos Explorar   explore.js   filtros/paginación
  game.css        estilos ventana    game.js      ventana del juego
```

## Flujo de arranque

1. El navegador carga `index.html`, que incluye los 5 CSS y los 5 JS (en orden: `data.js`, `app.js`, `home.js`, `explore.js`, `game.js`).
2. Cada módulo JS se registra en `window.NOXIS` (cada uno hace `global.NOXIS = global.NOXIS || {}` y agrega su propiedad).
3. Al dispararse `DOMContentLoaded`, se ejecuta `window.NOXIS.App.init()` (definido al final de `app.js`).
4. `App.init()` oculta el loader, actualiza el estado y muestra la ruta `home`.
5. El router invoca el hook `NOXIS.RouterHooks(route, state)`, encadenado por `home.js` y `explore.js` para inicializar cada vista cuando corresponde.

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
          │  getFacets / filterGames / getSections / searchGames / getTools
          ▼
   Datos locales (array `games`, array `tools` en data.js)
```

## El router (`NOXIS.App`)

- Estado: `{ route, selectedGameId }`.
- Vistas registradas en `App.views`: `home → #view-home`, `explore → #view-explore`, `game → #view-game`.
- `navigate(route)`: cambia el estado, anima un `#app-backdrop` para suavizar la transición, llama a `showRoute` y hace scroll suave al inicio.
- `showRoute(route)`:
  1. Marca el enlace de navegación activo.
  2. Oculta todas las vistas (`main[id^='view-']` → `is-hidden` + `aria-hidden`).
  3. Muestra la vista objetivo con una transición de entrada (`is-entering` → `is-visible`).
  4. Notifica a `NOXIS.RouterHooks(route, state)`.
- Nota: `#view-game` en realidad **no es una vista del router**. Aunque `App.views.game` apunta a él, el juego se abre como **overlay** mediante `Game.open(id)`, no mediante `navigate("game")`. `openGame(id)` guarda `selectedGameId` y delega en `NOXIS.Game.open(id)`.

## El router hook

- `home.js` asigna `NOXIS.RouterHooks = function (route, state) { if (route === "home") Home.init(); }`.
- `explore.js` **encadena** el hook existente: guarda `existingHook`, reasigna `NOXIS.RouterHooks` para que primero inicialice Explorar y luego llame al hook anterior.
- Resultado: cada cambio de vista inicializa el controlador correspondiente.

## La fuente de datos (`NOXIS.Data`)

Módulo `data.js` que encierra en memoria:

- `games`: array de 30 objetos de juego.
- `tools`: array de 5 herramientas con URL externa.
- `sections`: configuración de las 3 secciones de la Home (función `select` sobre `games`).

API pública (ver [README](README.md#características-principales-actuales) y sección de datos):

| Método | Retorno |
| --- | --- |
| `getAllGames()` | array completo de juegos |
| `getSectionGames(key)` | juegos de una sección de Home |
| `getSections()` | `[{ key, heading, games }]` |
| `searchGames(query)` | juegos que coinciden con la búsqueda |
| `getFacets()` | `{ categories, genres, os, years }` |
| `getTools()` | array de herramientas |
| `filterGames({ category, genre, os, year, sort })` | listado filtrado y ordenado |

## Renderizado

- **Tarjetas**: `home.js` y `explore.js` comparten el mismo markup de tarjeta (`<a class="game-card">` con portada, meta, título y subtítulo). Los estilos están en `components.css`.
- **Home** (`home.js`): construye cada sección a partir de `Data.getSections()`, registra tarjetas en un `IntersectionObserver` para su aparición progresiva, y enlaza el clic de cada tarjeta a `App.openGame(id)`.
- **Explorar** (`explore.js`): `init()` → `cacheDom()`, `renderFacets()`, `renderTools()`, `bindEvents()`, `apply()`. `apply()` obtiene el listado filtrado, calcula paginación (`PER_PAGE = 12`) y vuelve a renderizar grid, contador, píldoras activas y paginación.
- **Ventana del juego** (`game.js`): `Game.open(id)` busca el juego en `Data.getAllGames()`, inyecta el markup en `#view-game` y añade la clase `is-open`. `Game.close()` aplica `is-closing` y, tras 220 ms, restaura el estado.

## Fuente de datos en detalle (`NOXIS.Data`)

### Estructura de un juego

Cada elemento del array `games` en `js/data.js` tiene esta forma:

```js
{
  id: "nebulay",             // string único
  title: "Neobulay",         // título mostrado
  category: "Acción",        // categoría (filtro)
  genre: "Ciencia ficción",  // género (filtro)
  os: ["Windows", "Linux"],  // plataformas (filtro por OS)
  year: 2024,                // año (filtro y orden)
  popular: 92,               // índice de popularidad (orden)
  rating: 8.6,               // valoración numérica (0–10 aprox.)
  featured: true,            // booleano: aparece en "Destacados"
  sub: "Sci-Fi · 2024",      // subtítulo de la tarjeta
  cover: "assets/images/cover-nebulay.svg" // portada
}
```

Campos y su uso:
- `id`, `title`, `cover`, `sub` → presentación.
- `category`, `genre`, `os`, `year` → facetas de filtro en Explorar.
- `popular`, `year`, `rating` → ordenamiento.
- `featured` → filtrado de la sección "Destacados".

### Estructura de una herramienta

```js
{ id: "winrar", name: "WinRAR", url: "https://winrar.es/descargas" }
```

`url` se usa como `href` de un `<a target="_blank" rel="noopener noreferrer">`.

### Cómo agregar un nuevo juego (hoy)

1. Creá la portada en `assets/images/cover-<id>.svg`.
2. Agregá un objeto al array `games` de `js/data.js` con los campos anteriores.
3. (Opcional) no hace falta tocar ningún módulo de vista: Home, Explorar y la ventana del juego lo detectan automáticamente (las facetas se calculan con `getFacets()`, las secciones con `sections`, la búsqueda con `searchGames`).

### Cómo agregar una nueva herramienta

1. Agregá un objeto `{ id, name, url }` al array `tools` de `js/data.js`.
2. `explore.js` la renderiza automáticamente en el panel "Herramientas".

### Facetas

`getFacets()` deriva dinámicamente:
- `categories`: `uniq(games.map(g => g.category))`
- `genres`: `uniq(games.map(g => g.genre))`
- `os`: `uniq` de los arrays `os` aplanados.
- `years`: ordenados descendentes.

No hay una lista estática de categorías/géneros: se infieren de los datos.

### Preparación para Firebase

El interior de `Data` es la única parte que debería cambiar al migrar a Firebase (devolver `Promise`s). La API pública permanecería igual.

---

## Comunicación entre módulos

- Los módulos solo se comunican a través del namespace global `window.NOXIS`.
- Dependencias de API:
  - `home.js` y `explore.js` → `NOXIS.Data`, `NOXIS.App.openGame`.
  - `game.js` → `NOXIS.Data`.
  - `app.js` → `NOXIS.Game.open` (referencia débil, verifica existencia).
  - `explore.js` → encadena `NOXIS.RouterHooks` definido por `home.js` (importa el orden de carga de scripts).

## Dependencias externas

- **Google Fonts** (`Sora` e `Inter`), cargados desde `fonts.googleapis.com` en `index.html`.
- No hay librerías JS, ni frameworks, ni backend.

## Futura migración a Firebase (intención arquitectónica)

> **Estado: NO implementada.** Es una propuesta de evolución, coherente con la decisión de mantener `NOXIS.Data` como única capa de acceso.

El objetivo es que la interfaz **no cambie**: los módulos de vista seguirían llamando a los mismos métodos de `NOXIS.Data`. Solo cambiaría su implementación interna (de arrays en memoria a consultas a Firebase).

- **Firestore**:
  - Colección `games`: cada juego (id, title, category, genre, os, year, popular, rating, featured, sub, cover URL).
  - Colección `tools`: cada herramienta (id, name, url).
  - Configuración de secciones de Home (o se mantiene local si es estática).
- **Storage**: portadas (`cover-*.svg`) y futuras capturas/galerías, servidos por URL pública.
- **Hosting**: alojamiento del sitio estático (`index.html`, `css/`, `js/`, `assets/`).
- **Auth (futuro)**: perfiles de usuario, verificador de compatibilidad, descargas asociadas a cuenta.

**Qué debe mantenerse desacoplado**:
- Las vistas (`home.js`, `explore.js`, `game.js`) no deben importar el SDK de Firebase directamente.
- `NOXIS.Data` debe conservar su API pública (los 7 métodos actuales) aunque internamente sean asíncronos (devolver Promises). Si los métodos se vuelven asíncronos, las vistas deberán adaptarse a `await`/`.then` — es el único cambio esperado en la capa de vista.

## Futuro sistema de catálogo basado en carpetas (conceptual)

> **Estado: FUTURA / NO implementada.** Solo documentación conceptual.

Idea: reemplazar parte de los datos embebidos por un catálogo auto-detectado a partir de una estructura de carpetas, por ejemplo:

```
juegos/
└── nombre-del-juego/
    ├── portada.jpg
    ├── captura-01.jpg
    ├── captura-02.jpg
    ├── trailer.mp4
    └── datos.json        # title, category, genre, os, year, ...
```

Flujo conceptual:

```
carpeta (nombre-del-juego)
   ↓ detección (scan del filesystem / de Storage)
   ↓ validación (datos.json presente y válido, portada existente)
   ↓ lectura de datos (parse de datos.json)
   ↓ procesamiento (campos a la estructura esperada por NOXIS.Data)
   ↓ publicación (indexado en el catálogo visible)
```

Esto conviviría con `NOXIS.Data` como la capa que normaliza el resultado. No reemplazaría la API; solo podría cambiar el origen de `games`.

---

## Separación de responsabilidades (resumen)

- `index.html`: esqueleto estático y contenedores (loader, header, vistas, overlay del juego, backdrop).
- `data.js`: única fuente de datos.
- `app.js`: núcleo (loader, router, navegación).
- `home.js`: render y búsqueda de la Home.
- `explore.js`: filtros, ordenamiento, paginación, herramientas.
- `game.js`: overlay de la ventana del juego.
- CSS: `global` (tokens/base), `components` (header/loader/tarjetas), `home`, `explore`, `game` (específicos por pantalla).