# Intellireading WWW

Vite + Vue 3 SPA served by Nginx. Built with `vite build`, deployed from `dist/`.

## Structure

- `index.html` — SPA entry point; mounts Vue app, loads Cloudflare Turnstile
- `src/main.js` — Vue app bootstrap, router setup
- `src/App.vue` — root component (HeaderNav, router-view, FooterSection)
- `src/views/` — route pages: `HomeView.vue`, `TermsView.vue`
- `src/components/` — shared components: `HeaderNav.vue`, `FooterSection.vue`
- `src/assets/` — global CSS: `shared.css`, `home.css`
- `src/composables/` — Vue composables (e.g. `usePyodideUpload.js`)
- `src/workers/` — Web Workers
- `package.json` — version used in footer (`v{{ version }}` via dynamic import)

## API Configuration

Managed through Vite environment variables (`.env.*` files):

- `VITE_METAGUIDE_EPUB_URL` — backend endpoint for epub conversion
- `VITE_PYODIDE_CDN_URL` — CDN URL for Pyodide (offline WASM conversion)

See `.env.example` for local defaults, `.env.production` for production.

## Development

```sh
npm install
npm run dev       # Vite dev server with HMR
```

For a production-like container:

```sh
npm run build
docker compose up --build   # serves dist/ via nginx on :8080
```

## Deployment

Releases are triggered by GitHub Releases (two CI workflows):

1. **Cloudflare Pages** — runs `vite build`, publishes `dist/` (triggers on `released`)
2. **GHCR Docker** — builds multi-arch image (linux/amd64 + arm64) from `dist/` (triggers on `published`)

Manual `workflow_dispatch` is also available for both.

Linting: `lint-super-linter.yml` (manual trigger only).

## Pages

- `/` — main landing page with epub upload form, features, FAQ
- `/terms` — Terms of Service

Both use Vue Router with `<RouterLink>` for navigation.

## Conventions

- Dark mode uses `data-theme="dark"` on `<html>`, respects `prefers-color-scheme`
- Version displayed in footer as `v{version}`, sourced from `package.json` at build time
- SPA with client-side routing (`createWebHistory`); Nginx `try_files` fallback to `index.html`
- Pyodide WebAssembly for offline epub conversion fallback
- Component-scoped and global CSS; no CSS-in-JS or preprocessors
