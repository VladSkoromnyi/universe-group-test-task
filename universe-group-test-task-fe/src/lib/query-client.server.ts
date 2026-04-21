import { QueryClient } from "@tanstack/react-query";

/**
 * Per-request QueryClient for server components. We intentionally create a
 * fresh one every call so that requests from different users never share
 * a cache. On the client the provider in `@/lib/providers` owns the singleton.
 */
export function getServerQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Server prefetches should not be considered stale immediately — if
        // they were, the client would refetch as soon as it mounted, defeating
        // the whole point of dehydrating the initial state.
        staleTime: 30_000,
      },
    },
  });
}
