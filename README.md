# Bitartes Microfrontends Workspace (Next.js Multi‑Zones)

A practical multi‑zone setup using Next.js App Router and Vercel Microfrontends, tailored for running locally, in Docker, and in Kubernetes. The workspace contains three independently built apps composed behind a single origin.

- Apps: `home` (shell), `docs` (/docs), `tictactoe` (/tictactoe)
- Single origin gateway: path‑based routing and asset‑prefix rewrites
- Shared tooling: TypeScript configs, ESLint rules, Tailwind theme

## Project Structure
```
apps/
  home/         # Shell app + microfrontends.json
  docs/         # Docs zone
  tictactoe/    # Game zone
nginx/default.conf  # Gateway rules (paths + asset prefix rewrites)
docs/AGENT_ADD_APP.md
docs/cloud-config.md
```

## Prerequisites
- Node.js 20+
- pnpm 9.4+
- Docker (for production builds)

## Local Development
```bash
pnpm install
pnpm dev
```
- Dev proxy: `http://localhost:3024`
- Routes: `/` (home), `/docs`, `/tictactoe`
- Cross‑zone links: use `@vercel/microfrontends/next/client` `Link`

## Production with Docker Compose
```bash
docker compose -f docker-compose.prod.yml up --build -d
# stop
docker compose -f docker-compose.prod.yml down
# restart
docker compose -f docker-compose.prod.yml up -d
```
- Gateway: `http://localhost:3000` (Nginx)
- Docs also exposed on `http://localhost:3001` (direct)
- Nginx mirrors `nginx/default.conf`:
  - `/docs` → `docs:3000` (no rewrite)
  - `/tictactoe` → `tictactoe:3000` (no rewrite)
  - `/` → `home:3000`
  - `/vc-ap-bitartes-<app>/*` → rewrite to `/<asset>` for static files

## Kubernetes on AWS (EKS)
See `docs/cloud-config.md` for:
- Per‑app Deployments + Services
- Nginx Ingress with path routing and regex rewrites for asset prefixes
- TLS and domain setup
- Notes on using ALB vs Nginx Ingress

## Adding a New App
1) Scaffold under `apps/<slug>` (use `templates/mfe-app` as reference)
2) Register routes in `apps/home/microfrontends.json`
3) Update `nginx/default.conf` and `docker-compose.prod.yml` for production routing
4) Build locally and verify via dev proxy and gateway

## Notes
- Next.js `output: 'standalone'` is enabled for each app
- Vercel Toolbar can be gated/disabled in production
- Asset‑prefix rewrites (`/vc-ap-bitartes-<app>`) are essential for static assets
- Keep apps on the same origin for seamless cross‑zone prefetch
