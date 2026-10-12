# Desarrollo de NOXIS

Cómo ejecutar, probar y verificar el proyecto localmente.

## Requisitos

- Un navegador moderno (Chrome, Firefox, Edge, Safari).
- Sin dependencias de npm, sin build, sin backend.
- Opcional: [Node.js](https://nodejs.org/) solo para `node --check` (verificación de sintaxis).

## Ejecutar localmente

TODO el proyecto es estático. Abrí `index.html` con un servidor local (recomendado) o directamente.

### Opción A — VS Code Live Server

1. Instalá la extensión **Live Server**.
2. Abrí la carpeta del proyecto en VS Code.
3. Clic derecho sobre `index.html` → **Open with Live Server**.

### Opción B — Servidor estático con Python

```bash
python -m http.server 8000
# abrir http://localhost:8000
```

### Opción C — Servidor estático con Node (opcional)

```bash
npx serve .
# o
npx http-server -p 8000
```

> Usar un servidor local garantiza que las rutas relativas (`css/`, `js/`, `assets/`) se resuelvan correctamente.

## Verificar JavaScript

Sin errores de sintaxis:

```bash
node --check js/data.js
node --check js/app.js
node --check js/home.js
node --check js/explore.js
node --check js/game.js
```

Ejecutá todos juntos:

```bash
for f in js/*.js; do node --check "$f"; done && echo "JS OK"
```

## Verificar recursos

Revisar que todos los recursos referenciados existan (CSS, JS, imágenes). Las 30 portadas están en `assets/images/` como SVG (`cover-*.svg`). Cargá `index.html` en el navegador y verificá la consola (sin 404).

## Probar la Home

1. Al cargar, el loader se oculta y se muestra la Home.
2. Verificar las secciones *Destacados*, *Nuevos*, *Más populares* con tarjetas.
3. Escribir en el buscador global: la sección *Destacados* se reordena con los resultados.
4. Clic en "Ver todo" → navega a Explorar.

## Probar Explorar

1. Cambiar a "Explorar" desde la navegación.
2. Abrir un acordeón de filtro (Categoría, Género, Sistema, Año) y elegir una píldora.
3. Verificar que el contador, el grid y la paginación se actualicen.
4. Cambiar el ordenamiento (*Más recientes / Más populares / A-Z*).
5. Usar el botón "Limpiar filtros".
6. Comprobar que las herramientas abren en pestaña nueva.

## Probar la ventana del juego

1. Hacer clic en una tarjeta (Home o Explorar).
2. Verificar que la ventana se abre como overlay y que el fondo queda atenuado.
3. Cerrar de dos formas:
   - clic en el **punto rojo** de la barra superior;
   - clic en el área exterior (backdrop).
4. Verificar que *Descargar* y *Comprar* aparecen apilados (acciones visuales, sin lógica aún).
5. Verificar que las pestañas *Información / Requisitos / Galería* alternan el panel.

## Responsive

Usá las herramientas de desarrollo del navegador para probar en 1280 px (escritorio), 900 px (tablet), 520/480 px (móvil). Ver sección de breakpoints en [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## Convención de check rápido

Después de cualquier cambio:

1. `node --check` sobre los JS modificados.
2. Recargar y verificar consola vacía de errores.
3. Probar todas las pantallas (Home, Explorar) y abrir/cerrar el juego.