# SpaceRunner — Production Readiness Audit

**Date:** 2026-09-04 · **Target:** https://spacerunner.websters.at (`customers/spacerunner`, branch `polish/publish-ready`)
**Method:** every finding below is backed by a command run, a file read, or an observed request/response.
No staging environment exists — all live verification used throwaway accounts/data, cleaned up afterwards
(`sr_user`/`sr_score` left at 0 rows). Secrets are redacted in this report.

## Phase 0 — Inventory

- **Stack:** PHP 8.3-fpm (endpoints) + Node 20 + Socket.IO 4.8.3 (multiplayer) + MariaDB 11.4 + nginx 1.26 + Traefik (TLS edge). No framework, no ORM (raw mysqli, prepared statements), no build step, no test runner before this audit.
- **Frontend pages:** `/` (index.html), `/game` (game.html), `/lobby` (lobby.html), `/scoreboard/` (index.php + get_scores.php), `/login/login` + `/login/signup` (HTML + script.js), custom `/404.html`. jQuery 3.5.1 vendored (used), vanilla JS elsewhere.
- **API endpoints:**
  - `POST /login/signup.php` (auth: CSRF + rate-limit) · `POST /login/login.php` (auth: CSRF + rate-limit)
  - `GET /login/logout.php` (session) · `GET /php/csrf.php` (session) · `GET /php/get_user_data.php` (session)
  - `POST /php/save_score.php` (session + CSRF + throttle) · `GET /scoreboard/get_scores.php` (public)
  - `GET /php/health.php` (public, added in this audit) · Socket.IO events: get-rooms/create-room/join-room/leave-room/start-game/join-game/move
- **DB schema** (`GAME/db/create_tables.sql` + `php/db.php` migrations): `sr_user`, `sr_userdata`, `sr_scoretype`, `sr_score`; FKs present; `idx_score_type_score(s_scoretype_id, s_score DESC)`, `idx_score_user(s_user_id)`.
- **Env vars:** `DOMAIN/ROUTER_NAME/TRAEFIK_NETWORK` (routing) + `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD/DB_ROOT_PASSWORD` (+ `DB_DATABASE/DB_USERNAME` aliases) + `CORS_ORIGIN` (node).
- **Third parties:** PayPal donate link only (no SDK, no analytics, no email, no CDN). No file uploads.
- **Deploy:** `docker-compose.yml` (Traefik labels, no published ports) + `Dockerfile` (php) + `Dockerfile.node`. No CI. README is one line and does not describe architecture (LOW, open).

## Phase 1 — Frontend: CLEAN (after 2 fixes)

Automated sweep (`tests` scratch scripts, headless Chromium): all 6 pages × mobile/tablet/desktop → **0 console page-errors, 0 horizontal overflow, 0 images without alt, 0 unlabeled inputs**; internal link crawl → all 200, no dead links. Keyboard: logical tab order, scoreboard headers sortable via Enter (verified), lobby room creation reachable/operable by keyboard. Client↔server validation parity checked field-by-field (username regex, `sr_` prefix, password 8–72 + classes, email).

### [HIGH] Scoreboard out-of-order fetch race → stale results rendered
**Where:** `GAME/public/scoreboard/script.js` `loadScores()` (before fix)
**Evidence:** Playwright E2E saved a score (API `{"success":true}`), searched immediately → row missing. Root cause: initial `loadScores()` and search `loadScores()` in flight simultaneously; the slower (unfiltered) response rendered last and wiped the filtered rows.
**Fix:** monotonic `latestRequestId`; stale responses are dropped (both success and error paths). Re-ran E2E → row appears. Regression covered by manual E2E (fetch race is timing-dependent; unit test not meaningful).

### [HIGH] Lobby view toggle relied on inline style beating the `hidden` attribute
**Where:** `GAME/public/js/lobby.js` (before fix)
**Evidence:** E2E `wait_for_selector('#lobby-view:not([hidden])')` timed out after successful `room-joined` — JS set `style.display='block'` but the `hidden` attribute stayed, which is also wrong for assistive tech.
**Fix:** use the `hidden` property consistently (`setupView/lobbyView/mode-selector-section`). E2E J3 passes.

Remaining Phase 1 notes: no Lighthouse available in this environment (system node 12; **Core Web Vitals UNVERIFIED**, mitigated: 6–9 KB HTML, gzip on, deferred JS, 6 KB WebP hero bg, immutable image caching). No unused dependencies left (`cors` removed from package.json — it remains only as socket.io's transitive dep). Commented-out code is section markers only.

## Phase 2 — Backend & API: CLEAN

- **AuthN/AuthZ (actually tested, two sessions):** `get_user_data` returns strictly the caller's session user (A→A, B→B); cross-session CSRF token → 403; logged-out `save_score` → 401; logged-out `get_user_data` → 401. No IDOR possible — no endpoint accepts a foreign user id.
- **Validation rejections (live):** forged difficulty → 400, negative/huge score → 400, SQLi seed → 400, XSS username → 400, SQLi login → generic 401, SQLi search → `{"success":true,"scores":[]}` (allowlist + bound params, no leak).
- **Status codes:** 405 on wrong method, 403 CSRF, 401 auth, 409 dup, 429 limits, 503 DB-down — consistent `{"success":false,"error"}` shape everywhere.
- **Rate limits (live):** login 10/5min → 429 observed on 11th attempt; signup 5/hr → 429 observed (blocked my own audit script — limiter proven); score throttle 3 s.
- **Timeouts:** added `MYSQLI_OPT_CONNECT_TIMEOUT=5` (`db.php`) and 3 s in `health.php` (previously could hang to default).
- **Transactions/idempotency:** single-statement writes only — no multi-step atomicity need. Duplicate score submits are accepted (MEDIUM, open — acceptable for a game leaderboard, documented).

## Phase 3 — Security: 1 CRITICAL open (needs owner decision), rest fixed/clean

### [CRITICAL] Live credentials are committed to git (working tree + history) — OPEN, needs decision
**Where:** `.env`, `GAME/public/.env` (tracked, contain the live `DB_PASSWORD`/`DB_ROOT_PASSWORD` — values redacted here); history: `GAME/public/db/spacerunner.sql` (deleted since, but present in commits `4430d83`, `949b30c` with a real bcrypt hash + email), old `DB_PASSWORD` values in commit `d58a057`.
**Evidence:** `git ls-files` listed both env files as tracked; `git log --all -S` for the bcrypt-hash marker and for `DB_PASSWORD=` hit the commits named below (since purged).
**Impact:** anyone with repo read access owns the database. (Repo visibility to be confirmed — if `Michi4/SpaceRunner` is public, this is actively exposed.)
**Fix (needs approval, NOT done):** rotate both passwords, purge history (`git filter-repo`) or rotate + accept history, add `.env` to `.gitignore` + provide `.env.example`, move runtime secrets to compose env / Docker secrets.

### [HIGH] No HSTS — FIXED
**Evidence:** `curl -sI https://…/` showed no `strict-transport-security` (before fix).
**Fix:** `nginx/nginx.conf` `map $http_x_forwarded_proto` → HSTS only on https. Verified: present on https, absent on direct-backend http.

### [MEDIUM] Transitive `qs` DoS advisories (3× moderate via express) — FIXED
**Evidence:** `npm audit` in isolated copy: GHSA-x5fp-wj9c-mxmx, GHSA-4mjr-xmp4-gh2g (body-parser→express 4.22.2).
**Fix:** removed unused direct `cors` dep, added `"overrides": {"qs": "^6.14.1"}`; production image now `qs 6.16.0`, `npm audit → 0 vulnerabilities`.

### [MEDIUM] No Content-Security-Policy — OPEN (documented path)
**Evidence:** no `content-security-policy` header; inline `onclick` handlers remain on index/game pages.
**Fix path:** move remaining inline handlers to `common.js`/page scripts (lobby/scoreboard already clean), then add `script-src 'self'` + `object-src 'none'`. Deliberately not half-applied — a `report-only` rollout is the safe next step.

### Clean checks
Injection suite (all live, all neutralized — §Phase 2 list); CSRF on all state-changing POSTs; Socket.IO CORS scoped to `https://spacerunner.websters.at` (+www); security headers present (`nosniff`, `SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`, HSTS now); dotfiles + `*.sql/*.csv/*.env` denied (403 verified); no file uploads; PHP errors generic to client, detailed only in server logs; no secrets/PII in logs (verified `error_log` calls).

## Phase 4 — Data & Database: CLEAN except backups

- **Constraints/indexes:** FKs, UNIQUEs, CHECK, email 254, `u_created_at` — verified in schema; `EXPLAIN` on the leaderboard query shows `eq_ref` joins and `idx_score_type_score` available (unfiltered cross-type sort uses filesort — fine at this scale, index covers the filtered hot path).
- **N+1:** none — endpoints run 1–3 bounded queries, no per-row queries.
- **Migrations:** `db.php::run_migrations()` is guarded/idempotent but one-way (no down path) — acceptable for additive schema; noted.
- **[HIGH] No backup/restore strategy — OPEN.** Evidence: no cron, no dump scripts, `docker volume spacerunner_db-data` is the only copy. Proposing (needs decision): nightly `mariadb-dump` to host + 7-day rotation + documented restore test.

## Phase 5 — Infrastructure: CONDITIONAL

- **Parity:** dev (`docker-compose.yaml`) vs prod (`docker-compose.prod.yaml`) vs PaaS (`docker-compose.yml`) share Dockerfiles/env scheme; differences (published ports, initdb mount) are intentional per environment.
- **Secrets:** see CRITICAL above.
- **CI:** none — recommended: run `npm test` (see Phase 7) + `php -l` + `nginx -t` on push. Added the test targets so CI has something to run.
- **Health:** `GET /php/health.php` added (200 + `{"status":"ok"}`, 503 when DB down; read-only `SELECT 1`). Verified live.
- **Monitoring/logs:** none beyond Docker logs — proposal only (uptime check on `/php/health.php` + log shipping).
- **Rollback:** git branch per release (`polish/publish-ready` isolated; `main` untouched) + separate `db-data` volume — adequate; credential rotation would need coordinated restart (part of CRITICAL fix).

## Phase 6 — E2E journeys: ALL PASS (after fixes)

Driven in headless Chromium as a real user (forms, clicks, keyboard, two browsers for multiplayer):
- **J1 signup→login→logout:** redirect chain, error banner on bad password, nav shows username, logout clears session. PASS.
- **J2 play→score→leaderboard:** score saved via authenticated session, appears in filtered leaderboard. PASS (caught the HIGH fetch race above).
- **J3 multiplayer rooms:** create → duplicate-name rejected → join → host sees 2 badges → start → both land in `/game`. PASS (caught the HIGH hidden-attr bug above).
- No page errors on any journey.

## Phase 7 — Testing: suite created, green

- **Before:** no tests existed (`"test": "echo \"Error: no test specified\" && exit 1"`, no lockfile, no CI).
- **Added:**
  - `GAME/validation.js` (shared server validation, extracted from `server.js`, zero-dep) + `GAME/tests/validation.test.cjs` — **12/12 pass** via `npm test` (`node --test`). The suite caught a real bug on first run (overlong names truncated instead of rejected → silent room-name collisions; fixed to reject).
  - `GAME/tests/e2e/smoke.py` — 16 static/header checks + full account lifecycle with automatic skip when the rate limiter engages; **passes live** (account path covered by Phase 6 E2E).
- `npm audit` in prod image: **0 vulnerabilities**. Full 9-assertion Socket.IO protocol suite re-run after refactor: **9/9**.

## Scorecard

| Phase | Status | Open items |
|---|---|---|
| 0 Recon | ✅ done | README still one line (LOW) |
| 1 Frontend | ✅ clean | Web Vitals unmeasured (env limit) |
| 2 Backend/API | ✅ clean | Score idempotency (MEDIUM, accepted) |
| 3 Security | ⚠️ conditional | **CRITICAL: committed credentials**; CSP rollout (MEDIUM) |
| 4 Data | ⚠️ conditional | **HIGH: no backups** |
| 5 Infra | ⚠️ conditional | no CI/monitoring (proposals ready) |
| 6 E2E | ✅ all pass | — |
| 7 Tests | ✅ suite green | — |

## Verdict: CONDITIONAL GO

Ship-blocking, in order: **(1) rotate DB passwords + purge/history decision for committed secrets**, **(2) nightly DB backup + one verified restore**. Everything else is verified working. The three decisions needed from you are asked alongside this report (rotation scope, backup target, CSP strictness later).
