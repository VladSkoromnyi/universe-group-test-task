/**
 * Single source of truth for the products page search params.
 * Keeping the parse/build logic here means the server page, pagination
 * links and the view toggle all agree on shape, defaults and encoding.
 */

export type ViewMode = "grid" | "list";

export const DEFAULT_VIEW: ViewMode = "grid";

type RawValue = string | string[] | undefined;

export function parsePage(raw: RawValue): number {
  const n = Array.isArray(raw) ? Number(raw[0]) : Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function parseView(raw: RawValue): ViewMode {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "list" ? "list" : "grid";
}

/**
 * Build a `/products` URL with the given page + view.
 * Omits defaults so the URL stays short for the common case.
 */
export function buildProductsHref({
  page,
  view,
}: {
  page: number;
  view: ViewMode;
}): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (view !== DEFAULT_VIEW) params.set("view", view);
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}
