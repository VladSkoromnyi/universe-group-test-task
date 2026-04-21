import { env } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Which backend service to call. Each has its own public + internal URL. */
export type ApiService = "products" | "notifications";

type Options = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Which service's base URL to use. Defaults to `"products"`. */
  service?: ApiService;
  /** Next.js fetch options — used on the server for caching/revalidation */
  next?: { revalidate?: number | false; tags?: string[] };
};

function baseUrlFor(service: ApiService): string {
  const isServer = typeof window === "undefined";
  switch (service) {
    case "notifications":
      return isServer ? env.internalNotificationsApiUrl : env.notificationsApiUrl;
    case "products":
    default:
      return isServer ? env.internalApiUrl : env.apiUrl;
  }
}

/**
 * Thin typed fetch wrapper. Works on both server and client — on the server
 * Next's fetch extensions (next.revalidate, next.tags) are respected.
 *
 * Picks the right base URL for the runtime:
 *   - On the server (SSR / route handlers) use the internal DNS name so we
 *     reach other containers on the Docker network.
 *   - In the browser use the public URL that's reachable from the user's
 *     machine.
 */
export async function apiFetch<T>(path: string, options: Options = {}): Promise<T> {
  const { body, headers, next, service = "products", ...rest } = options;
  const baseUrl = baseUrlFor(service);
  const url = `${baseUrl.replace(/\/$/, "")}${path}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...(next ? { next } : {}),
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => undefined) : undefined;

  if (!res.ok) {
    const message =
      (payload as { message?: string | string[] })?.message
        ? Array.isArray((payload as { message: string[] }).message)
          ? (payload as { message: string[] }).message.join(", ")
          : String((payload as { message: string }).message)
        : `Request failed: ${res.status}`;
    throw new ApiError(res.status, path, message, payload);
  }

  return payload as T;
}
