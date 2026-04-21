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
