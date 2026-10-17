/* ============================================================
   NOXIS — explore.js
   Lógica de la pantalla Explorar: filtros, ordenamiento,
   paginación y renderizado del catálogo.
   Lee los datos únicamente a través de NOXIS.Data.
   ============================================================ */

(function (global) {
  "use strict";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const PER_PAGE = 12;

  const Explore = {
    state: {
      category: "",
      genre: "",
      os: "",
      year: "",
      sort: "recent",
      page: 1,
      query: "",
    },

    grids: {},
    observer: null,

    init() {
      this.cacheDom();
      this.renderFacets();
      this.renderTools();
      this.bindEvents();

      // Orden heredado de los accesos "Ver todo" de la Home.
      const appState = global.NOXIS.App ? global.NOXIS.App.state : null;
      const preset = appState ? appState.exploreSort : null;
      if (preset === "new") this.state.sort = "recent";
      else if (preset === "featured" || preset === "popular") this.state.sort = "popular";
      if (appState) appState.exploreSort = null;
      if (this.sort) this.sort.value = this.state.sort;

      // La barra del header también filtra el catálogo de Explorar.
      const gi = document.getElementById("global-search");
      this.state.query = gi ? gi.value.trim() : "";
      this.bindGlobalSearch();
      this.apply();

      // Efecto de escritura de la cabecera (se re-ejecuta al volver).
      if (global.NOXIS.Typewriter && typeof global.NOXIS.Typewriter.play === "function") {
        global.NOXIS.Typewriter.play(document.getElementById("view-explore"));
      }
    },

    /* Vincula (una sola vez) la barra de búsqueda global al catálogo. */
    bindGlobalSearch() {
      const input = document.getElementById("global-search");
      if (!input || input.dataset.exploreBound) return;
      input.dataset.exploreBound = "1";
      input.addEventListener("input", () => {
        this.state.query = input.value.trim();
        this.state.page = 1;
        this.apply();
      });
    },

    cacheDom() {
      this.grid = $("#explore-grid");
      this.count = $("#explore-count");
      this.pagination = $("#explore-pagination");
      this.sort = $("#explore-sort");
      this.filterEls = {
        category: $("#filter-category"),
        genre: $("#filter-genre"),
        os: $("#filter-os"),
        year: $("#filter-year"),
      };
    },

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
          { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
        );
      }
    },

    observeCards() {
      const cards = $$(".game-card", this.grid);
      if (this.observer) {
        cards.forEach((c) => this.observer.observe(c));
      } else {
        cards.forEach((c) => c.classList.add("is-visible"));
      }
    },

    /* Poblado de píldoras de filtro por faceta. */
    renderFacets() {
      const facets = global.NOXIS.Data.getFacets();

      const labels = { category: "Categoría", genre: "Género", os: "Sistema", year: "Año" };
      const configs = [
        { key: "category", values: facets.categories },
        { key: "genre", values: facets.genres },
        { key: "os", values: facets.os },
        { key: "year", values: facets.years.map(String) },
      ];

      configs.forEach(({ key, values }) => {
        const el = this.filterEls[key];
        if (!el) return;

        const chips = [`<button type="button" class="filter-chip is-active" data-key="${key}" data-value="" role="listitem">Todos</button>`]
          .concat(
            values.map(
              (v) =>
                `<button type="button" class="filter-chip" data-key="${key}" data-value="${v}" role="listitem">${v}</button>`
            )
          )
          .join("");

        el.innerHTML = chips;
        el.setAttribute("aria-label", `Filtrar por ${labels[key]}`);
      });
    },

    renderTools() {
      const list = $("#tools-list");
      if (!list) return;
      list.innerHTML = global.NOXIS.Data.getTools()
        .map(
          (t) => `
            <li>
              <a class="tool-item" href="${t.url}" target="_blank" rel="noopener noreferrer" data-tool="${t.id}">
                <span class="tool-item__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M3 13h4l1.5-7 4 12 2-5H21" />
                  </svg>
                </span>
                <span>${t.name}</span>
              </a>
            </li>
          `
        )
        .join("");
    },

    bindEvents() {
      // Filtros (delegación de eventos)
      this.bindFilterClicks();

      // Accordion de filtros (un criterio abierto a la vez)
      this.bindAccordion();

      // Limpiar filtros
      this.bindClearFilters();

      // Ordenamiento
      this.sort.addEventListener("change", () => {
        this.state.sort = this.sort.value;
        this.state.page = 1;
        this.apply();
      });
    },

    /* Comportamiento desplegable: al abrir un criterio, cierra los demás.
       Permite cerrar el criterio actual con un nuevo clic. */
    bindAccordion() {
      this.accordion = $("#filters-accordion");
      if (!this.accordion || this.accordion.dataset.bound) return;
      this.accordion.dataset.bound = "1";

      this.accordion.addEventListener("click", (e) => {
        const head = e.target.closest(".accordion__head");
        if (!head) return;
        const item = head.closest(".accordion__item");
        if (!item) return;

        const isOpen = item.classList.contains("is-open");
        this.closeAllFilters();
        if (!isOpen) {
          item.classList.add("is-open");
          head.setAttribute("aria-expanded", "true");
        }
      });
    },

    closeAllFilters() {
      if (!this.accordion) return;
      $$(".accordion__item", this.accordion).forEach((item) => {
        item.classList.remove("is-open");
        const head = item.querySelector(".accordion__head");
        if (head) head.setAttribute("aria-expanded", "false");
      });
    },

    /* "Limpiar filtros": restablece todo el estado y cierra los paneles. */
    bindClearFilters() {
      this.clearBtn = $("#filters-clear");
      if (!this.clearBtn) return;

      this.clearBtn.addEventListener("click", () => {
        ["category", "genre", "os", "year"].forEach((key) => (this.state[key] = ""));
        this.state.page = 1;
        this.closeAllFilters();
        this.apply();
      });
    },

    /* Estado habilitado/deshabilitado del botón "Limpiar filtros". */
    syncClear() {
      if (!this.clearBtn) return;
      const hasFilter =
        ["category", "genre", "os", "year"].some((key) => this.state[key] !== "");
      this.clearBtn.disabled = !hasFilter;
    },

    /* Delega el clic en píldoras de filtro (event delegation). */
    bindFilterClicks() {
      Object.values(this.filterEls).forEach((el) => {
        if (!el || el.dataset.bound) return;
        el.dataset.bound = "1";
        el.addEventListener("click", (e) => {
          const chip = e.target.closest(".filter-chip");
          if (!chip) return;

          const key = chip.dataset.key;
          const value = chip.dataset.value;
          this.state[key] = value;
          this.state.page = 1;
          this.apply();
        });
      });
    },

    /* Marca de tarjeta (variante compacta para Explorar). */
    cardMarkup(game, index) {
      return `
        <a href="#" class="game-card" data-game-id="${game.id}" style="--i:${index || 0}" aria-label="Abrir ${game.title}">
          <div class="game-card__cover">
            <img class="game-card__img" src="${game.cover}" alt="Portada de ${game.title}" loading="lazy" decoding="async" />
            ${game.specs && game.specs.tamano ? `<span class="game-card__size">${game.specs.tamano}</span>` : ""}
            <div class="game-card__body">
              <span class="game-card__meta">${game.category}</span>
              <h3 class="game-card__title">${game.title}</h3>
              <span class="game-card__sub">${game.sub}</span>
            </div>
          </div>
        </a>
      `;
    },

    /* Obtiene el listado filtrado y ordenado. */
    filtered() {
      let list = global.NOXIS.Data.filterGames({
        category: this.state.category,
        genre: this.state.genre,
        os: this.state.os,
        year: this.state.year,
        sort: this.state.sort,
      });

      const q = (this.state.query || "").toLowerCase();
      if (q) {
        list = list.filter((g) =>
          [g.title, g.category, g.genre, g.sub].join(" ").toLowerCase().includes(q)
        );
      }

      return list;
    },

    /* Aplica filtros + paginación y actualiza la vista. */
    apply() {
      const all = this.filtered();
      const total = all.length;
      const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
      this.state.page = Math.min(this.state.page, totalPages);

      const start = (this.state.page - 1) * PER_PAGE;
      const pageGames = all.slice(start, start + PER_PAGE);

      // Contador
      this.count.textContent = `${total} ${total === 1 ? "juego" : "juegos"}`;

      // Estado del botón "Limpiar filtros"
      this.syncClear();

      // Grid
      if (total === 0) {
        this.grid.innerHTML =
          '<p class="cards-empty">No se encontraron juegos con esos filtros.</p>';
      } else {
        this.grid.innerHTML = pageGames.map((g, i) => this.cardMarkup(g, i)).join("");
      }

      // Estado activo en píldoras
      this.syncActiveChips();

      // Paginación
      this.renderPagination(totalPages);

      // Transición + clics
      this.setupRevealObserver();
      this.observeCards();
      this.bindCardClicks();
    },

    syncActiveChips() {
      Object.entries(this.filterEls).forEach(([key, el]) => {
        if (!el) return;
        $$(".filter-chip", el).forEach((chip) => {
          chip.classList.toggle("is-active", chip.dataset.value === String(this.state[key] || ""));
        });
      });
    },

    renderPagination(totalPages) {
      if (!this.pagination) return;
      const current = this.state.page;
      let html = "";

      const prevDisabled = current <= 1 ? "disabled" : "";
      html += `<button type="button" class="pagination__btn pagination__nav" data-page="${current - 1}" ${prevDisabled} aria-label="Página anterior">‹</button>`;

      const pages = this.pagesWindow(current, totalPages);
      pages.forEach((p) => {
        if (p === "...") {
          html += `<span class="pagination__dots">…</span>`;
        } else {
          const active = p === current ? " is-active" : "";
          html += `<button type="button" class="pagination__btn${active}" data-page="${p}">${p}</button>`;
        }
      });

      const nextDisabled = current >= totalPages ? "disabled" : "";
      html += `<button type="button" class="pagination__btn pagination__nav" data-page="${current + 1}" ${nextDisabled} aria-label="Página siguiente">›</button>`;

      this.pagination.innerHTML = html;

      // Enlazar clics de paginación
      $$(".pagination__btn", this.pagination).forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.disabled) return;
          this.goTo(parseInt(btn.dataset.page, 10));
        });
      });
    },

    /* Ventana de páginas con elipses. */
    pagesWindow(current, total) {
      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }
      const set = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
      const sorted = Array.from(set).filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
      const out = [];
      let prev = 0;
      sorted.forEach((p) => {
        if (prev && p - prev > 1) out.push("...");
        out.push(p);
        prev = p;
      });
      return out;
    },

    goTo(page) {
      if (page < 1) return;
      this.state.page = page;
      this.apply();
      // Desplazamiento suave a la parte superior del catálogo
      const top = this.grid ? this.grid.offsetTop - var_nav() - 20 : 0;
      window.scrollTo({ top, behavior: "smooth" });
    },

    bindCardClicks() {
      if (!this.grid || this.grid.dataset.cardsBound) return;
      this.grid.dataset.cardsBound = "1";
      this.grid.addEventListener("click", (e) => {
        const card = e.target.closest(".game-card");
        if (!card) return;
        e.preventDefault();
        const id = card.dataset.gameId;
        if (id && typeof global.NOXIS.App.openGame === "function") {
          global.NOXIS.App.openGame(id);
        }
      });
    },
  };

  // Altura del header para el scroll
  function var_nav() {
    const cs = getComputedStyle(document.documentElement);
    const raw = cs.getPropertyValue("--nav-h").trim();
    return parseInt(raw, 10) || 60;
  }

  /* Re-aplica filtros/orden cuando llega la popularidad dinámica. */
  document.addEventListener("noxis:popularity", () => {
    if (Explore.grid) Explore.apply();
  });

  /* Encadena el hook del router: mantiene el de Home y agrega Explorar. */
  const existingHook = global.NOXIS.RouterHooks;
  global.NOXIS.RouterHooks = function (route, state) {
    if (route === "explore") {
      Explore.init();
    }
    if (typeof existingHook === "function") {
      existingHook(route, state);
    }
  };
})(window);