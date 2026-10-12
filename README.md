# NOXIS

> Catálogo de juegos de escritorio con estética premium. Explorá, filtrá y descubrí títulos seleccionados con una experiencia visual moderna e inspirada en interfaces de escritorio contemporáneas.

## ¿Qué es NOXIS?

NOXIS es una **aplicación web de front-end** (HTML + CSS + JavaScript, sin frameworks) que presenta un catálogo curado de videojuegos. Cada juego tiene una tarjeta con su portada, categoría, género, año y valoración, y puede abrirse en una **ventana individual flotante** con su información detallada.

El objetivo actual es **visual y de catálogo**: mostrar juegos de forma atractiva, permitir filtrar y ordenar, y preparar la estructura para funcionalidades futuras (descargas, requisitos, galería, usuarios).

## ¿Qué problema resuelve?

- Ofrece una **vista unificada y bonita** de un catálogo de juegos, sin depender de una plataforma externa.
- Centraliza la información de cada título (categoría, género, plataformas, año, valoración) en una **sola fuente de datos**.
- Prepara el terreno para una futura plataforma de distribución (descargas, requisitos de sistema, galerías) sin atarse todavía a un backend.

## ¿Qué experiencia busca ofrecer?

Una experiencia **oscura, tecnológica y premium**, con:
- Fondos negros profundos y acentos azul eléctrico / violeta muy sutiles.
- Microinteracciones discretas (hover en tarjetas, animaciones de entrada, glass/blur en la ventana del juego).
- Una ventana de juego con estética de **ventana de escritorio moderna** (tres puntos de control, marco con sombra profunda).
- Navegación fluida entre Inicio y Explorar mediante un router propio.

---

## Características principales actuales

- **Home** con tres secciones: *Destacados*, *Nuevos* y *Más populares*, más un buscador global.
- **Explorar** con:
  - Filtros por **categoría**, **género**, **sistema operativo** y **año**.
  - Ordenamiento por *recientes*, *populares* o *A-Z*.
  - Paginación (12 juegos por página).
  - Panel de **Herramientas** con enlaces externos.
- **Ventana individual del juego** (overlay) con portada, información, descripción, pestañas (*Información / Requisitos / Galería*) y botones *Descargar* / *Comprar*.
- **`NOXIS.Data`** como capa única de acceso a datos, pensada para migrar a Firebase sin tocar la interfaz.

## Estado actual del proyecto

El proyecto se encuentra en **fase de interfaz y catálogo**:

- **Implementado**: navegación, catálogo, filtros, ordenamiento, paginación, tarjetas, ventana del juego (estructura visual), herramientas con enlaces externos.
- **En progreso**: consolidación de la ventana del juego (cierre por punto rojo, botón "Comprar").
- **Pendiente / preparado**: descargas reales, requisitos de sistema, galería, autenticación, sincronización con Firebase.

Para un detalle completo, ver [PROJECT_STATUS.md](PROJECT_STATUS.md).

---

## Documentación

| Documento | Contenido |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitectura técnica, capas, flujo de datos y router. |
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
│   ├── data.js
│   ├── app.js
│   ├── home.js
│   ├── explore.js
│   └── game.js
└── assets/
    └── images/          (30 portadas SVG)
```

## Cómo empezar

Cloná el repositorio y abrí `index.html` con un servidor local (ver [DEVELOPMENT.md](DEVELOPMENT.md)). No necesita dependencias ni proceso de build.