# syntax=docker/dockerfile:1.6

# --- deps ---
FROM node:20-bullseye-slim AS deps
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Workspace manifests for better caching
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/home/package.json apps/home/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY packages/eslint-config-custom/package.json packages/eslint-config-custom/package.json
COPY packages/ts-config/package.json packages/ts-config/package.json

# Also copy the new app’s package manifest
COPY apps/tictactoe/package.json apps/tictactoe/package.json

RUN corepack enable && corepack prepare pnpm@9.4.0 --activate
RUN pnpm install --no-frozen-lockfile --config.dedupe-peer-dependents=false

# --- builder ---
FROM node:20-bullseye-slim AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Bring in the full workspace and installed deps
COPY . .
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps/tictactoe/node_modules /app/apps/tictactoe/node_modules
COPY --from=deps /app/packages/ts-config/node_modules /app/packages/ts-config/node_modules

# Build only the target app
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate
RUN pnpm -F bitartes-tictactoe build

# --- runner ---
FROM node:20-bullseye-slim AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Copy the app’s standalone build output
COPY --from=builder /app/apps/tictactoe/.next/standalone .
COPY --from=builder /app/apps/tictactoe/.next/static ./apps/tictactoe/.next/static
COPY --from=builder /app/apps/tictactoe/public ./apps/tictactoe/public

EXPOSE 3000
CMD ["node", "apps/tictactoe/server.js"]