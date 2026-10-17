/* ============================================================
   NOXIS — orbs.js
   Genera los orbes del fondo (todos idénticos: mismo tamaño,
   color y brillo; solo cambian posición y tempo) y aplica un
   parallax sutil de la capa .orbs__layer.
   No depende de ningún otro módulo.
   ============================================================ */
(function () {
  "use strict";

  var layer = document.getElementById("orbs-layer");
  if (!layer) return;

  /* ---------- Orbes idénticos ---------- */
  var COUNT = 40;
  var seed = 20261016; // semilla fija → misma composición en cada carga

  function rnd() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  var fragment = document.createDocumentFragment();
  for (var i = 0; i < COUNT; i++) {
    var orb = document.createElement("span");
    orb.className = "orbs__orb";
    // Distribución regular en horizontal con jitter, y variación vertical.
    orb.style.left = (((i + 0.5) / COUNT) * 100 + (rnd() - 0.5) * 3).toFixed(2) + "%";
    orb.style.top = (35 + rnd() * 60).toFixed(2) + "%";
    orb.style.setProperty("--orb-dur", (34 + rnd() * 26).toFixed(1) + "s");
    orb.style.setProperty("--orb-delay", (-rnd() * 60).toFixed(1) + "s");
    orb.style.setProperty("--orb-sway", ((rnd() - 0.5) * 8).toFixed(2) + "vw");
    fragment.appendChild(orb);
  }
  layer.appendChild(fragment);

  /* ---------- Parallax sutil ---------- */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  if (reduce || !fine) return;

  var MAX = 16;
  var tx = 0;
  var ty = 0;
  var raf = 0;

  function apply() {
    raf = 0;
    layer.style.setProperty("--orbs-px", tx.toFixed(2) + "px");
    layer.style.setProperty("--orbs-py", ty.toFixed(2) + "px");
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(apply);
  }

  function onMove(event) {
    tx = -((event.clientX / window.innerWidth) * 2 - 1) * MAX;
    ty = -((event.clientY / window.innerHeight) * 2 - 1) * MAX;
    schedule();
  }

  function reset() {
    tx = 0;
    ty = 0;
    schedule();
  }

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerleave", reset);
  window.addEventListener("blur", reset);
})();
