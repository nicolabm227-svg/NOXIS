/* ============================================================
   NOXIS — app.js
   Núcleo de la aplicación: loader, navegación y enrutado
   simple entre vistas (Inicio / Explorar / Juego).
   ============================================================ */

(function (global) {
  "use strict";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const App = {
    state: {
      route: "home",
      selectedGameId: null,
      exploreSort: null,
    },

    views: {
      home: "#view-home",
      explore: "#view-explore",
      game: "#view-game",
    },

    init() {
      this.cacheDom();
      this.bindEvents();
      this.setFooterYear();
      this.hideLoader();
      this.showRoute("home");
      // Carga asíncrona de la popularidad dinámica (no bloquea el render).
      if (global.NOXIS.Data && typeof global.NOXIS.Data.init === "function") {
        global.NOXIS.Data.init();
      }
    },

    /* Rellena el año del footer con el año actual (evita que quede desactualizado). */
    setFooterYear() {
      const el = $("#footer-year");
      if (el) el.textContent = String(new Date().getFullYear());
    },

    cacheDom() {
      this.loader = $("#app-loader");
      this.backdrop = $("#app-backdrop");
      this.header = $("#site-header");
      this.navLinks = $$(".nav__link");
    },

    bindEvents() {
      // Navegación por enlaces
      this.navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          this.navigate(link.dataset.route || "home");
        });
      });

      // Marca -> Inicio
      $("#brand-link").addEventListener("click", (e) => {
        e.preventDefault();
        this.navigate("home");
      });

      // Botones "Ver todo" de cada sección -> Explorar con el orden de la sección.
      $$(".section-head__more").forEach((btn) => {
        btn.addEventListener("click", () => {
          const section = btn.closest(".carousel-section");
          this.state.exploreSort = section ? section.dataset.section : null;
          this.navigate("explore");
        });
      });

      // Sugerencias del buscador (compartidas por Home y Explorar).
      this.bindSuggest();

      // Botón "Volver arriba".
      this.bindBackToTop();
    },

    /* Muestra u oculta el botón "volver arriba" y gestiona el scroll. */
    bindBackToTop() {
      const btn = $("#back-to-top");
      if (!btn) return;

      const toggle = () => {
        btn.classList.toggle("is-visible", window.scrollY > 600);
      };
      window.addEventListener("scroll", toggle, { passive: true });
      toggle();

      btn.addEventListener("click", () => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      });
    },

    /* Sugerencias instantáneas bajo el buscador global.
       Reutiliza Data.searchGames (case-insensitive) y abre la ficha. */
    bindSuggest() {
      const input = $("#global-search");
      const box = $("#search-suggest");
      if (!input || !box || input.dataset.suggestBound) return;
      input.dataset.suggestBound = "1";

      const close = () => {
        box.innerHTML = "";
        box.classList.add("is-hidden");
      };

      /* Salir del buscador: limpia el input y restaura las secciones
         (Home) o el catálogo (Explorar) vía el evento input. */
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

    hideLoader() {
      const done = () => this.loader.classList.add("is-done");
      // Garantiza un mínimo de presencia visual del loader.
      setTimeout(done, 450);
    },

    /* Cambio de vista con breve transición de opacidad. */
    showRoute(route) {
      const target = this.views[route];
      if (!target) return;

      // Actualizar enlace activo
      this.navLinks.forEach((link) => {
        const active = link.dataset.route === route;
        link.classList.toggle("is-active", active);
      });

      // Ocultar todas las vistas
      const views = $$("main[id^='view-']");
      views.forEach((v) => {
        v.classList.add("is-hidden");
        v.setAttribute("aria-hidden", "true");
      });

      // Mostrar la vista objetivo reiniciando su animación de entrada.
      const view = $(target);
      view.classList.remove("is-hidden", "is-visible");
      void view.offsetWidth; // fuerza reflow para reiniciar la animación
      view.setAttribute("aria-hidden", "false");
      view.classList.add("is-visible");

      // Notificar a la vista (hook para home.js / game.js)
      if (typeof global.NOXIS.RouterHooks === "function") {
        global.NOXIS.RouterHooks(route, this.state);
      }
    },

    /* Acción al hacer clic sobre una tarjeta.
       Abre la ventana individual del juego como overlay
       sobre la vista actual (sin cambiar de ruta). */
    openGame(id) {
      this.state.selectedGameId = id;
      if (global.NOXIS.Game && typeof global.NOXIS.Game.open === "function") {
        global.NOXIS.Game.open(id);
      }
    },

    navigate(route) {
      this.state.route = route;

      if (route === "home") {
        this.state.selectedGameId = null;
      }

      // Transición del backdrop para suavizar el cambio
      this.backdrop.classList.add("is-visible");
      setTimeout(() => {
        this.showRoute(route);
        this.backdrop.classList.remove("is-visible");
      }, 180);

      // Volver arriba suave
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  };

  global.NOXIS = global.NOXIS || {};
  global.NOXIS.App = App;
})(window);

/* Inicialización una vez el DOM esté listo. */
document.addEventListener("DOMContentLoaded", () => {
  window.NOXIS.App.init();
});