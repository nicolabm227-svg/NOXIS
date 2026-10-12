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
    suggestEl: null,

    init() {
      this.searchInput = $("#global-search");
      this.suggestEl = $("#search-suggest");
      this.setupGrids();
      this.setupRevealObserver();
      this.bindSearch();
      this.bindSuggest();
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

    /* Construye cada sección con los juegos provistos por Data. */
    renderSections() {
      const sections = global.NOXIS.Data.getSections();

      sections.forEach((section) => {
        const grid = this.gridEls[section.key];
        if (!grid) return;
        grid.innerHTML = section.games.map((game) => this.cardMarkup(game)).join("");
      });

      this.observeCards();
    },

    /* Marca de una tarjeta. La navegación a la página del juego
       se delega en el App (hook del router).
       En Home se prioriza la portada y se reduce la información a
       una sola línea secundaria (categoría · año). */
    cardMarkup(game) {
      return `
        <a href="#" class="game-card" data-game-id="${game.id}" aria-label="Abrir ${game.title}">
          <div class="game-card__cover">
            <img class="game-card__img" src="${game.cover}" alt="Portada de ${game.title}" loading="lazy" />
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
      if (!this.observer) {
        document.querySelectorAll(".game-card").forEach((c) => c.classList.add("is-visible"));
        this.bindCardClicks();
        return;
      }
      const cards = document.querySelectorAll(".game-card");
      cards.forEach((card) => this.observer.observe(card));
      this.bindCardClicks();
    },

    bindCardClicks() {
      document.querySelectorAll(".game-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          e.preventDefault();
          const id = card.dataset.gameId;
          if (id && typeof global.NOXIS.App.openGame === "function") {
            global.NOXIS.App.openGame(id);
          }
        });
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
        ["featured", "new", "popular"].forEach((key) => {
          const grid = this.gridEls[key];
          if (grid) {
            grid.innerHTML = Data.getSectionGames(key)
              .map((game) => this.cardMarkup(game))
              .join("");
          }
          setVisible(key, true);
        });
        this.setFeaturedHeading("Destacados");
        this.observeCards();
        return;
      }

      const results = Data.searchGames(q);
      const grid = this.gridEls.featured;
      if (grid) {
        grid.innerHTML = results.length
          ? results.map((game) => this.cardMarkup(game)).join("")
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

    /* Sugerencias instantáneas bajo el buscador.
       Reutiliza Data.searchGames (case-insensitive, por nombre y más),
       no duplica filtrado: solo presenta un atajo de navegación. */
    bindSuggest() {
      if (!this.searchInput || !this.suggestEl) return;
      const input = this.searchInput;
      const box = this.suggestEl;

      const close = () => {
        box.innerHTML = "";
        box.classList.add("is-hidden");
      };

      /* Salir del buscador: limpia el input y restaura las secciones
         (Home) o el catálogo completo (Explorar) vía el evento input. */
      const exitSearch = () => {
        if (!input.value) {
          close();
          return;
        }
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        close();
      };

      const open = (q) => {
        const results = global.NOXIS.Data.searchGames(q).slice(0, 5);
        if (!results.length) {
          close();
          return;
        }

        box.innerHTML = results
          .map(
            (game) => `
            <button type="button" class="search-suggest__item" data-game-id="${game.id}" role="option">
              <img class="search-suggest__thumb" src="${game.cover}" alt="Portada de ${game.title}" />
              <span class="search-suggest__name">${game.title}</span>
            </button>
          `
          )
          .join("");
        box.classList.remove("is-hidden");

        box.querySelectorAll(".search-suggest__item").forEach((item) => {
          item.addEventListener("click", () => {
            const id = item.dataset.gameId;
            input.value = "";
            input.dispatchEvent(new Event("input", { bubbles: true }));
            close();
            if (id && typeof global.NOXIS.App.openGame === "function") {
              global.NOXIS.App.openGame(id);
            }
          });
        });
      };

      input.addEventListener("input", () => {
        const q = input.value.trim();
        if (!q) {
          close();
          return;
        }
        open(q);
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") exitSearch();
      });

      document.addEventListener("click", (e) => {
        if (box.contains(e.target) || e.target === input) return;
        if (!box.classList.contains("is-hidden") || input.value) exitSearch();
      });
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