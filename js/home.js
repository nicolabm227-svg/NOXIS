/* ============================================================
   NOXIS — home.js
   Renderizado de la Home: secciones y tarjetas.
   Lee los datos únicamente a través de NOXIS.Data,
   por lo que el origen (local o Firebase) es transparente.
   ============================================================ */

(function (global) {
  "use strict";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);

  const Home = {
    gridEls: {},
    observer: null,
    searchInput: null,

    init() {
      this.searchInput = $("#global-search");
      this.setupGrids();
      this.setupRevealObserver();
      this.bindSearch();
      this.renderSections();
      // Refleja el estado actual del buscador (p. ej. al volver a Inicio).
      this.applySearch(this.searchInput ? this.searchInput.value.trim() : "");
    },

    setupGrids() {
      this.sectionEls = {};
      const sectionEls = document.querySelectorAll(".carousel-section[data-section]");
      sectionEls.forEach((section) => {
        const key = section.dataset.section;
        this.sectionEls[key] = section;
        const grid = section.querySelector(".cards-grid");
        if (grid) this.gridEls[key] = grid;
      });
    },

    /* Construye cada sección con los juegos provistos por Data.
       Las secciones sin juegos (p. ej. catálogo chico) se ocultan. */
    renderSections() {
      const byKey = {};
      global.NOXIS.Data.getSections().forEach((s) => {
        byKey[s.key] = s;
      });

      Object.keys(this.sectionEls).forEach((key) => {
        const section = this.sectionEls[key];
        const grid = this.gridEls[key];
        const data = byKey[key];
        const has = !!(data && data.games.length);
        if (section) section.classList.toggle("is-hidden", !has);
        if (grid && has) {
          grid.innerHTML = data.games.map((game, i) => this.cardMarkup(game, i)).join("");
        }
      });

      this.observeCards();
    },

    /* Marca de una tarjeta. La navegación a la página del juego
       se delega en el App (hook del router).
       En Home se prioriza la portada y se reduce la información a
       una sola línea secundaria (categoría · año). */
    cardMarkup(game, index) {
      return `
        <a href="#" class="game-card" data-game-id="${game.id}" style="--i:${index || 0}" aria-label="Abrir ${game.title}">
          <div class="game-card__cover">
            <img class="game-card__img" src="${game.cover}" alt="Portada de ${game.title}" loading="lazy" decoding="async" />
            ${game.specs && game.specs.tamano ? `<span class="game-card__size">${game.specs.tamano}</span>` : ""}
            <div class="game-card__body">
              <h3 class="game-card__title">${game.title}</h3>
              <span class="game-card__meta">${game.category} · ${game.year}</span>
            </div>
          </div>
        </a>
      `;
    },

    /* Aparición progresiva de las tarjetas al hacer scroll. */
    setupRevealObserver() {
      if (this.observer) this.observer.disconnect();
      if ("IntersectionObserver" in window) {
        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                this.observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
        );
      }
    },

    observeCards() {
      const root = document.getElementById("view-home");
      if (!root) return;
      const cards = root.querySelectorAll(".game-card");
      if (this.observer) {
        cards.forEach((card) => this.observer.observe(card));
      } else {
        cards.forEach((card) => card.classList.add("is-visible"));
      }
      this.bindCardClicks();
    },

    /* Delegación única sobre la vista de Inicio: evita re-engarzar
       listeners en cada re-render y no toca las tarjetas de Explorar. */
    bindCardClicks() {
      const root = document.getElementById("view-home");
      if (!root || root.dataset.cardsBound) return;
      root.dataset.cardsBound = "1";
      root.addEventListener("click", (e) => {
        const card = e.target.closest(".game-card");
        if (!card || !root.contains(card)) return;
        e.preventDefault();
        const id = card.dataset.gameId;
        if (id && typeof global.NOXIS.App.openGame === "function") {
          global.NOXIS.App.openGame(id);
        }
      });
    },

    /* Búsqueda global sobre el catálogo de Inicio.
       Con una búsqueda activa se muestra una sola fila de resultados
       (se ocultan las demás secciones); al limpiar, se restaura todo. */
    bindSearch() {
      if (!this.searchInput || this.searchInput.dataset.searchBound) return;
      this.searchInput.dataset.searchBound = "1";
      this.searchInput.addEventListener("input", () => {
        this.applySearch(this.searchInput.value.trim());
      });
    },

    applySearch(q) {
      const Data = global.NOXIS.Data;
      const setVisible = (key, visible) => {
        const el = this.sectionEls[key];
        if (el) el.classList.toggle("is-hidden", !visible);
      };

      if (!q) {
        const byKey = {};
        Data.getSections().forEach((s) => {
          byKey[s.key] = s;
        });
        Object.keys(this.sectionEls).forEach((key) => {
          const data = byKey[key];
          const has = !!(data && data.games.length);
          setVisible(key, has);
          if (has) {
            const grid = this.gridEls[key];
            if (grid) {
              grid.innerHTML = data.games.map((game, i) => this.cardMarkup(game, i)).join("");
            }
          }
        });
        this.setFeaturedHeading("Destacados");
        this.observeCards();
        return;
      }

      const results = Data.searchGames(q);
      const grid = this.gridEls.featured;
      if (grid) {
        grid.innerHTML = results.length
          ? results.map((game, i) => this.cardMarkup(game, i)).join("")
          : `<p class="cards-empty">No se encontraron juegos para “${q}”.</p>`;
      }
      this.setFeaturedHeading(results.length ? "Resultados" : "Sin resultados");
      setVisible("featured", true);
      setVisible("new", false);
      setVisible("popular", false);
      this.observeCards();
    },

    setFeaturedHeading(text) {
      const section = this.sectionEls.featured;
      if (!section) return;
      const heading = section.querySelector(".section-head__title");
      if (heading) heading.textContent = text;
    },

  };

  /* Re-renderiza las secciones cuando llega la popularidad dinámica
     del backend (mantiene también el estado de búsqueda activo). */
  document.addEventListener("noxis:popularity", () => {
    if (!Home.searchInput) return;
    Home.applySearch(Home.searchInput.value.trim());
  });

  /* Hook del router: se invoca en cada cambio de vista. */
  global.NOXIS.RouterHooks = function (route, state) {
    if (route === "home") {
      Home.init();
    }
  };
})(window);