# Intellireading WWW

Pure static website served by Nginx. No build step, no package manager, no tests.

## Structure

- `src/` — all website content, deployed as-is
- `src/js/config.js` — global `const` with API URLs (default: production)
- `config/dev/config.js` — dev override that mounts via docker-compose volume

## Development

```sh
docker compose up     # serves on :8080, mounts config/dev/config.js
```

To use the dev API (localhost), start with `.env` (ENVIRONMENT=dev, COMPOSE_PROFILES=dev).

For production, use `.env.prod`.

## Deployment

Releases are triggered by GitHub Releases (two CI workflows):

1. **Cloudflare Pages** — publishes `src/` directory (triggers on `released`)
2. **GHCR Docker** — builds multi-arch image (linux/amd64 + arm64, triggers on `published`)

Manual `workflow_dispatch` is also available for both.

Linting: `lint-super-linter.yml` (manual trigger only).

## API Configuration

endpoint in `config.js`:
- `metaguideEpubUrl` — main page form submits files here

The dev config points both to `http://localhost:80/...`.

## Pages

- `index.html` — main landing page; posts to `metaguideEpubUrl` via `fetch` + Cloudflare Turnstile
- `terms.html` — ToS (uses shared.js for header/footer)

## Conventions

- Dark mode uses `data-theme="dark"` on `<html>`, respects `prefers-color-scheme`
- Shared components (header/footer) injected by `shared.js` at runtime via `#header-placeholder` / `#footer-placeholder`
- No module bundler; globals and inline `<script>` tags
