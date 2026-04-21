/**
 * Runtime config. Exposed as a single `env` object so call-sites never reach
 * into `process.env` directly.
 *
 * Two URLs on purpose:
 *
 * - `apiUrl` (NEXT_PUBLIC_API_URL) — inlined into the browser bundle. This is
 *   the URL the browser uses, so it must be reachable from the user's machine
 *   (e.g. `http://localhost:3001`).
 * - `internalApiUrl` (INTERNAL_API_URL) — used by server-side fetchers (SSR
 *   prefetch, route handlers). When Next.js runs inside a container, this
 *   should be the service DNS name on the Docker network
 *   (e.g. `http://products:3001`). Optional — falls back to `apiUrl` if not set,
 *   which is correct for local `npm run dev` where both sides hit localhost.
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

export const env = {
  /** Browser-facing API URL (inlined at build time). */
  apiUrl: publicApiUrl,
  /**
   * Server-side API URL. Defaults to `apiUrl` for local dev. Override with
   * `INTERNAL_API_URL` when the server runtime lives on a different network
   * from the browser (e.g. Docker Compose).
   */
  internalApiUrl: process.env.INTERNAL_API_URL || publicApiUrl,
} as const;
