/**
 * Central place for query keys so they're consistent between:
 * - server prefetch (dehydrate → hydrate)
 * - client reads (useQuery)
 * - cache invalidation (queryClient.invalidateQueries)
 */
export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (page: number, limit: number) =>
      [...queryKeys.products.all, "list", { page, limit }] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (page: number, limit: number) =>
      [...queryKeys.notifications.all, "list", { page, limit }] as const,
  },
} as const;
