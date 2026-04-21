/**
 * Search-param parsing for /notifications. Mirrors the products page pattern
 * so both lists share the same URL-as-source-of-truth approach.
 */

type RawValue = string | string[] | undefined;

export function parsePage(raw: RawValue): number {
  const n = Array.isArray(raw) ? Number(raw[0]) : Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function buildNotificationsHref({ page }: { page: number }): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/notifications?${qs}` : "/notifications";
}
