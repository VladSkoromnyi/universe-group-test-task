import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { listProducts } from "@/lib/api/products";
import { queryKeys } from "@/lib/api/query-keys";
import { getServerQueryClient } from "@/lib/query-client.server";
import { DEFAULT_PAGE_SIZE } from "@/hooks/use-products";

import { CreateProductDialog } from "./_components/create-product-dialog";
import { ProductsList } from "./_components/products-list";

type SearchParams = { [key: string]: string | string[] | undefined };

function parsePage(raw: string | string[] | undefined): number {
  const n = Array.isArray(raw) ? Number(raw[0]) : Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const limit = DEFAULT_PAGE_SIZE;

  // Prefetch on the server, hand the dehydrated cache down so the client
  // query hits a warm cache instead of refetching on mount.
  const queryClient = getServerQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.products.list(page, limit),
    queryFn: () => listProducts({ page, limit }),
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Browse the catalogue. Create or delete products — every mutation
            publishes an event to the notifications service via RabbitMQ.
          </p>
        </div>
        <CreateProductDialog />
      </header>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductsList page={page} />
      </HydrationBoundary>
    </div>
  );
}
