# syntax=docker/dockerfile:1.7
#
# Backend image — single Dockerfile, three build targets:
#
#   --target prod     → production bundle, `node dist/apps/$APP/main.js`
#   --target migrate  → one-shot migrator, `npm run db:migrate`
#   --target dev      → hot-reload dev mode, `nest start $APP --watch`
#
# The `APP` build arg picks which nest app starts in the `prod` target
# (products or notifications). Both apps share the same image — only the
# entrypoint differs.

# ─── Base ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
# Tini reaps zombie processes and forwards SIGTERM correctly, so
# `docker compose stop` actually stops node instead of timing out.
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

# ─── Install full deps (incl. dev) — cached layer ────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ─── Build the monorepo (webpack bundle per app) ─────────────────────────────
FROM deps AS builder
COPY tsconfig.json nest-cli.json webpack.config.js ./
COPY apps ./apps
COPY libs ./libs
RUN npm run build

# ─── Production runtime — slim image, prod deps only ─────────────────────────
FROM base AS prod
ENV NODE_ENV=production
# Install only production deps in the final image. We could reuse the deps
# layer but that drags dev deps along; this keeps the image small.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
# Copy the compiled bundle
COPY --from=builder /app/dist ./dist
# ARG chooses which app the container runs. Default is products; override
# via `--build-arg APP=notifications` (or in docker-compose `build.args`).
ARG APP=products
ENV APP=${APP}
# Products exposes an HTTP port; notifications is RMQ-only (port is ignored
# there). EXPOSE is advisory, it doesn't publish anything by itself.
EXPOSE 3001
CMD ["sh", "-c", "node dist/apps/$APP/main.js"]

# ─── Migration runner — one-shot, runs then exits ────────────────────────────
# Keeps ts-node available (we don't want to precompile the script and maintain
# a separate build target for a tiny migrator). The `deps` layer already has
# everything we need.
FROM deps AS migrate
COPY tsconfig.json ./
COPY libs ./libs
COPY scripts ./scripts
CMD ["npm", "run", "db:migrate"]

# ─── Dev runtime — hot reload via bind-mounted source ────────────────────────
# Image contains only the dependencies; source comes in via compose bind mount
# so edits on the host trigger `nest start --watch` inside the container.
FROM deps AS dev
ENV NODE_ENV=development
ARG APP=products
ENV APP=${APP}
EXPOSE 3001
# Use the existing start:products / start:notifications scripts (they pass
# --watch). Resolved at runtime so the same image serves either app.
CMD ["sh", "-c", "npm run start:$APP"]
