# Frontend — Universe Products

Next.js App Router UI for the Products API. Paginated catalogue with grid /
list views, create / delete dialogs, dark theme and SSR-hydrated TanStack
Query caches.

## Stack

- **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui** (New York style, neutral base)
- **TanStack Query 5** — client-side data + cache invalidation
- **react-hook-form** + **zod** — forms & validation
- **next-themes** — dark / light / system
- **sonner** — toast notifications
- **lucide-react** — icons

## Pages

| Route | Type | Behaviour |
|---|---|---|
| `/` | Server | 307 redirect → `/products` |
| `/products` | Server (dynamic) | Reads `?page`, `?view` from URL, prefetches the paginated list, dehydrates the cache, wraps the client list in `HydrationBoundary` |
| `not-found` | Server | Friendly 404 with a link back to `/products` |
| `error` | Client boundary | Catches unexpected render errors, offers retry |

Loading state: `src/app/products/loading.tsx` — skeleton grid that matches
the real layout so there's no layout shift on first paint.

## Project layout

```
universe-group-test-task-fe/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout — fonts, Providers, SiteHeader, Toaster
│   │   ├── page.tsx                   # Redirect to /products
│   │   ├── error.tsx                  # Global error boundary
│   │   ├── not-found.tsx              # 404
│   │   ├── globals.css                # Tailwind 4 + shadcn theme tokens
│   │   └── products/
│   │       ├── page.tsx               # Server component: prefetch + hydrate
│   │       ├── loading.tsx            # Skeleton (grid layout)
│   │       └── _components/           # Route-local UI (co-located)
│   │           ├── products-list.tsx         # Grid + list renderers
│   │           ├── products-pagination.tsx   # URL-driven page nav
│   │           ├── view-toggle.tsx           # ?view=grid|list (Link-based)
│   │           ├── create-product-dialog.tsx # RHF + zod
│   │           ├── delete-product-dialog.tsx # AlertDialog confirm
│   │           └── search-params.ts          # URL parse/build helpers
│   ├── components/
│   │   ├── site-header.tsx            # App bar
│   │   ├── theme-toggle.tsx           # Light / Dark / System
│   │   └── ui/                        # shadcn primitives
│   ├── hooks/
│   │   └── use-products.ts            # useProducts / useCreateProduct / useDeleteProduct
│   └── lib/
│       ├── api/
│       │   ├── client.ts              # Typed fetch wrapper + ApiError
│       │   ├── products.ts            # Typed fetchers (list/create/delete)
│       │   └── query-keys.ts          # Central query-key factory
│       ├── env.ts                     # Fail-fast NEXT_PUBLIC_* reader
│       ├── format.ts                  # Price formatter + placeholder image URL
│       ├── providers.tsx              # "use client" — Theme + QueryClient + Devtools
│       ├── query-client.server.ts     # Per-request server QueryClient factory
│       └── utils.ts                   # cn()
├── .env.example                       # Generic template
├── .env.development.example           # Committed template for dev values
├── .env.stage.example                 # Committed template for stage values
├── .env.production.example            # Committed template for prod values
├── components.json                    # shadcn config
└── next.config.ts
```

## Environment variables

Next.js loads `.env.<NODE_ENV>` automatically (`.env.development` on `dev`,
`.env.production` on `build`). Real values are git-ignored; only `.example`
templates are committed.

| Variable | Example | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Browser-facing base URL of the Products API. Must be prefixed with `NEXT_PUBLIC_` so it's inlined into the browser bundle at build time. Validated at module load via `src/lib/env.ts` — missing value throws immediately. |
| `INTERNAL_API_URL` | `http://products:3001` | Optional. Used only by server-side fetchers (SSR prefetch, route handlers) when the server runtime lives on a different network from the browser (Docker Compose). Falls back to `NEXT_PUBLIC_API_URL` if unset — correct for local `npm run dev`. |

## Quick start — full Docker stack

```bash
# From the repo root:
cp .env.docker.example .env
docker compose up --build                              # prod (standalone build)
docker compose -f docker-compose.dev.yml up --build    # dev, with HMR
```

See the [root README](../README.md) for the full URL map.

## Quick start — native

```bash
# 1. Install
npm install

# 2. Local env
cp .env.example .env.development
# NEXT_PUBLIC_API_URL=http://localhost:3001 (already the default)

# 3. Make sure the backend is running (native flow — infra in Docker, apps on host)
#    cd ../universe-group-test-task-be && npm run docker:up && npm run db:migrate && npm run start:products

# 4. Dev server
npm run dev                 # http://localhost:3000
```

## npm scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` — strict TypeScript check |

## Docker image

Single `Dockerfile`, two build targets:

| Target | Purpose |
|---|---|
| `prod` | Next.js standalone build (`output: "standalone"` in `next.config.ts`). Final image is ~150MB — just the server bundle and a pruned `node_modules`. |
| `dev` | Ships only the dependencies; compose bind-mounts the source and the container runs `next dev` with HMR. |

`NEXT_PUBLIC_API_URL` must be supplied at **build time** (prod target) because
Next.js inlines public env vars into the browser bundle. `INTERNAL_API_URL`
is read at **runtime** and selected by `src/lib/api/client.ts` when
`typeof window === "undefined"` — so server-side fetchers hit the `products`
container directly over the docker network, while the browser keeps using
the localhost URL.

Consumed by `docker-compose.yml` (prod) and `docker-compose.dev.yml` (dev)
at the repo root.

## Design decisions

### SSR prefetch + client hydration
The `/products` server component creates a per-request `QueryClient`,
prefetches the paginated list via the same `listProducts()` fetcher the
client uses, then dehydrates the cache into a `HydrationBoundary`. When the
client `useProducts(page)` mounts, the query key matches and it reads from
the warm cache — no double fetch, no loading flash, but React Query still
owns invalidation after mutations.

```tsx
// Server
const qc = getServerQueryClient();
await qc.prefetchQuery({
  queryKey: queryKeys.products.list(page, limit),
  queryFn: () => listProducts({ page, limit }),
});
return (
  <HydrationBoundary state={dehydrate(qc)}>
    <ProductsList page={page} view={view} />
  </HydrationBoundary>
);
```

### URL is the single source of truth
`?page=N` and `?view=grid|list` live in the URL, not React state. Pagination
and the view toggle render `<Link>`s (with `scroll=false`, `replace` for the
toggle so history stays clean). Deep-links, refresh and back/forward all
work without extra plumbing. Defaults are omitted from the URL
(`buildProductsHref`) so the common case stays short.

### Query-key factory
All keys live in `src/lib/api/query-keys.ts`. Server prefetch, client reads
and mutation invalidations all reference the same constants — no drift.
Mutations invalidate `["products"]` (every paginated page) because the new /
deleted product may land anywhere given the default sort.

### Thin typed fetch wrapper
`apiFetch<T>` in `src/lib/api/client.ts` is isomorphic (Node + browser),
supports Next's `next: { revalidate, tags }` options, and throws `ApiError`
with a sensible `.message` parsed from the backend's error envelope.
Toasts surface `ApiError.message` verbatim — so the same validation string
from `class-validator` on the server shows up to the user.

### Form validation mirrors the backend DTO
`CreateProductDialog`'s zod schema intentionally matches
`apps/products/src/dto/product.dto.ts` constraints (`max 255` name, `max
1000` description, positive price with 2 decimals ≤ `99,999,999.99`) so the
user hits errors client-side before we make a network call.

### Delete dialog preserves async state
`onConfirm` calls `event.preventDefault()` on the `AlertDialogAction`
handler so Radix doesn't auto-close before the mutation resolves — the
"Deleting…" state is visible and the dialog only dismisses on success.

### Placeholder images
Product cards use `https://picsum.photos/seed/<id>/…` — seeded by the
product id, so the same product gets the same image across renders and
reloads. Rendered with a plain `<img loading="lazy">` so we don't need to
register a remote image domain with Next/Image.

### Dark theme by default
`ThemeProvider` in `src/lib/providers.tsx` sets `defaultTheme="dark"`,
`attribute="class"`. The toggle offers Light / Dark / System.
`suppressHydrationWarning` on `<html>` silences the expected mismatch on
first paint.

## Production build

```bash
NEXT_PUBLIC_API_URL=https://api.example.com npm run build
npm start
```

`/products` is dynamic (reads search params), everything else is static.

## Deploying to stage / production

1. Copy `.env.<env>.example` → `.env.<env>` on the host, fill in
   `NEXT_PUBLIC_API_URL` for that environment
2. `npm ci && npm run build`
3. `npm start` (behind a process manager — systemd / pm2 / Docker)

## Troubleshooting

- **"Missing required env var: NEXT_PUBLIC_API_URL"** on startup — you
  haven't created `.env.development` (or set the var in the shell). Copy
  from `.env.example`.
- **`ECONNREFUSED` on every fetch** — backend isn't running. Start it with
  `cd ../universe-group-test-task-be && npm run docker:up && npm run
  start:products`.
- **CORS errors in the browser** — the backend already calls
  `app.enableCors()`; if you changed the ports, also update
  `NEXT_PUBLIC_API_URL`.
