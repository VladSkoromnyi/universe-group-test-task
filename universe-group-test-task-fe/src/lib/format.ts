/**
 * Price from the API is a string (Postgres NUMERIC). Parse defensively and
 * format with two decimals so the column stays aligned.
 */
export function formatPrice(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * Deterministic placeholder image URL for a product. Using the id as a
 * seed means the same product always gets the same image across renders
 * and reloads, which makes the UI feel stable even though the backend
 * does not yet store images.
 */
export function productImageUrl(
  productId: string,
  { width = 400, height = 300 }: { width?: number; height?: number } = {},
): string {
  return `https://picsum.photos/seed/${encodeURIComponent(productId)}/${width}/${height}`;
}
