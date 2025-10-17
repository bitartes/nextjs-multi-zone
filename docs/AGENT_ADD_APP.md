# Agent Playbook: Add a New Microfrontend App

This repository defines a microfrontend architecture (multi-zone) with a Home shell (`apps/home`) and individual apps routed under path groups (e.g., `/docs`). Use this playbook to add a new app that integrates cleanly with:
- `apps/home/microfrontends.json`
- Production `docker-compose.prod.yml`
- Nginx gateway routing
- A standalone Next.js app with its own Dockerfile

## Conventions
- **App directory**: `apps/<app-slug>` (e.g., `apps/blog`)
- **Package name**: `bitartes-<app-slug>` (e.g., `bitartes-blog`)
- **Route base**: `/<app-slug>` (e.g., `/blog`)
- **Dev port**: pick an unused port (e.g., `3002`)
- **Asset prefix**: generated under `vc-ap-<package-name>` (e.g., `/vc-ap-bitartes-blog/…`)
- **Theme**: minimalist futuristic, shared palette and font across apps

## Steps

### 1) Scaffold the app from template
- Copy the folder `templates/mfe-app` to `apps/<app-slug>`.
- Replace placeholders in the copied files:
  - `__APP_SLUG__` → `<app-slug>`
  - `__PKG_NAME__` → `bitartes-<app-slug>`
  - `__ROUTE__` → `<app-slug>`
- Ensure `apps/<app-slug>/package.json` has the correct `name` and scripts.
- Apply the shared theme (font + palette):
  - In `app/layout.tsx`, use `Space_Grotesk` from `next/font/google` and set `body` to `spaceGrotesk.className`.
  - Create or update `app/globals.css` with the shared palette tokens (copy from `apps/home/app/globals.css`).
  - Verify `tailwind.config.js` uses CSS variables (already configured in template).

### 2) Register the app in Home routing
- Edit `apps/home/microfrontends.json` and add a new entry:
  ```jsonc
  {
    "applications": {
      "bitartes-home": { "development": { "local": 3000 } },
      "bitartes-docs": { /* existing */ },
      "bitartes-<app-slug>": {
        "development": { "local": 3002 },
        "routing": [
          { "group": "<app-slug>", "paths": ["/<app-slug>", "/<app-slug>/:path*"] }
        ]
      }
    }
  }
  ```
- Notes:
  - `development.local` must match the dev port you’ll use locally.
  - `paths` defines the zone’s public routes. Adjust the prefix if you need something other than `/<app-slug>`.

### 3) Add to production compose
- Edit `docker-compose.prod.yml` and append a new service (do not expose a host port; the gateway proxies traffic):
  ```yaml
  services:
    <app-slug>:
      build:
        context: .
        dockerfile: apps/<app-slug>/Dockerfile
      environment:
        - NODE_ENV=production
      depends_on:
        - home
  ```
- Keep `gateway` and `home` unchanged.

### 4) Update Nginx gateway for routing
- Edit `nginx/default.conf` and add:
  ```nginx
  # Route /<app-slug> unchanged to the new app
  location = /<app-slug> { proxy_pass http://<app-slug>:3000; }
  location /<app-slug>/ { proxy_pass http://<app-slug>:3000; }

  # Route static assets under the app’s asset prefix
  # Prefix is /vc-ap-<package-name>
  location = /vc-ap-bitartes-<app-slug> { proxy_pass http://<app-slug>:3000/; }
  location /vc-ap-bitartes-<app-slug>/ {
    rewrite ^/vc-ap-bitartes-<app-slug>/(.*)$ /$1 break;
    proxy_pass http://<app-slug>:3000;
  }
  ```
- Reason: Next.js static chunks for each microfrontend are served under its asset prefix. The gateway must pass them to the correct service.

### 5) Build and verify locally (production-style)
```bash
# Rebuild and relaunch
docker compose -f docker-compose.prod.yml up -d --build

# Test in browser
open http://localhost:3000/<app-slug>
```
- Expected: Page renders from the new app and its chunks load under `/vc-ap-bitartes-<app-slug>/_next/...`.

## Template Files Overview (copied from templates/mfe-app)
- `Dockerfile`: multi-stage build producing a minimal image that runs `next start` via standalone output.
- `next.config.ts`: enables microfrontends and standalone output.
- `app/layout.tsx`: registers `PrefetchCrossZoneLinksProvider` and uses the shared theme font (`Space Grotesk`).
- `app/__ROUTE__/page.tsx`: the zone’s root page.
- `app/globals.css`: theme tokens for the minimalist futuristic palette.
- `package.json`: includes Next 15, `@vercel/microfrontends`, and scripts.
- `tsconfig.json`: uses shared workspace config.

## Example
Add a new `blog` app:
- App dir: `apps/blog` from template
- Package name: `bitartes-blog`
- Route base: `/blog`
- Dev port: `3002`
- `apps/home/microfrontends.json` entry:
  ```jsonc
  "bitartes-blog": { "development": { "local": 3002 }, "routing": [{ "group": "blog", "paths": ["/blog", "/blog/:path*"] }] }
  ```
- Compose service:
  ```yaml
  blog:
    build:
      context: .
      dockerfile: apps/blog/Dockerfile
    environment:
      - NODE_ENV=production
    depends_on:
      - home
  ```
- Nginx blocks:
  ```nginx
  location = /blog { proxy_pass http://blog:3000; }
  location /blog/ { proxy_pass http://blog:3000; }
  location = /vc-ap-bitartes-blog { proxy_pass http://blog:3000/; }
  location /vc-ap-bitartes-blog/ { rewrite ^/vc-ap-bitartes-blog/(.*)$ /$1 break; proxy_pass http://blog:3000; }
  ```

## Notes
- Disable or ignore `/_vercel/*` scripts locally; they’re optional.
- Keep `output: 'standalone'` to produce slim images and run `next start`.
- Each app is its own Docker image; the gateway (`nginx`) is the single public entry.
- For consistency, adopt the shared theme:
  - Font: `Space Grotesk` via `next/font/google`
  - Palette: copy `app/globals.css` tokens from `apps/home` or the template
  - Card/UI accents: light glass, neon cyan ring, subtle gradient hover