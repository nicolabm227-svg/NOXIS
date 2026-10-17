# Cómo cargar un juego nuevo — NOXIS

Guía paso a paso para agregar un juego al catálogo. El proyecto es **estático**: no hay build ni base de datos; un juego nuevo son **assets (imágenes) + un objeto en `js/data.js`**.

> Regla de oro: las vistas (Home, Explorar, ventana del juego) **no se tocan**. Todo se genera a partir de `NOXIS.Data`.

---

## 0. Antes de empezar

- Material crudo en `Contenedor de juegos/<Nombre>/` (esa carpeta está **gitignored**, no se publica).
- Se publica solo lo que copiás a `assets/images/games/<id>/` y el objeto en `js/data.js`.
- Elegí un **`id`** corto en minúsculas y con guiones (sin espacios ni tildes/ñ): p. ej. `red-dead-redemption-2`. Ese `id` será la carpeta del juego y la clave en `data.js`.

---

## 1. Estructura del material crudo

Cada carpeta en `Contenedor de juegos/<Nombre>/` contiene:

```
<Nombre>/
├── Portada.jpg              # o .png / .webp  → portada 2:3 (vertical)
├── Complementaria 1.webp    # capturas para la galería (1..N)
├── Complementaria 2.webp
├── Complementaria N.webp
├── <Algo>.torrent           # archivo de descarga
└── informacion.txt          # requisitos + ficha técnica + descripción + enlaces
```

> Ojo: los nombres varían (a veces `Informacion.txt`, `S.O.`/`SO`, `Procesador`/`CPU`). Leé el archivo real de cada juego.

### Qué extraer de `informacion.txt`

| Bloque | Se usa para |
| --- | --- |
| **Requisitos Mínimos** (SO, CPU, RAM, GPU, VRAM, Almacenamiento) | `requirements.min` |
| **Requisitos Recomendados** | `requirements.rec` |
| **Ficha técnica** (Plataforma, Idioma textos, Idioma voces, Año, Tamaño, Formato, Género) | `specs` |
| **Descripción** | `description` |
| **DLC / expansiones incluidas** (si el texto las menciona) | `dlc` (array de nombres) |
| **Descargar:** `<url>` | `links.download` |
| **Comprar:** `<url>` | `links.purchase` |

Si falta el bloque "Ficha técnica" (pasa en varios juegos), completá `specs` con datos provisionales marcados mentalmente como tales y avisá; se corrigen cuando llegue la ficha real.

### Cómo detectar los DLC en el texto

Casi siempre el texto **menciona** las expansiones/DLC que trae el paquete. Antes de armar el objeto, buscá:

- Un bloque explícito tipo **"DLC:"**, **"Contenido adicional:"** o **"Incluye:"**.
- Nombres de expansión **dentro de la descripción** (p. ej. *"…incluye su expansión Thrones and Patriots"*).
- Ediciones que **implican contenido incluido** en el propio título: *Complete Collection*, *Extended Edition*, *GOTY*, *Infernal Edition*, etc.

Cargá cada uno como string en `dlc` (solo el nombre). Ejemplos ya cargados: `["Thrones and Patriots"]`, `["Uprising"]`, `["Phantom Liberty"]`, `["Lord of Destruction"]`.

> Si el texto no lo dice con claridad, **no lo inventes**: preguntá antes de publicar. Si un juego no tiene DLC, simplemente omití el campo `dlc` (la ventana no muestra el bloque).

---

## 2. Copiar los assets (renombrados)

Copiá y renombrá a `assets/images/games/<id>/`:

| Origen (contenedor) | Destino (publicado) |
| --- | --- |
| `Portada.jpg` | `portada.jpg` |
| `Complementaria 1.webp` | `complementaria-1.webp` |
| `Complementaria 2.webp` | `complementaria-2.webp` |
| `Complementaria N.webp` | `complementaria-N.webp` |

Reglas de nombres **exactas** (las usa `data.js`):

- Portada: **`portada.jpg`** (minúsculas; si el original es `.png`/`.webp`, convertí a `.jpg` o cambiá la ruta en `cover`).
- Galería: **`complementaria-1.<ext>`**, `complementaria-2.<ext>`, … (guion, sin espacio, numeradas desde 1).

> **Extensiones reales**: a veces los archivos del contenedor están mal nombrados (p. ej. `Complementaria 2.jpg` que en realidad es un PNG o un WebP). La extensión **debe coincidir con el contenido** para que el `Content-Type` que sirve Cloudflare sea correcto. Para verificarlo, mirá los primeros bytes del archivo:
>
> | Primeros bytes | Formato real | Extensión |
> | --- | --- | --- |
> | `FF D8 FF` | JPEG | `.jpg` |
> | `89 50 4E 47` | PNG | `.png` |
> | `52 49 46 46 ... 57 45 42 50` (`RIFF`…`WEBP`) | WebP | `.webp` |
>
> ```powershell
> # Ver el "magic number" de cada imagen
> Get-ChildItem "assets\images\games\<id>" -File | ForEach-Object {
>   $b = [System.IO.File]::ReadAllBytes($_.FullName)
>   "{0}: {1}" -f $_.Name, (($b[0..3] | ForEach-Object { $_.ToString('X2') }) -join ' ')
> }
> ```
>
> Si renombrás la extensión, actualizá la ruta correspondiente en `gallery` (o `cover`) de `data.js`.

```powershell
# Ejemplo (PowerShell): id = red-dead-redemption-2
$src = "Contenedor de juegos\Red Dead Redemption 2"
$dst = "assets\images\games\red-dead-redemption-2"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Copy-Item "$src\Portada.jpg" "$dst\portada.jpg"
Copy-Item "$src\Complementaria 1.webp" "$dst\complementaria-1.webp"
Copy-Item "$src\Complementaria 2.webp" "$dst\complementaria-2.webp"
```

---

## 3. Agregar el objeto en `js/data.js`

Dentro del array `games` (ver el objeto de `cyberpunk-2077` como modelo), agregá:

```js
{
  id: "red-dead-redemption-2",
  title: "Red Dead Redemption 2",
  category: "Acción",
  genre: "Mundo abierto",              // género (filtro)
  os: ["Windows"],
  year: 2019,
  popular: 94,                          // 0..100 (fallback si no hay backend)
  rating: 9.7,
  featured: true,                       // aparece en "Destacados"
  sub: "Mundo abierto · 2019",          // subtítulo de la tarjeta
  cover: "assets/images/games/red-dead-redemption-2/portada.jpg",
  description: "…",                     // la Descripción del informacion.txt
  requirements: {
    min: { os: "…", cpu: "…", ram: "…", gpu: "…", vram: "…", storage: "…" },
    rec: { os: "…", cpu: "…", ram: "…", gpu: "…", vram: "…", storage: "…" },
  },
  specs: {
    plataforma: "PC",
    idiomaTextos: "Español (MX/ES), Inglés, …",
    idiomaVoces: "Inglés",
    anio: "2019",
    tamano: "103 GB",                   // también se muestra como chip en la tarjeta
    formato: "ISO",
    genero: "TPS, FPS, Acción, Aventura, Mundo Abierto",
  },
  links: {
    download: "https://…",              // el "Descargar:" del informacion.txt
    purchase: "https://…",              // el "Comprar:" (si falta, el botón queda disabled)
  },
  gallery: [
    "assets/images/games/red-dead-redemption-2/complementaria-1.webp",
    "assets/images/games/red-dead-redemption-2/complementaria-2.webp",
  ],
  dlc: ["Undead Nightmare"],            // DLC/expansiones incluidas (opcional)
},
```

### Campos

- **Presentación**: `id`, `title`, `cover`, `sub`.
- **Filtros (Explorar)**: `category`, `genre`, `os`, `year`.
- **Orden**: `popular` (fallback), `year`, `rating`.
- **Home**: `featured` (sección "Destacados").
- **Ventana del juego**: `description`, `specs`, `requirements`, `gallery`, `links`, `dlc` (opcional).

> Todo bloque es opcional: si falta (`links`, `requirements`, `gallery`), la ventana **degrada con elegancia** (botones deshabilitados, "próximamente"). Pero completá lo máximo posible.
>
> El **chip de tamaño** de la tarjeta usa `specs.tamano`: sin ese dato no aparece el chip.

---

## 4. Verificar y publicar

```powershell
# 1) Sintaxis del JS tocado
node --check js/data.js

# 2) Cache-busting: subí ?v=N en index.html (afecta a todos los CSS/JS)
#    (buscar/reemplazar ?v=32 por ?v=33, etc.)

# 3) Probar en local (Live Server abierto o servidor estático)
npx.cmd serve .
```

Comprobá en el navegador:

- [ ] La tarjeta aparece en Home (Destacados) y en Explorar.
- [ ] El chip de tamaño se ve sobre la portada.
- [ ] Al abrir la ficha: descripción, pestañas *Información* / *Requisitos* / *Galería*.
- [ ] *Descargar* / *Comprar* abren el enlace en pestaña nueva (o quedan deshabilitados).
- [ ] Consola sin errores (tampoco 404 de imágenes).
- [ ] Filtros nuevos (categoría/género/año) funcionan.

Publicar:

```powershell
git add assets/images/games/<id> js/data.js index.html
git commit -m "Agrega <Título> al catálogo"
git push origin main
# Cloudflare publica solo (≈1–2 min). Ver DEPLOY.md.
```

---

## 5. Errores frecuentes

| Síntoma | Causa probable |
| --- | --- |
| Imagen no carga (404) | Ruta o nombre de archivo mal escrito (`portada.jpg` vs `Portada.jpg`, extensión). |
| Imagen no carga aunque la ruta existe | Extensión equivocada (archivo `.jpg` que en realidad es PNG/WebP). Ver §2. |
| No aparece el chip de tamaño | Falta `specs.tamano`. |
| Botón *Descargar* deshabilitado | Falta `links.download`. |
| No sale en "Destacados" | Falta `featured: true`. |
| Filtros con valores raros | `category`/`genre`/`os`/`year` inconsistentes con el resto del catálogo. |
| Se ve un juego viejo | No subiste `?v=N` en `index.html` (caché del navegador). |

---

## Checklist mínimo

1. `id` elegido (minúsculas, guiones).
2. Portada y complementarias copiadas a `assets/images/games/<id>/` con los nombres exactos.
3. Objeto agregado a `games` en `js/data.js`.
4. DLC/expansiones incluidas volcadas en `dlc` (si el texto las menciona).
5. `node --check js/data.js`.
6. `?v=N` subido en `index.html`.
7. Probado en Home, Explorar y ficha (incluido el bloque DLC si aplica).
8. `git push origin main`.

> ¿Necesitás el detalle del schema completo? Ver [ARCHITECTURE.md](ARCHITECTURE.md#estructura-de-un-juego). ¿Cómo se despliega? Ver [DEPLOY.md](DEPLOY.md).
