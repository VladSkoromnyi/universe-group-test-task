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

type Options = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Next.js fetch options — used on the server for caching/revalidation */
  next?: { revalidate?: number | false; tags?: string[] };
};

/**
 * Thin typed fetch wrapper. Works on both server and client — on the server
 * Next's fetch extensions (next.revalidate, next.tags) are respected.
 */
export async function apiFetch<T>(path: string, options: Options = {}): Promise<T> {
  const { body, headers, next, ...rest } = options;
  const url = `${env.apiUrl.replace(/\/$/, "")}${path}`;

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
