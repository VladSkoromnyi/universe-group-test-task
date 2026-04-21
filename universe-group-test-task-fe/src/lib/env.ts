/**
 * Public runtime config. Inlined at build time via NEXT_PUBLIC_* convention.
 * Fail loudly at module-load if a required value is missing.
 */
function required(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const env = {
  apiUrl: required(
    "NEXT_PUBLIC_API_URL",
    process.env.NEXT_PUBLIC_API_URL,
  ),
} as const;
