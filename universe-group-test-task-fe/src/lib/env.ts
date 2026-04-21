/**
 * Runtime config. Exposed as a single `env` object so call-sites never reach
 * into `process.env` directly.
 *
 * Two URLs per service on purpose:
 *
 * - `apiUrl` / `notificationsApiUrl` (NEXT_PUBLIC_*) — inlined into the browser
 *   bundle. These are the URLs the browser uses, so they must be reachable
 *   from the user's machine (e.g. `http://localhost:3001`).
 * - `internalApiUrl` / `internalNotificationsApiUrl` (INTERNAL_*) — used by
 *   server-side fetchers (SSR prefetch, route handlers). When Next.js runs
 *   inside a container, these should be the service DNS names on the Docker
 *   network (e.g. `http://products:3001`). Optional — fall back to the public
 *   URL if not set, which is correct for local `npm run dev` where both sides
 *   hit localhost.
 *
 * Fail loudly at module-load if a required value is missing.
 */
function required(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

const publicApiUrl = required(
  "NEXT_PUBLIC_API_URL",
  process.env.NEXT_PUBLIC_API_URL,
);

const publicNotificationsApiUrl = required(
  "NEXT_PUBLIC_NOTIFICATIONS_API_URL",
  process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL,
);

export const env = {
  /** Browser-facing products API URL (inlined at build time). */
  apiUrl: publicApiUrl,
  /**
   * Server-side products API URL. Defaults to `apiUrl` for local dev. Override
   * with `INTERNAL_API_URL` when the server runtime lives on a different
   * network from the browser (e.g. Docker Compose).
   */
  internalApiUrl: process.env.INTERNAL_API_URL || publicApiUrl,
  /** Browser-facing notifications API URL (inlined at build time). */
  notificationsApiUrl: publicNotificationsApiUrl,
  /** Server-side notifications API URL. See `internalApiUrl`. */
  internalNotificationsApiUrl:
    process.env.INTERNAL_NOTIFICATIONS_API_URL || publicNotificationsApiUrl,
} as const;
