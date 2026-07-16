# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN apk add --no-cache ffmpeg
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# ── Dependencies ──────────────────────────────────────────────────────
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

# ── Build ───────────────────────────────────────────────────────────
FROM deps AS builder
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @ugc-studio/shared build
RUN pnpm --filter @ugc-studio/api build
RUN mkdir -p apps/api/dist/src/db && cp -r apps/api/src/db/migrations apps/api/dist/src/db/migrations

# ── Production image ────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY apps/api/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

WORKDIR /app/apps/api
EXPOSE 4000
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
