"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteNotification,
  listNotifications,
  type PaginatedNotifications,
} from "@/lib/api/notifications";
import { queryKeys } from "@/lib/api/query-keys";

export const DEFAULT_PAGE_SIZE = 10;

/**
 * Paginated notifications list. Uses `keepPreviousData` so the previous page
 * stays visible while the next loads — same UX as products.
 * On the notifications page we pre-populate the cache on the server.
 */
export function useNotifications(page: number, limit: number = DEFAULT_PAGE_SIZE) {
  return useQuery<PaginatedNotifications>({
    queryKey: queryKeys.notifications.list(page, limit),
    queryFn: () => listNotifications({ page, limit }),
    placeholderData: keepPreviousData,
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
