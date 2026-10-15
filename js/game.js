/* ============================================================
   NOXIS — game.js
   Ventana individual del juego.
   Se abre como overlay sobre Home/Explorar (sin romper el router)
   y lee los datos únicamente a través de NOXIS.Data.
   ============================================================ */

(function (global) {
  "use strict";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const Game = {
    root: null,
    current: null,
    lastFocused: null,
    keyHandler: null,

    init() {
      this.root = $("#view-game");
    },

    /* Abre la ventana para el juego indicado. */
    open(id) {
      const game = global.NOXIS.Data.getAllGames().find((g) => g.id === id);
      if (!game) return;

      this.init();
      this.current = game;
      this.lastFocused = document.activeElement;
      if (global.NOXIS.Analytics) {
        global.NOXIS.Analytics.track("open", { gameId: game.id });
      }
      this.root.innerHTML = this.render(game);
      this.root.setAttribute("aria-labelledby", "game-window-title");
      this.bindEvents(game);

      // Bloquear el scroll del fondo y mostrar
      document.body.classList.add("no-scroll");
      this.root.setAttribute("aria-hidden", "false");
      this.root.classList.remove("is-closing");
      this.root.classList.add("is-open");

      // Llevar el foco al diálogo para lectores de pantalla y teclado.
      const target = $(".game-window__dot--close", this.root);
      if (target) target.focus();
    },

    /* Cierra la ventana y vuelve a la vista anterior. */
    close() {
      if (!this.root || !this.root.classList.contains("is-open")) return;

      this.root.classList.add("is-closing");

      // Quitar el listener de teclado (siempre, no solo al cerrar con Esc).
      if (this.keyHandler) {
        document.removeEventListener("keydown", this.keyHandler);
        this.keyHandler = null;
      }

      // Devolver el foco al elemento que abrió la ventana.
      if (this.lastFocused && typeof this.lastFocused.focus === "function") {
        try {
          this.lastFocused.focus({ preventScroll: true });
        } catch (e) {
          /* el elemento pudo desaparecer: se ignora */
        }
      }
      this.lastFocused = null;

      setTimeout(() => {
        this.root.classList.remove("is-open", "is-closing");
        this.root.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-scroll");
        this.current = null;
      }, 220);
    },

    /* Mantiene el foco (Tab) dentro de la ventana mientras está abierta. */
    trapFocus(e) {
      if (e.key !== "Tab" || !this.root) return;
      const focusable = $$(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        this.root
      ).filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },

    bindEvents(game) {
      // Punto rojo (botón): cierra la ventana, igual que el fondo.
      const closeDot = $(".game-window__dot--close", this.root);
      if (closeDot) {
        closeDot.addEventListener("click", () => this.close());
      }
      $(".game-window__backdrop", this.root).addEventListener("click", () => this.close());

      // Esc cierra; Tab queda atrapado dentro de la ventana.
      this.keyHandler = (e) => {
        if (e.key === "Escape") this.close();
        else this.trapFocus(e);
      };
      document.addEventListener("keydown", this.keyHandler);

      // Tabs (áreas preparadas)
      const tabs = $$(".game-window__tab", this.root);
      const panels = $$(".game-window__panel", this.root);
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          const target = tab.dataset.tab;
          tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
          panels.forEach((p) => p.classList.toggle("is-hidden-panel", p.dataset.panel !== target));
        });
      });

      // Acción principal: Descargar (abre el enlace externo del juego).
      const dl = $(".btn-primary", this.root);
      if (dl && game.links && game.links.download) {
        dl.addEventListener("click", () => {
          if (global.NOXIS.Analytics) {
            global.NOXIS.Analytics.track("download", { gameId: game.id });
          }
          window.open(game.links.download, "_blank", "noopener,noreferrer");
        });
      }

      // Acción secundaria: Comprar (abre el enlace externo del juego).
      const buy = $(".btn-secondary", this.root);
      if (buy && game.links && game.links.purchase) {
        buy.addEventListener("click", () => {
          if (global.NOXIS.Analytics) {
            global.NOXIS.Analytics.track("purchase", { gameId: game.id });
          }
          window.open(game.links.purchase, "_blank", "noopener,noreferrer");
        });
      }

      // Galería horizontal (pasar imágenes de izquierda a derecha).
      this.bindGallery();
    },

    /* Navegación de la galería: anterior/siguiente y puntos indicadores. */
    bindGallery() {
      const track = $(".gallery__track", this.root);
      if (!track) return;
      const slides = $$(".gallery__slide", track);
      const dots = $$(".gallery__dot", this.root);
      const prev = $(".gallery__nav--prev", this.root);
      const next = $(".gallery__nav--next", this.root);
      const total = slides.length;
      if (!total) return;
      let index = 0;

      const update = () => {
        track.style.transform = `translateX(${-index * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
        if (prev) prev.disabled = index === 0;
        if (next) next.disabled = index === total - 1;
      };

      if (prev) prev.addEventListener("click", () => { if (index > 0) { index--; update(); } });
      if (next) next.addEventListener("click", () => { if (index < total - 1) { index++; update(); } });
      dots.forEach((d) =>
        d.addEventListener("click", () => {
          index = parseInt(d.dataset.index, 10);
          update();
        })
      );

      update();
    },

    /* Construcción del contenido de la ventana. */
    render(game) {
      const rating = game.rating ? `${game.rating.toFixed(1)} / 10` : null;
      const hasDownload = !!(game.links && game.links.download);
      const hasPurchase = !!(game.links && game.links.purchase);

      return `
        <div class="game-window__backdrop"></div>
        <div class="game-window__frame">
          <div class="game-window__bar">
            <div class="game-window__controls">
              <button type="button" class="game-window__dot game-window__dot--close" aria-label="Cerrar ventana"></button>
              <span class="game-window__dot game-window__dot--minimize" aria-hidden="true"></span>
              <span class="game-window__dot game-window__dot--maximize" aria-hidden="true"></span>
            </div>
            <div class="game-window__title" id="game-window-title"><strong>NOXIS</strong> <em>/</em> ${game.title}</div>
          </div>

          <div class="game-window__body">
            <div class="game-window__main">
              <figure class="game-window__cover">
                <img src="${game.cover}" alt="Portada de ${game.title}" />
              </figure>

              <div class="game-window__info">
                <p class="game-window__kicker">
                  ${game.category}<span class="sep">·</span>${game.genre}
                </p>
                <h2 class="game-window__name">${game.title}</h2>

                <ul class="game-window__facts">
                  <li class="game-window__fact"><strong>${game.year}</strong></li>
                  <li class="game-window__fact">${game.os.join(" · ")}</li>
                  ${rating ? `<li class="game-window__fact is-rating">★ ${rating}</li>` : ""}
                </ul>

                <div class="game-window__actions">
                  <button class="btn-primary" type="button" ${hasDownload ? "" : "disabled"}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                    </svg>
                    Descargar
                  </button>
                  <button class="btn-secondary" type="button" ${hasPurchase ? "" : "disabled"}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M3 3h2l2.5 12.5a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 2-1.6L21 7H6" />
                      <circle cx="9" cy="20" r="1.2" />
                      <circle cx="17" cy="20" r="1.2" />
                    </svg>
                    Comprar
                  </button>
                </div>
              </div>
            </div>

            <section class="game-window__section game-window__description">
              <h3 class="game-window__section-title">Descripción</h3>
              <p>${game.description || this.description(game)}</p>
            </section>

            <nav class="game-window__tabs" aria-label="Secciones del juego">
              <button class="game-window__tab is-active" type="button" data-tab="info">Información</button>
              <button class="game-window__tab" type="button" data-tab="requirements">Requisitos</button>
              <button class="game-window__tab" type="button" data-tab="gallery">Galería</button>
            </nav>

            <div class="game-window__panel" data-panel="info">
              ${this.specsMarkup(game)}
            </div>

            <div class="game-window__panel is-hidden-panel" data-panel="requirements">
              ${this.requirementsMarkup(game)}
            </div>

            <div class="game-window__panel is-hidden-panel" data-panel="gallery">
              ${this.galleryMarkup(game)}
            </div>
          </div>
        </div>
      `;
    },

    /* Descripción temporal derivada de los datos disponibles.
       En el futuro vendrá como campo real desde la fuente de datos. */
    description(game) {
      return `${game.title} es un título de ${game.category.toLowerCase()} (${game.genre}) publicado en ${game.year}. Disponible para ${game.os.join(", ")}. Esta descripción es provisional y se completará con contenido definitivo.`;
    },

    /* Requisitos del sistema: bloques Mínimos / Recomendados. */
    requirementsMarkup(game) {
      const req = game.requirements;
      if (!req || (!req.min && !req.rec)) {
        return `<div class="game-window__placeholder">Requisitos del sistema — próximamente.</div>`;
      }

      const labels = {
        os: "Sistema operativo",
        cpu: "Procesador",
        ram: "Memoria RAM",
        gpu: "Gráficos",
        vram: "VRAM",
        directx: "DirectX",
        storage: "Almacenamiento",
        sound: "Tarjeta de sonido",
        notes: "Notas adicionales",
      };
      const order = ["os", "cpu", "ram", "gpu", "vram", "directx", "storage", "sound", "notes"];

      const block = (title, data) => {
        if (!data) return "";
        const rows = order
          .filter((k) => data[k])
          .map(
            (k) =>
              `<div class="spec-row"><dt>${labels[k]}</dt><dd>${data[k]}</dd></div>`
          )
          .join("");
        return `
          <div class="spec-block">
            <h4 class="spec-block__title">${title}</h4>
            <dl class="spec-list">${rows}</dl>
          </div>`;
      };

      return `<div class="spec-grid">${block("Mínimos", req.min)}${block("Recomendados", req.rec)}</div>`;
    },

    /* Ficha técnica: combina los datos base del juego con los campos
       provistos por la ficha técnica del contenedor (specs). */
    specsMarkup(game) {
      const s = game.specs || {};
      const rows = [
        { label: "Plataforma", value: s.plataforma || (game.os ? game.os.join(" · ") : "") },
        { label: "Categoría", value: game.category },
        { label: "Género", value: s.genero || game.genre },
        { label: "Año", value: s.anio || String(game.year) },
        { label: "Idioma (textos)", value: s.idiomaTextos },
        { label: "Idioma (voces)", value: s.idiomaVoces },
        { label: "Idioma", value: s.idioma },
        { label: "Tamaño", value: s.tamano },
        { label: "Formato", value: s.formato },
      ].filter((r) => r.value);

      const dlc = Array.isArray(game.dlc) ? game.dlc.filter(Boolean) : [];
      const dlcMarkup = dlc.length
        ? `
        <div class="game-window__dlc">
          <h4 class="game-window__section-title">Contenido adicional (DLC)</h4>
          <ul class="dlc-list">
            ${dlc.map((name) => `<li class="dlc-item">${name}</li>`).join("")}
          </ul>
        </div>`
        : "";

      return `
        <dl class="game-window__info-grid">
          ${rows
            .map(
              (r) => `<div class="game-window__info-cell"><dt>${r.label}</dt><dd>${r.value}</dd></div>`
            )
            .join("")}
        </dl>${dlcMarkup}`;
    },

    /* Galería horizontal: las imágenes se pasan de izquierda a derecha. */
    galleryMarkup(game) {
      const imgs = Array.isArray(game.gallery) ? game.gallery : [];
      if (!imgs.length) {
        return `<div class="game-window__placeholder">Galería de imágenes — próximamente.</div>`;
      }

      const slides = imgs
        .map(
          (src, i) =>
            `<figure class="gallery__slide"><img src="${src}" alt="Imagen ${i + 1} de ${game.title}" /></figure>`
        )
        .join("");

      const dots = imgs
        .map(
          (_, i) =>
            `<button type="button" class="gallery__dot${i === 0 ? " is-active" : ""}" data-index="${i}" aria-label="Imagen ${i + 1}"></button>`
        )
        .join("");

      return `
        <div class="gallery">
          <div class="gallery__viewport">
            <div class="gallery__track">${slides}</div>
          </div>
          <div class="gallery__controls">
            <button type="button" class="gallery__nav gallery__nav--prev" aria-label="Imagen anterior">‹</button>
            <div class="gallery__dots">${dots}</div>
            <button type="button" class="gallery__nav gallery__nav--next" aria-label="Imagen siguiente">›</button>
          </div>
        </div>`;
    },
  };

  global.NOXIS = global.NOXIS || {};
  global.NOXIS.Game = Game;
})(window);