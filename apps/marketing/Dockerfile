# syntax=docker/dockerfile:1.6

# --- deps ---
FROM node:20-bullseye-slim AS deps
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/marketing/package.json apps/marketing/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY packages/eslint-config-custom/package.json packages/eslint-config-custom/package.json
COPY packages/ts-config/package.json packages/ts-config/package.json
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate
RUN pnpm install --no-frozen-lockfile --config.dedupe-peer-dependents=false

# --- builder ---
FROM node:20-bullseye-slim AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate
# Reuse workspace dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/marketing/node_modules ./apps/marketing/node_modules
COPY --from=deps /app/packages/ts-config/node_modules ./packages/ts-config/node_modules
RUN pnpm -F microfrontends-marketing build

# --- runner ---
FROM node:20-bullseye-slim AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
# Copy standalone build output and public assets
COPY --from=builder /app/apps/marketing/.next/standalone ./
COPY --from=builder /app/apps/marketing/.next/static ./apps/marketing/.next/static
COPY --from=builder /app/apps/marketing/public ./apps/marketing/public
EXPOSE 3000
CMD ["node", "apps/marketing/server.js"]