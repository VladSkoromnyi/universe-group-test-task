import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { listNotifications } from "@/lib/api/notifications";
import { queryKeys } from "@/lib/api/query-keys";
import { getServerQueryClient } from "@/lib/query-client.server";
import { DEFAULT_PAGE_SIZE } from "@/hooks/use-notifications";

import { NotificationsList } from "./_components/notifications-list";
import { parsePage } from "./_components/search-params";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const limit = DEFAULT_PAGE_SIZE;

  // Prefetch on the server — same pattern as the products page, so the client
  // query hits a warm cache on first render.
  const queryClient = getServerQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.notifications.list(page, limit),
    queryFn: () => listNotifications({ page, limit }),
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Every product mutation is published to RabbitMQ and logged here by
            the notifications service. Rows can be deleted individually.
          </p>
        </div>
      </header>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <NotificationsList page={page} />
      </HydrationBoundary>
    </div>
  );
}
