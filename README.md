# Universe Group — Products & Notifications

Test task: microservices for product management with notifications via a message broker.

## Features

- **Backend** (NestJS monorepo, TypeScript):
  - `Products` — HTTP API: create / delete / paginated list. Publishes events to RabbitMQ
  - `Notifications` — RMQ consumer, logs events
  - PostgreSQL + Drizzle ORM (migrations)
  - Multi-env config (dev/stage/prod) with Joi validation
- **Frontend** (Next.js + shadcn/ui): product list page, create/delete dialogs

## Layout

```
.
├── universe-group-test-task-be/    # Backend (NestJS)
└── universe-group-test-task-fe/    # Frontend (Next.js)
```

## Quick start (local)

### Backend
```bash
cd universe-group-test-task-be
npm install
cp .env.example .env.development
npm run docker:up          # Postgres + RabbitMQ
npm run db:migrate

# Two terminals:
npm run start:products         # :3001
npm run start:notifications
```
Details → [universe-group-test-task-be/README.md](./universe-group-test-task-be/README.md)

### Frontend
```bash
cd universe-group-test-task-fe
npm install
npm run dev                # :3000
```
Details → [universe-group-test-task-fe/README.md](./universe-group-test-task-fe/README.md)

## Tech stack

| Layer | Tech |
|---|---|
| Backend | NestJS 10, TypeScript 5, PostgreSQL 16, RabbitMQ 3, Drizzle ORM, Joi |
| Frontend | Next.js, React, shadcn/ui, TanStack Query, react-hook-form + zod |
| Infra | Docker Compose (local) |

## Git flow

- `prod`   — production (deployable)
- `stage`  — post-acceptance testing
- `develop` — active development (integration)
- `dev/<feature-name>` — feature branches, merged into `develop` via `merge --no-ff`

Flow: `dev/feature` → `develop` → `stage` → `prod`.
