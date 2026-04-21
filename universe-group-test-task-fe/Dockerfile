# syntax=docker/dockerfile:1.7
#
# Frontend image — two targets:
#
#   --target prod  → Next standalone build, minimal runtime
#   --target dev   → `next dev` with bind-mounted source for HMR
#
# `NEXT_PUBLIC_API_URL` must be provided at BUILD time because Next.js
# inlines public env vars into the client bundle. `INTERNAL_API_URL` is
# read at runtime — it can change per environment without a rebuild.

# ─── Base ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

# ─── Install deps ────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ─── Build the Next app ──────────────────────────────────────────────────────
FROM deps AS builder
# NEXT_PUBLIC_* must be present at build time; anything else is read at runtime.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG NEXT_PUBLIC_NOTIFICATIONS_API_URL
ENV NEXT_PUBLIC_NOTIFICATIONS_API_URL=${NEXT_PUBLIC_NOTIFICATIONS_API_URL}
COPY tsconfig.json next.config.ts postcss.config.mjs components.json eslint.config.mjs ./
COPY public ./public
COPY src ./src
RUN npm run build

# ─── Production runtime ──────────────────────────────────────────────────────
# Copies only the files Next emits in `standalone` mode — a tiny Node server
# plus a pruned node_modules. Final image is ~150MB vs ~1GB with full deps.
FROM base AS prod
ENV NODE_ENV=production
ENV PORT=3000
# Bind to all interfaces so the published port is reachable on LAN IPs,
# not just 127.0.0.1 inside the container.
ENV HOSTNAME=0.0.0.0
# Next's standalone output writes server.js at the root, and keeps static
# assets in two places we need to copy by hand (https://nextjs.org/docs/app/api-reference/config/next-config-js/output#automatically-copying-traced-files).
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]

# ─── Dev runtime ─────────────────────────────────────────────────────────────
# Source is bind-mounted by compose; this image just ships the dependencies
# and runs `next dev`. Turbopack's HMR websocket works over the published
# port because we bind to 0.0.0.0.
FROM deps AS dev
ENV NODE_ENV=development
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["npm", "run", "dev"]
