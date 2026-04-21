# Backend — Products & Notifications

Two NestJS microservices communicating via RabbitMQ:
- **Products** — HTTP API (CRUD + pagination), publishes events to the broker
- **Notifications** — RMQ consumer, logs incoming events

## Stack

- **Node.js 18+**, **TypeScript 5**, **NestJS 10**
- **PostgreSQL 16** + **Drizzle ORM** (migrations via `drizzle-kit`)
- **RabbitMQ 3** (amqplib + `@nestjs/microservices`)
- **Joi** — env variable validation
- **class-validator** — DTO validation

## Architecture

```
┌─────────────────┐         HTTP           ┌──────────────────┐
│   Client (FE)   │ ───────────────────►   │   Products API   │
└─────────────────┘                        │      :3001       │
                                           └────────┬─────────┘
                                                    │ emit(event, payload)
                                                    ▼
                                           ┌──────────────────┐
                                           │  RabbitMQ queue  │
                                           │ "products_queue" │
                                           └────────┬─────────┘
                                                    │ consume + ack
                                                    ▼
                                           ┌──────────────────┐
                                           │  Notifications   │
                                           │  (microservice)  │
                                           └──────────────────┘
```

Events:
- `product.created` — after a successful INSERT
- `product.deleted` — after a successful DELETE

## Project layout

```
universe-group-test-task-be/
├── apps/
│   ├── products/               # HTTP API
│   │   └── src/
│   │       ├── common/         # exception filter
│   │       ├── dto/            # class-validator DTOs
│   │       ├── products.{controller,service,module}.ts
│   │       └── main.ts
│   └── notifications/          # RMQ microservice
│       └── src/
│           ├── notifications.{controller,service,module}.ts
│           └── main.ts
├── libs/
│   ├── config/                 # AppConfigModule (Joi validation)
│   ├── database/               # Drizzle client + schema + migrations
│   │   ├── src/
│   │   └── migrations/         # generated SQL + drizzle meta
│   └── rabbitmq/               # shared RMQ client + constants
├── scripts/
│   └── migrate.ts              # DB migration runner (waits for DB readiness)
├── Dockerfile                  # Prod / migrate / dev build targets
├── docker-compose.infra.yml    # Postgres + RabbitMQ for native-host dev
├── drizzle.config.ts
├── nest-cli.json               # monorepo (2 apps + 3 libs)
└── package.json
```

## Environment variables

Loading priority (top first):
1. `.env.<NODE_ENV>.local` — local overrides for a specific env (gitignored)
2. `.env.local` — local overrides, shared (gitignored)
3. `.env.<NODE_ENV>` — defaults for the environment
4. `.env` — shared defaults

Templates committed to the repo:
- `.env.example` — generic
- `.env.stage.example` → copy to `.env.stage` on the stage host
- `.env.production.example` → copy to `.env.production` on the prod host

The `.env.development` file is **gitignored** — create it locally from `.env.example`.

| Variable | Example | Description |
|---|---|---|
| `NODE_ENV` | `development` \| `stage` \| `production` | Validated by Joi |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5433/products_db` | Postgres connection string |
| `RABBITMQ_URL` | `amqp://guest:guest@localhost:5672` | AMQP URL |
| `RABBITMQ_QUEUE` | `products_queue` | Shared queue for publisher + consumer |
| `PRODUCTS_PORT` | `3001` | Products HTTP port |
| `NOTIFICATIONS_PORT` | `3002` | Reserved |
| `LOG_LEVEL` | `log` \| `debug` \| `warn` \| `error` | Nest Logger level |

## Quick start — full Docker stack

Everything (including both Nest apps + the FE) runs in containers. From
the **repo root**, not this directory:

```bash
cp .env.docker.example .env
docker compose up --build                              # prod images
docker compose -f docker-compose.dev.yml up --build    # dev, hot reload
```

See the [root README](../README.md) for the full URL map.

## Quick start — native (Node on host, infra in Docker)

> **Prereq:** Node.js 18+, Docker Desktop, `jq` (optional, for curl tests)

```bash
# 1. Install dependencies
npm install

# 2. Local env
cp .env.example .env.development
# (adjust DATABASE_URL if needed — docker-compose maps Postgres to host port 5433)

# 3. Infrastructure (Postgres on 5433, RabbitMQ on 5672 / UI on 15672)
#    Uses docker-compose.infra.yml — postgres + rabbitmq only.
npm run docker:up

# 4. Migrations
npm run db:migrate

# 5. Services — in TWO terminals
npm run start:products         # :3001 — HTTP API
npm run start:notifications    # RMQ consumer

# 6. Smoke test — in a third terminal
curl -s -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo","description":"hello","price":9.99}' | jq
# → Products responds 201 + product object
# → Notifications logs "📦 Product CREATED: id=..."
```

## API

| Method | Path | Body / Query | Response |
|---|---|---|---|
| `POST` | `/products` | `{ name: string, description: string, price: number }` | `201` + Product |
| `DELETE` | `/products/:id` | `id: uuid` | `200` + deleted Product / `404` |
| `GET` | `/products` | `?page=1&limit=10` | `200` + `{ data: Product[], meta: { total, page, limit, totalPages } }` |

Validation: DTOs via `class-validator`; `forbidNonWhitelisted: true` — unknown fields → 400.

Errors — unified shape via the global `AllExceptionsFilter`:
```json
{ "statusCode": 404, "path": "/products/...", "timestamp": "2026-...", "message": "...", "error": "Not Found" }
```

## npm scripts

| Command | What it does |
|---|---|
| `npm run start:products` | Products in watch mode (NODE_ENV=development) |
| `npm run start:notifications` | Notifications in watch mode |
| `npm run start:products:stage` / `:prod` | Run from dist/ with NODE_ENV=stage/production |
| `npm run build` | Build both services into `dist/apps/{products,notifications}` |
| `npm run db:migrate` | Apply Drizzle migrations (with DB-readiness retry) |
| `npm run db:generate` | Generate a new migration from changes in `libs/database/src/schema.ts` |
| `npm run db:studio` | Drizzle Studio (web UI for the DB) |
| `npm run docker:up` / `:down` / `:logs` | Manage infra (postgres + rabbitmq) via `docker-compose.infra.yml` |
| `npm run lint` | ESLint check (read-only, used by the pre-push hook) |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier |

## Deploying to stage / production

1. Copy `.env.<env>.example` → `.env.<env>` on the target host and fill in real credentials
2. On the host: `npm ci && npm run build && npm run db:migrate`
3. Start:
   ```bash
   NODE_ENV=production npm run start:products:prod
   NODE_ENV=production npm run start:notifications:prod
   ```
   (via systemd / pm2 / Docker — your choice)

## Docker image

Single `Dockerfile`, three build targets — both apps share the same image,
only the entrypoint differs:

| Target | Purpose |
|---|---|
| `prod` | Production bundle. `APP=products` or `APP=notifications` build arg selects the entrypoint. Runs `node dist/apps/$APP/main.js`. |
| `migrate` | One-shot migration runner (`npm run db:migrate`) — blocks the prod stack until the schema is up to date. |
| `dev` | Hot-reload dev. Source bind-mounted by the dev compose; runs `nest start $APP --watch`. |

Consumed by `docker-compose.yml` (prod) and `docker-compose.dev.yml` (dev)
at the repo root.

## Design decisions

### Fire-and-forget publisher
Products publishes an event **after** a successful INSERT/DELETE through
`rmqClient.emit().subscribe({ error: log })`. If RabbitMQ is unavailable,
the HTTP request still responds 201/200 (the DB is the source of truth).
We trade possible message loss for avoiding 5xx to the client.

For strict guarantees in production — use the **outbox pattern** (write the
event in the same transaction, then a separate relay worker ships it).

### Manual ack/nack in Notifications
`noAck: false` + explicit `channel.ack(msg)` on success.
A non-recoverable error (invalid payload) → `nack(requeue=false)` — avoids
infinite loops.

### Multi-env config
A single `AppConfigModule` in `libs/config` with Joi validation — fail fast
on bad env. Both services import it.

### Drizzle + scripts/migrate.ts
Custom runner instead of `drizzle-kit migrate` — retries the DB connection
(up to 15s) to avoid the race where `pg_isready` reports OK before
`POSTGRES_DB` has been created.

## Troubleshooting

- **`database "products_db" does not exist`** — Postgres hasn't created the DB
  yet. Check `docker logs ugt_postgres | grep "ready"` and rerun `db:migrate`.
- **`connection refused` on 5432** — you have a native Postgres running.
  docker-compose maps to `5433` — make sure `DATABASE_URL=...localhost:5433/...`.
- **Notifications logs nothing** — check `docker logs ugt_rabbitmq` and verify
  both services share the same `RABBITMQ_QUEUE`. Management UI:
  http://localhost:15672 (guest/guest).
