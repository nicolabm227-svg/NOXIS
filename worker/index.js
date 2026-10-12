/* ============================================================
   NOXIS — Worker de ranking por interacciones (Cloudflare)
   Backend mínimo, sin frameworks, sobre KV.

   Endpoints:
     POST /event    { type: "open"|"download"|"purchase", gameId, sid }
     GET  /popular  -> { "<gameId>": <score>, ... }

   Almacenamiento (binding KV `NOXIS_EVENTS`):
     - "agg:<gameId>"        -> JSON { open, download, purchase, at }
     - "seen:<sid>:<g>:<t>"  -> dedupe temporal (TTL)

   El score aplica pesos por tipo y un decaimiento exponencial con
   el tiempo, para que lo reciente pese más que lo viejo.
   ============================================================ */

const WEIGHTS = { open: 1, download: 5, purchase: 2 };
const HALF_LIFE_DAYS = 30;
const DEDUPE_TTL_SECONDS = 60 * 60 * 12; // 12 h por sesión/juego/tipo
const CACHE_SECONDS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;
const VALID_TYPES = new Set(["open", "download", "purchase"]);

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function round(n, decimals) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

/* Aplica decaimiento exponencial a los contadores según la antigüedad. */
function decay(counts, at, now) {
  const days = Math.max(0, (now - (at || now)) / DAY_MS);
  const factor = Math.pow(0.5, days / HALF_LIFE_DAYS);
  if (factor >= 1) return counts;
  return {
    open: (counts.open || 0) * factor,
    download: (counts.download || 0) * factor,
    purchase: (counts.purchase || 0) * factor,
  };
}

function scoreOf(counts) {
  return (
    WEIGHTS.open * (counts.open || 0) +
    WEIGHTS.download * (counts.download || 0) +
    WEIGHTS.purchase * (counts.purchase || 0)
  );
}

async function handleEvent(request, env, cors) {
  let body;
  try {
    body = JSON.parse(await request.text());
  } catch (e) {
    return json({ error: "bad_json" }, 400, cors);
  }

  const { type, gameId, sid } = body || {};
  if (!VALID_TYPES.has(type) || typeof gameId !== "string" || !gameId) {
    return json({ error: "bad_request" }, 400, cors);
  }

  const kv = env.NOXIS_EVENTS;
  if (!kv) return json({ error: "kv_not_bound" }, 500, cors);

  // Dedupe: una interacción por sesión/juego/tipo dentro del TTL.
  const session = typeof sid === "string" && sid ? sid.slice(0, 64) : "anon";
  const dedupeKey = `seen:${session}:${gameId}:${type}`;
  if (await kv.get(dedupeKey)) return json({ ok: true, deduped: true }, 200, cors);

  const key = `agg:${gameId}`;
  const now = Date.now();
  const raw = await kv.get(key, "json");
  const base = raw ? decay(raw, raw.at, now) : { open: 0, download: 0, purchase: 0 };

  base[type] = (base[type] || 0) + 1;

  const next = {
    open: round(base.open || 0, 3),
    download: round(base.download || 0, 3),
    purchase: round(base.purchase || 0, 3),
    at: now,
  };

  await kv.put(dedupeKey, "1", { expirationTtl: DEDUPE_TTL_SECONDS });
  await kv.put(key, JSON.stringify(next));

  return json({ ok: true }, 200, cors);
}

async function handlePopular(env, cors) {
  const kv = env.NOXIS_EVENTS;
  if (!kv) return json({}, 200, cors);

  const now = Date.now();
  const out = {};
  let cursor;

  do {
    const page = await kv.list({ prefix: "agg:", cursor });
    for (const k of page.keys) {
      const raw = await kv.get(k.name, "json");
      if (!raw) continue;
      const counts = decay(raw, raw.at, now);
      out[k.name.slice(4)] = round(scoreOf(counts), 2);
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);

  const res = json(out, 200, cors);
  res.headers.set("Cache-Control", `public, max-age=${CACHE_SECONDS}`);
  return res;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request.headers.get("Origin"));

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (url.pathname === "/event" && request.method === "POST") {
      return handleEvent(request, env, cors);
    }
    if (url.pathname === "/popular" && request.method === "GET") {
      return handlePopular(env, cors);
    }
    return json({ error: "not_found" }, 404, cors);
  },
};
