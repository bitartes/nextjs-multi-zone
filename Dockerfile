# syntax=docker/dockerfile:1.6
FROM node:20-bullseye-slim

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV MFE_DEBUG=1

# Enable corepack and pin pnpm to the workspace version
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

WORKDIR /app

# Install dependencies with good cache leveraging workspace manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/marketing/package.json apps/marketing/package.json
COPY apps/docs/package.json apps/docs/package.json
COPY packages/eslint-config-custom/package.json packages/eslint-config-custom/package.json
COPY packages/ts-config/package.json packages/ts-config/package.json

RUN pnpm install --no-frozen-lockfile --config.dedupe-peer-dependents=false

# Copy the full monorepo
COPY . .

# Expose both app dev ports
EXPOSE 3000 3001

# Run both apps in dev via the root script (turbo dev)
CMD ["pnpm", "dev"]