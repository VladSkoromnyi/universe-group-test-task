# Universe Group — Products & Notifications

Test task: microservices for product management with notifications via a message broker.

## Features

- **Backend** (NestJS monorepo, TypeScript):
  - `Products` — HTTP API: create / delete / paginated list. Publishes events to RabbitMQ
  - `Notifications` — RMQ consumer, logs events
  - PostgreSQL + Drizzle ORM (migrations)
  - Multi-env config (dev/stage/prod) with Joi validation
- **Frontend** (Next.js + shadcn/ui): paginated product catalogue with
  grid / list views, create and delete dialogs, dark theme (default) with
  Light / Dark / System toggle, SSR prefetch + TanStack Query hydration,
  URL-driven state (`?page`, `?view`), error & 404 boundaries

## Layout

```
.
├── universe-group-test-task-be/    # Backend (NestJS)
└── universe-group-test-task-fe/    # Frontend (Next.js)
```

## Quick start — full Docker stack (recommended)

One command brings up everything: Postgres, RabbitMQ, both backends, and
the frontend.

```bash
cp .env.docker.example .env
docker compose up --build           # production images, no hot reload
# or
docker compose -f docker-compose.dev.yml up --build   # dev, with hot reload
```

Then open:

| URL | Service |
|---|---|
| http://localhost:3000 | Frontend (Next.js) |
| http://localhost:3001/products | Products API |
| http://localhost:15672 | RabbitMQ management (guest / guest) |

The ports bind on `0.0.0.0`, so the same URLs work from other devices on
the LAN via your machine's IP.

The prod and dev stacks have independent database volumes
(`postgres-prod-data` vs `postgres-dev-data`) — data from one won't leak
into the other.

## Quick start — native (no containers for the apps)

Run just the infra (Postgres + RabbitMQ) in Docker, the Nest apps and
Next dev server on the host:

```bash
# Backend
cd universe-group-test-task-be
npm install
cp .env.example .env.development
npm run docker:up          # postgres + rabbitmq via docker-compose.infra.yml
npm run db:migrate
# Two terminals:
npm run start:products         # :3001
npm run start:notifications

# Frontend (in a third terminal)
cd ../universe-group-test-task-fe
npm install
npm run dev                    # :3000
```

Details → [backend README](./universe-group-test-task-be/README.md) ·
[frontend README](./universe-group-test-task-fe/README.md)

## Tech stack

| Layer | Tech |
|---|---|
| Backend | NestJS 10, TypeScript 5, PostgreSQL 16, RabbitMQ 3, Drizzle ORM, Joi |
| Frontend | Next.js, React, shadcn/ui, TanStack Query, react-hook-form + zod |
| Infra | Docker Compose — `docker-compose.yml` (prod), `docker-compose.dev.yml` (dev, hot reload), `universe-group-test-task-be/docker-compose.infra.yml` (infra-only) |

## Git flow

- `prod`   — production (deployable)
- `stage`  — post-acceptance testing
- `develop` — active development (integration)
- `dev/<feature-name>` — feature branches, merged into `develop` via `merge --no-ff`

Flow: `dev/feature` → `develop` → `stage` → `prod`.
