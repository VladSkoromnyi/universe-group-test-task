"use client";

import { AlertCircleIcon, PackageIcon, Trash2Icon } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DEFAULT_PAGE_SIZE,
  useNotifications,
} from "@/hooks/use-notifications";
import { ApiError } from "@/lib/api/client";
import type { Notification } from "@/lib/api/notifications";
import { cn } from "@/lib/utils";

import { DeleteNotificationDialog } from "./delete-notification-dialog";
import { NotificationsPagination } from "./notifications-pagination";

type Props = {
  page: number;
};

export function NotificationsList({ page }: Props) {
  const { data, isPending, isError, error, refetch, isFetching } =
    useNotifications(page);

  if (isPending) {
    return <NotificationsListSkeleton />;
  }

  if (isError) {
    const message =
      error instanceof ApiError ? error.message : "Failed to load notifications";

    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircleIcon className="size-4" />
            Could not load notifications
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { data: notifications, meta } = data;

  if (notifications.length === 0) {
    return (
      <div className="border-border/60 rounded-lg border border-dashed p-10 text-center">
        <p className="text-muted-foreground text-sm">
          No notifications yet — create or delete a product to generate one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" aria-busy={isFetching}>
      <ul className="grid gap-3">
        {notifications.map((notification) => (
          <li key={notification.id}>
            <NotificationRow notification={notification} />
          </li>
        ))}
      </ul>

      <NotificationsPagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        pageSize={meta.limit}
      />
    </div>
  );
}

function NotificationRow({ notification }: { notification: Notification }) {
  const { label, tone, description } = describe(notification);

  return (
    <Card className="gap-3 py-0">
      <CardHeader className="flex items-start gap-3 py-4">
        <div
          className={cn(
            "mt-1 flex size-9 shrink-0 items-center justify-center rounded-full",
            tone === "create" && "bg-emerald-500/10 text-emerald-600",
            tone === "delete" && "bg-destructive/10 text-destructive",
            tone === "other" && "bg-muted text-muted-foreground",
          )}
        >
          {tone === "delete" ? (
            <Trash2Icon className="size-4" />
          ) : (
            <PackageIcon className="size-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-base">{label}</CardTitle>
          <CardDescription className="truncate">{description}</CardDescription>
          <p className="text-muted-foreground mt-1 text-xs tabular-nums">
            {formatTimestamp(notification.receivedAt)}
          </p>
        </div>
        <CardAction>
          <DeleteNotificationDialog
            notificationId={notification.id}
            label={label}
          />
        </CardAction>
      </CardHeader>
    </Card>
  );
}

type Descriptor = {
  label: string;
  tone: "create" | "delete" | "other";
  description: string;
};

function describe(n: Notification): Descriptor {
  const payload = n.payload ?? {};
  const name = typeof payload.name === "string" ? payload.name : undefined;
  const id =
    n.productId ?? (typeof payload.id === "string" ? payload.id : undefined);

  switch (n.eventType) {
    case "product.created":
      return {
        label: name ? `Product created: ${name}` : "Product created",
        tone: "create",
        description: id ? `id=${id}` : "New product event",
      };
    case "product.deleted":
      return {
        label: "Product deleted",
        tone: "delete",
        description: id ? `id=${id}` : "Deleted product event",
      };
    default:
      return {
        label: n.eventType || "Unknown event",
        tone: "other",
        description: id ? `id=${id}` : JSON.stringify(payload).slice(0, 80),
      };
  }
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function NotificationsListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, i) => (
        <div
          key={i}
          className="border-border/60 flex items-center gap-4 rounded-lg border p-4"
        >
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="size-8" />
        </div>
      ))}
    </div>
  );
}
