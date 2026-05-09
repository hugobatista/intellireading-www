# Vite + Vue Migration Plan

> Migrate `src/` from static HTML/JS to a Vite + Vue architecture.

## Goal

Preserve all existing UX, Pyodide worker logic, config, dev/prod API behaviour, and deployment targets (Cloudflare Pages + Docker/GHCR) while modernising the project structure.

---

## Phase 0 — Discovery & Prep

**Inventory the current site:**
| Category | Files |
|-|-|
| Pages | `src/index.html`, `src/terms.html` |
| Shared UI | `shared.js` (injects header/footer via placeholders) |
| JS modules | `index.js`, `pyodide-client.js`, `pyodide-worker.js`, `shared.js` |
| Config | `src/js/config.js` (globals), `config/dev/config.js` (dev override) |
| CSS | `src/css/shared.css` + inline `<style>` blocks in `index.html` |
| Assets | `src/img/`, `site.webmanifest`, favicons |
| Service worker | `src/sw.js` |

**Key dependencies:**
- Pyodide CDN URL (loaded in worker via `importScripts`)
- Cloudflare Turnstile script
- Service worker registration
- Global variables (`metaguideEpubUrl`, `pyodideCdnUrl`)

**Output:**
- Vite builds to `dist/`
- Cloudflare Pages publishes `dist/` (instead of `src/`)

---

## Phase 1 — Scaffold Vite + Vue

1. Create project: `npm create vite@latest -- --template vue`
2. Move static assets:
   - `src/img/*` → `public/img/`
   - `src/site.webmanifest` → `public/site.webmanifest`
   - Favicons → `public/`
3. Vite `index.html` → root `<div id="app"></div>` (replaces current `src/index.html`)
4. Remove `src/js/config.js` — migrate to Vite env variables (see Phase 4)

---

## Phase 2 — Vue Router & Layout

1. Install `vue-router@4`
2. Routes:
   - `/` → `HomeView.vue`
   - `/terms` → `TermsView.vue`
3. Build components:
   - `App.vue` — layout wrapper (Header + `<router-view />` + Footer)
   - `Header.vue` — nav/logo (replaces `shared.js` header injection)
   - `Footer.vue` — footer (replaces `shared.js` footer injection)
4. Global CSS: import `src/css/shared.css` in `main.js`

---

## Phase 3 — Migrate Page Content

**Home page (`HomeView.vue`)**
- Convert body of `index.html` into Vue template
- Move large inline `<style>` block into:
  - `src/assets/home.css` (global import) or `<style scoped>`
- Keep section IDs (`#upload`, `#features`, etc.) for anchor scroll

**Terms page (`TermsView.vue`)**
- Convert `terms.html` static content into Vue template
- Move any page-specific style into `<style scoped>`

---

## Phase 4 — Migrate JS Functionality

**Upload + Pyodide logic**
- Extract `index.js` + `pyodide-client.js` into Vue composable:
  - `src/composables/usePyodideUpload.js`
- Use Vue lifecycle:
  - `onMounted()` for DOM-ready setup
  - `ref()` for element references instead of `document.getElementById`
  - `watch()` / custom events for UI state

**Worker**
- Keep `pyodide-worker.js` in `src/workers/`
- Use Vite worker import:
  ```js
  new Worker(new URL('../workers/pyodide-worker.js', import.meta.url))
  ```
- `importScripts` works in classic Vite workers — no change needed there

**Config**
- Replace global `config.js` with Vite env:
  - `.env`: `VITE_METAGUIDE_EPUB_URL=...`
  - `.env.prod`: production values
- Replace reads of `metaguideEpubUrl` / `pyodideCdnUrl` with `import.meta.env.VITE_...`
- Keep CDN allowlist in worker code (already implemented)

**Turnstile**
- Inject `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js">` in Vite `index.html`
- Or use a Vue head manager (`@vueuse/head`)

**Service worker**
- Move `src/sw.js` → `public/sw.js`
- Registration code stays in main entry (points to `/sw.js`)

---

## Phase 5 — Build & Deploy

**Dev workflow:**
- `npm run dev` — Vite dev server
- Optionally keep `docker compose up` for prod-like local testing

**Cloudflare Pages:**
- Build command: `npm run build` (outputs `dist/`)
- Publish directory: `dist`

**Docker / GHCR:**
- Nginx serves `dist/` instead of `src/`
- Update Dockerfile COPY path: `COPY dist /usr/share/nginx/html`
- Update docker-compose config mounts if applicable

---

## Phase 6 — QA & Regression

- [x] Local Pyodide flow: worker loads, CDN allowlist passes, processing works
- [x] Fallback path: unsupported browser → legacy server mode
- [x] Upload flow: drag/drop, file selection, progress bar, error messages
- [x] Dark mode: `data-theme="dark"` + `prefers-color-scheme`
- [x] SEO: meta tags preserved, OG images, `site.webmanifest`
- [x] Service worker registers correctly

---

## Additional Considerations

- [ ] migrate to typescript
- [ ] modularise CSS into component styles
