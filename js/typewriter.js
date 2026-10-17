/* ============================================================
   NOXIS — typewriter.js
   Efecto de escritura de los encabezados: en Inicio (eyebrow,
   título, subtítulo) y en Explorar (cabecera). Se "escriben"
   letra a letra al entrar a cada vista.

   Claves de calidad:
   - Las letras se preparan y ocultan apenas carga el módulo, así
     nunca se ve el texto completo antes de la animación.
   - La escritura arranca justo cuando el loader empieza a fundirse.
   - Cadencia orgánica (leve variación) y micro-pausas tras comas
     y puntos, como un mecanografiado real.
   - Degradado continuo en el título y cursor fino con brillo.
   - Trabaja por "scope" (la vista activa), así Inicio y Explorar
     no se pisan entre sí.
   - Se omite por completo con prefers-reduced-motion.
   ============================================================ */

(function (global) {
  "use strict";

  /* Ritmo (ms/letra), pausa tras cada bloque (ms) y tope de pausa
     por signo de puntuación (ms). Los selectores se resuelven dentro
     de la vista (scope), por eso sirven para Inicio y Explorar. */
  const TARGETS = [
    { sel: ".home__eyebrow", speed: 26, gap: 220, punct: 90 },
    { sel: ".home__title, .explore__title", speed: 42, gap: 260, punct: 150 },
    { sel: ".home__subtitle", speed: 18, gap: 0, punct: 120 },
  ];

  /* Multiplicador de pausa según el signo que se acaba de escribir. */
  const PUNCT = { ",": 6, ";": 5, ":": 5, ".": 9, "!": 9, "?": 9, "…": 9, "—": 4, "·": 4 };

  const scopes = new WeakMap();
  let runId = 0;
  let timers = [];
  let loaderHandlers = null;

  const prefersReduce = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  };

  const clearTimers = () => {
    timers.forEach((t) => clearTimeout(t));
    timers = [];
  };

  const detachLoader = () => {
    if (loaderHandlers) {
      loaderHandlers();
      loaderHandlers = null;
    }
  };

  const reset = () => {
    clearTimers();
    detachLoader();
  };

  const makeChar = (ch) => {
    const span = document.createElement("span");
    span.className = "tw-ch";
    // Espacios duros: mantienen su ancho sin colapsar.
    span.textContent = ch === " " ? "\u00A0" : ch;
    return span;
  };

  /* Segmentos del contenido original: texto plano y tramos con
     degradado (`.text-grad`) que hay que preservar. */
  const parseSegments = (el) => {
    const segs = [];
    el.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        if (node.nodeValue) segs.push({ text: node.nodeValue, grad: false });
      } else if (node.nodeType === 1) {
        segs.push({
          text: node.textContent,
          grad: node.classList.contains("text-grad"),
        });
      }
    });
    return segs;
  };

  /* Reconstruye el elemento con una capa de letras envueltas en
     spans. El texto visible va en un contenedor aria-hidden y el
     texto accesible se expone con aria-label. */
  const build = (el, segments) => {
    const line = document.createElement("span");
    line.className = "tw-line";
    line.setAttribute("aria-hidden", "true");

    const chars = [];
    const grads = [];
    let full = "";

    segments.forEach((seg) => {
      full += seg.text;

      if (seg.grad) {
        const wrap = document.createElement("span");
        wrap.className = "tw-grad";
        const group = [];
        Array.from(seg.text).forEach((ch) => {
          const c = makeChar(ch);
          group.push(c);
          wrap.appendChild(c);
        });
        line.appendChild(wrap);
        grads.push({ wrap, chars: group });
        chars.push(...group);
        return;
      }

      // Texto plano: los espacios quedan como nodos de texto para
      // no romper el salto de línea natural entre palabras.
      seg.text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          line.appendChild(document.createTextNode(part));
          return;
        }
        Array.from(part).forEach((ch) => {
          const c = makeChar(ch);
          chars.push(c);
          line.appendChild(c);
        });
      });
    });

    el.textContent = "";
    el.appendChild(line);
    el.setAttribute("aria-label", full.replace(/\s+/g, " ").trim());
    return { chars, grads };
  };

  /* Reparte el mismo degradado entre las letras de un tramo: cada
     carácter recibe el fondo completo escalado al ancho del tramo y
     desplazado según su posición, para que el color fluya sin cortes
     aunque cada letra sea un elemento aparte. */
  const applyGradients = (grads) => {
    grads.forEach(({ wrap, chars }) => {
      const wrect = wrap.getBoundingClientRect();
      if (!wrect.width) return;
      chars.forEach((c) => {
        const rect = c.getBoundingClientRect();
        c.style.backgroundImage = "var(--grad-hero)";
        c.style.webkitBackgroundClip = "text";
        c.style.backgroundClip = "text";
        c.style.color = "transparent";
        c.style.backgroundRepeat = "no-repeat";
        c.style.backgroundSize = wrect.width + "px 100%";
        c.style.backgroundPosition = rect.left - wrect.left + "px 0";
      });
    });
  };

  const hideAll = (groups) => {
    groups.forEach((g) => {
      g.el.classList.add("tw-typing");
      g.el.classList.remove("tw-complete");
      g.chars.forEach((c) => c.classList.remove("is-on", "is-caret"));
    });
  };

  /* Construye (una sola vez) y oculta los encabezados de una vista. */
  const setup = (root) => {
    if (!root || scopes.has(root)) return scopes.get(root) || [];
    const groups = [];

    if (!prefersReduce()) {
      TARGETS.forEach((t) => {
        const el = root.querySelector(t.sel);
        if (!el) return;
        const { chars, grads } = build(el, parseSegments(el));
        if (!chars.length) return;
        groups.push({ el, chars, grads, speed: t.speed, gap: t.gap, punct: t.punct });
      });
      hideAll(groups);
    }

    scopes.set(root, groups);
    return groups;
  };

  const fontsReady = (cb) => {
    if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === "function") {
      document.fonts.ready.then(cb);
    } else {
      cb();
    }
  };

  const run = (token, groups) => {
    const valid = () => token === runId;
    groups.forEach((g) => applyGradients(g.grads));

    let t = 0;
    let caret = null;

    groups.forEach((g) => {
      g.chars.forEach((c) => {
        later(() => {
          if (!valid()) return;
          c.classList.add("is-on");
          if (caret) caret.classList.remove("is-caret");
          c.classList.add("is-caret");
          caret = c;
        }, t);

        // Cadencia orgánica: leve variación por letra.
        t += g.speed * (0.86 + Math.random() * 0.28);

        const mult = PUNCT[c.textContent];
        if (mult) t += Math.min(g.speed * (mult - 1), g.punct);
      });
      t += g.gap;
    });

    later(() => {
      if (!valid()) return;
      groups.forEach((g) => {
        g.el.classList.add("tw-complete");
        g.el.classList.remove("tw-typing");
      });
      later(() => {
        if (!valid()) return;
        groups.forEach((g) => g.chars.forEach((c) => c.classList.remove("is-caret")));
      }, 420);
    }, t + 60);
  };

  /* Arranca la escritura cuando el loader empieza a fundirse (o de
     inmediato en las visitas siguientes, que ya no tienen loader). */
  const whenLoaderFading = (cb) => {
    const loader = document.getElementById("app-loader");
    if (!loader || loader.classList.contains("is-done")) {
      later(cb, 200);
      return;
    }

    let fired = false;
    const onStart = () => fire();
    const onEnd = () => fire();
    const detach = () => {
      loader.removeEventListener("transitionstart", onStart);
      loader.removeEventListener("transitionend", onEnd);
    };
    const fire = () => {
      if (fired) return;
      fired = true;
      detach();
      later(cb, 40);
    };

    loader.addEventListener("transitionstart", onStart);
    loader.addEventListener("transitionend", onEnd);
    loaderHandlers = detach;

    // Red de seguridad si los eventos no llegan.
    later(() => {
      if (fired) return;
      fired = true;
      detach();
      cb();
    }, 1400);
  };

  const play = (root) => {
    if (prefersReduce()) return;
    const scope = root || document.getElementById("view-home");
    if (!scope) return;

    reset();
    const groups = setup(scope);
    if (!groups.length) return;

    const token = ++runId;
    hideAll(groups);
    whenLoaderFading(() => {
      if (token !== runId) return;
      fontsReady(() => {
        if (token !== runId) return;
        run(token, groups);
      });
    });
  };

  // Prepara ambas vistas apenas carga el módulo: así el hero no
  // muestra el texto completo antes de animar en la primera carga.
  setup(document.getElementById("view-home"));
  setup(document.getElementById("view-explore"));

  global.NOXIS = global.NOXIS || {};
  global.NOXIS.Typewriter = { play };
})(window);
