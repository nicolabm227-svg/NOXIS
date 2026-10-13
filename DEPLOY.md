# Despliegue y operación — NOXIS

Cómo se publica y se opera NOXIS en producción. Es el documento que necesita una IA (o un desarrollador) para **subir cambios, entender dónde corre todo y no romper el estado en vivo**.

> Regla de oro: **el sitio se despliega solo con `git push`; el Worker se despliega a mano con `wrangler`.** No son lo mismo.

## 1. Visión general

NOXIS en producción son **dos piezas independientes** alojadas en Cloudflare (cuenta `nicolabarranco2`):

```
  GitHub (repo NOXIS, rama main)
        │  push
        ▼
  Cloudflare  ──►  Sitio estático (Worker "noxis-hub-app", git-connected)
                   https://noxis-hub-app.nicolabarranco2.workers.dev

  Cloudflare  ──►  Worker de ranking (Worker "noxis-rank", deploy manual)
                   https://noxis-rank.nicolabarranco2.workers.dev
                        │  binding KV
                        ▼
                   KV namespace "NOXIS_EVENTS"
```

| Recurso | Valor |
| --- | --- |
| Repo GitHub | `https://github.com/nicolabm227-svg/NOXIS` (rama `main`) |
| Sitio en vivo | `https://noxis-hub-app.nicolabarranco2.workers.dev` |
| Worker de ranking | `https://noxis-rank.nicolabarranco2.workers.dev` |
| KV namespace | `NOXIS_EVENTS` (id `d41ce0b8a6894be9a5cafa4042a3cd54`) |
| Cuenta Cloudflare | subdominio `nicolabarranco2` |
| Analítica de tráfico | Cloudflare Web Analytics (dashboard) |

> Nota histórica: el proyecto se servía antes desde **GitHub Pages**. Ya no. El hosting real es Cloudflare Workers.
>
> Existe además un Worker llamado `noxis` (`noxis.nicolabarranco2.workers.dev`) creado por error y **sin uso**. No forma parte del proyecto; ignorarlo.

## 2. Desplegar el sitio (automático)

El sitio (HTML/CSS/JS + assets) es **estático, sin build**. Cloudflare está conectado al repo de GitHub y **reconstruye y publica automáticamente al recibir un push a `main`**.

```bash
git add .
git commit -m "descripción del cambio"
git push origin main
# Cloudflare detecta el push y publica solo (≈1–2 min).
```

No hay paso de build, ni `npm install`, ni configuración de carpeta de salida más allá de la raíz del repo.

## 3. Desplegar el Worker (manual)

El Worker de ranking **no** está conectado a Git. Cada vez que cambies `worker/index.js` (o la config), hay que desplegarlo a mano:

```bash
# desde la carpeta worker/
npx.cmd wrangler deploy
```

- Config: `worker/wrangler.toml` (`name = "noxis-rank"`, `main = "index.js"`, binding KV `NOXIS_EVENTS` con su `id`).
- En **Windows/PowerShell**, usá `npx.cmd` (o `npm.cmd`): los `.ps1` de npm/npx están bloqueados por la política de ejecución de scripts.
- Si `wrangler login` expira esperando el callback del navegador, usá el flujo de dispositivo (sin pestañas que se venzan):

```bash
npx.cmd wrangler login --device
```

## 4. Verificación rápida post-deploy

Sitio:

- Abrir `https://noxis-hub-app.nicolabarranco2.workers.dev/` y comprobar que carga el catálogo.
- Consola del navegador sin errores. (Existe un 404 conocido del `favicon.ico`; es inofensivo.)

Worker:

```bash
# Debe devolver {} si no hay interacciones (o { "<gameId>": <score> })
curl https://noxis-rank.nicolabarranco2.workers.dev/popular

# Debe devolver {"ok":true}
curl -X POST https://noxis-rank.nicolabarranco2.workers.dev/event ^
  -H "Content-Type: text/plain" ^
  -d "{\"type\":\"open\",\"gameId\":\"cyberpunk-2077\",\"sid\":\"smoke\"}"
```

> Los eventos de prueba quedan en el KV. Si querés limpiarlos:
> `npx.cmd wrangler kv key delete "agg:cyberpunk-2077" --namespace-id d41ce0b8a6894be9a5cafa4042a3cd54 --remote`

## 5. Analítica de tráfico (visitas)

- Se ve en el **dashboard de Cloudflare → Analytics & Logs → Web Analytics** (visitas, páginas, referrers, dispositivos, países).
- Cloudflare Web Analytics **no** soporta eventos personalizados (clics por juego). Para eso está el Worker `noxis-rank`.

## 6. Ranking por interacciones

- El front (`js/analytics.js`) envía eventos `open` / `download` / `purchase` al Worker.
- `NOXIS.Data.init()` lee `GET /popular` y reordena "Más populares" y el orden "populares" de Explorar.
- El score y los pesos viven en `worker/index.js` (ver [ARCHITECTURE.md](ARCHITECTURE.md)).

## 7. Cache-busting

El sitio referencia CSS/JS con `?v=N` (hoy `v=10`) para forzar la recarga en navegadores que tengan versiones viejas en caché.

- **Cada vez que cambies un `.css` o `.js`, subí el número** en `index.html` (`?v=11`, `?v=12`, …).
- Si solo cambia `js/data.js` (agregar juegos), igual conviene subir la versión.

## 8. Entorno (Windows)

| Tema | Detalle |
| --- | --- |
| npm/npx | Usar `npm.cmd` / `npx.cmd` (los `.ps1` están bloqueados). |
| wrangler | `npx.cmd wrangler ...`; login con `--device` si el callback falla. |
| Node | Solo para `node --check` y herramientas de desarrollo; el sitio no lo necesita. |
| Python | No disponible en el entorno actual (evitar `python -m http.server`). |
| git | Las credenciales viejas pueden dar `403`; ver CONTRIBUTING.md/seguridad. |

## 9. Rollback

- **Sitio**: en Cloudflare (Workers & Pages → `noxis-hub-app` → Deployments) se puede re-desplegar una versión anterior; o `git revert` + push.
- **Worker**: `wrangler versions` / `wrangler rollback` (Cloudflare guarda versiones del Worker).
- **KV**: los datos de interacciones no se borran al re-desplegar el sitio.

## 10. Checklist antes de publicar

- [ ] `node --check` en los JS tocados (incluido `js/analytics.js` si aplica).
- [ ] Si cambió CSS/JS: subir `?v=N` en `index.html`.
- [ ] Si cambió el Worker: `npx.cmd wrangler deploy` desde `worker/`.
- [ ] Probar el sitio en vivo y la consola limpia.
- [ ] Documentación actualizada ([CHANGELOG.md](CHANGELOG.md), [PROJECT_STATUS.md](PROJECT_STATUS.md) si aplica).
