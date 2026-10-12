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
    },

    views: {
      home: "#view-home",
      explore: "#view-explore",
      game: "#view-game",
    },

    init() {
      this.cacheDom();
      this.bindEvents();
      this.hideLoader();
      this.showRoute("home");
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

      // Botones "Ver todo" de cada sección -> Explorar
      $$(".section-head__more").forEach((btn) => {
        btn.addEventListener("click", () => this.navigate("explore"));
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

      // Mostrar la vista objetivo con transición de entrada
      const view = $(target);
      view.classList.remove("is-hidden");
      view.setAttribute("aria-hidden", "false");
      view.classList.add("is-entering");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          view.classList.remove("is-entering");
          view.classList.add("is-visible");
        });
      });

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