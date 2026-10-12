/* ============================================================
   NOXIS — analytics.js
   Envío anónimo de eventos de interacción al backend de ranking
   (Cloudflare Worker). Sin cookies: sólo un id de sesión local.

   Uso:  NOXIS.Analytics.track("download", { gameId: "cyberpunk-2077" });
   En local (localhost / file:) no envía nada.
   ============================================================ */

(function (global) {
  "use strict";

  // URL del Worker de ranking. Ajustar si se usa otro nombre/subdominio.
  const WORKER_URL = "https://noxis-rank.nicolabarranco2.workers.dev";

  const isLocal =
    location.protocol === "file:" ||
    ["localhost", "127.0.0.1", ""].indexOf(location.hostname) !== -1;

  function sessionId() {
    try {
      const KEY = "noxis_sid";
      let sid = localStorage.getItem(KEY);
      if (!sid) {
        sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem(KEY, sid);
      }
      return sid;
    } catch (e) {
      return "anon";
    }
  }

  const Analytics = {
    endpoint: WORKER_URL,

    track(type, data) {
      if (isLocal || !WORKER_URL) return;

      const payload = JSON.stringify({
        type: type,
        gameId: data && data.gameId ? String(data.gameId) : undefined,
        sid: sessionId(),
      });

      // sendBeacon con text/plain evita el preflight CORS y no bloquea
      // la navegación (p. ej. al abrir la descarga en otra pestaña).
      try {
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "text/plain;charset=UTF-8" });
          navigator.sendBeacon(WORKER_URL + "/event", blob);
          return;
        }
      } catch (e) {
        /* continúa con fetch */
      }

      try {
        fetch(WORKER_URL + "/event", {
          method: "POST",
          body: payload,
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          keepalive: true,
        }).catch(function () {});
      } catch (e) {
        /* silencioso: la analítica nunca debe romper la UI */
      }
    },
  };

  global.NOXIS = global.NOXIS || {};
  global.NOXIS.Analytics = Analytics;
})(window);
