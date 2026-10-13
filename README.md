# NOXIS

> Catálogo de juegos de escritorio con estética premium. Explorá, filtrá y descubrí títulos seleccionados con una experiencia visual moderna e inspirada en interfaces de escritorio contemporáneas.

**Sitio en vivo:** https://noxis-hub-app.nicolabarranco2.workers.dev

## ¿Qué es NOXIS?

NOXIS es una **aplicación web de front-end** (HTML + CSS + JavaScript, sin frameworks ni build) que presenta un catálogo de videojuegos. Cada juego tiene una tarjeta con su portada, categoría, género, año y valoración, y puede abrirse en una **ventana individual flotante** con su información detallada, requisitos, galería y botones de descarga/compra.

Además del front, cuenta con un **backend mínimo** (un Cloudflare Worker + KV) que registra interacciones anónimas para ordenar el catálogo por popularidad real, y con **analítica de tráfico** vía Cloudflare Web Analytics.

## ¿Qué problema resuelve?

- Ofrece una **vista unificada y bonita** de un catálogo de juegos, sin depender de una plataforma externa.
- Centraliza la información de cada título en una **sola fuente de datos** (`NOXIS.Data`).
- Mide **qué juegos generan más interés** (aperturas, descargas, compras) y ordena el catálogo en consecuencia.
- Prepara el terreno para una futura plataforma de distribución sin atarse todavía a un backend grande.

## Características principales actuales

- **Home** con tres secciones: *Destacados*, *Nuevos* y *Más populares* (esta última ordenada por interacciones reales), más un buscador global.
- **Explorar** con filtros (categoría, género, sistema operativo, año), ordenamiento (recientes/populares/A-Z), paginación y panel de **Herramientas**.
- **Ventana individual del juego** (overlay) con portada, descripción, pestañas *Información / Requisitos / Galería* y botones *Descargar* / *Comprar* (enlaces externos).
- **`NOXIS.Data`** como capa única de acceso a datos (con popularidad dinámica y fallback estático).
- **Ranking por interacciones** (Worker + KV) y **analítica de tráfico** (Cloudflare Web Analytics).

## Estado actual del proyecto

El proyecto está **publicado y en producción**:

- **Implementado**: navegación, catálogo, filtros, ventana del juego completa, herramientas, analítica y ranking por interacciones, despliegue en Cloudflare.
- **En progreso**: observación de analítica, ajuste de pesos del ranking y limpieza de assets huérfanos.
- **Pendiente**: contenido definitivo donde falte, favicon, migración a Firebase.

Para el detalle completo, ver [PROJECT_STATUS.md](PROJECT_STATUS.md).

---

## Documentación

| Documento | Contenido |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitectura técnica, capas, flujo de datos, Worker y router. |
| [DEPLOY.md](DEPLOY.md) | Despliegue y operación en Cloudflare (sitio, Worker, KV, analítica). |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Identidad visual y "NOXIS Design System". |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Cómo ejecutar, probar y verificar el proyecto. |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Fotografía del estado actual, pendientes y deuda técnica. |
| [AI_CONTEXT.md](AI_CONTEXT.md) | Guía para futuras IAs de programación. |
| [DECISIONS.md](DECISIONS.md) | Decisiones de arquitectura adoptadas. |
| [CHANGELOG.md](CHANGELOG.md) | Registro cronológico del proyecto. |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Convenciones y reglas para contribuir. |

---

## Estructura rápida

```
NOXIS/
├── index.html
├── css/
│   ├── global.css
│   ├── components.css
│   ├── home.css
│   ├── explore.css
│   └── game.css
├── js/
│   ├── analytics.js      # envío de eventos al Worker
│   ├── data.js
│   ├── app.js
│   ├── home.js
│   ├── explore.js
│   └── game.js
├── worker/                # backend del ranking (Cloudflare Worker)
│   ├── index.js
│   └── wrangler.toml
├── assets/
│   └── images/
│       └── games/<id>/     # portada.jpg + complementaria-N.jpg
└── Contenedor de juegos/   # material crudo (gitignored)
```

## Ejecutar y desplegar

- **Local**: abrí `index.html` con un servidor local (Live Server o `npx.cmd serve .`). Ver [DEVELOPMENT.md](DEVELOPMENT.md).
- **Producción**: `git push origin main` publica el sitio solo; el Worker se despliega a mano. Ver [DEPLOY.md](DEPLOY.md).
