import { apiFetch } from "@/lib/api/client";

export type NotificationEventType = "product.created" | "product.deleted" | string;

export type Notification = {
  id: string;
  eventType: NotificationEventType;
  productId: string | null;
  /** Raw event payload as received from RabbitMQ — shape varies per event. */
  payload: Record<string, unknown>;
  receivedAt: string;
};

export type PaginatedNotifications = {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ListNotificationsParams = {
  page?: number;
  limit?: number;
};

/** Server-safe list fetch (no cache — we always want fresh rows on the list page) */
export function listNotifications(
  params: ListNotificationsParams = {},
): Promise<PaginatedNotifications> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch<PaginatedNotifications>(`/notifications?${qs.toString()}`, {
    service: "notifications",
    cache: "no-store",
  });
}

export function deleteNotification(id: string): Promise<Notification> {
  return apiFetch<Notification>(`/notifications/${id}`, {
    service: "notifications",
    method: "DELETE",
  });
}
