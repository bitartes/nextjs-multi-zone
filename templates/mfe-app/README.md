# Template: Microfrontend App (__APP_SLUG__)

Placeholders to replace after copying this folder into `apps/__APP_SLUG__`:
- `__APP_SLUG__` → your zone slug (folder name)
- `__PKG_NAME__` → workspace package name (e.g., `bitartes-__APP_SLUG__`)
- `__ROUTE__` → the route base (usually same as slug)

Files:
- `package.json` — deps and scripts; set `name` to `__PKG_NAME__`
- `next.config.ts` — enables microfrontends + standalone output
- `Dockerfile` — production multi-stage build, runs standalone `next start`
- `app/layout.tsx` — registers cross-zone prefetch
- `app/__ROUTE__/page.tsx` — the zone root page
- `tsconfig.json` — shared TS config reference

After copying:
1. Update `apps/home/microfrontends.json` with the new app entry and routing group.
2. Add a service in `docker-compose.prod.yml` for the app.
3. Update `nginx/default.conf` to proxy `/<route>` and `/vc-ap-<pkg-name>` to the new service.
4. Build and run locally: `docker compose -f docker-compose.prod.yml up -d --build`.