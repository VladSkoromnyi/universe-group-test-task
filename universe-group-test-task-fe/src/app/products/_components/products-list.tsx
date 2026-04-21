"use client";

import { AlertCircleIcon } from "lucide-react";

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
import { DEFAULT_PAGE_SIZE, useProducts } from "@/hooks/use-products";
import { ApiError } from "@/lib/api/client";
import { formatPrice } from "@/lib/format";

import { DeleteProductDialog } from "./delete-product-dialog";
import { ProductsPagination } from "./products-pagination";

type Props = {
  page: number;
};

export function ProductsList({ page }: Props) {
  const { data, isPending, isError, error, refetch, isFetching } =
    useProducts(page);

  if (isPending) {
    return <ProductsListSkeleton />;
  }

  if (isError) {
    const message =
      error instanceof ApiError ? error.message : "Failed to load products";

    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircleIcon className="size-4" />
            Could not load products
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

  const { data: products, meta } = data;

  if (products.length === 0) {
    return (
      <div className="border-border/60 rounded-lg border border-dashed p-10 text-center">
        <p className="text-muted-foreground text-sm">
          No products yet — create the first one using the button above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" aria-busy={isFetching}>
      <ul className="grid gap-3">
        {products.map((product) => (
          <li key={product.id}>
            <Card className="gap-3 py-4">
              <CardHeader>
                <CardTitle className="truncate">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.description}
                </CardDescription>
                <CardAction>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium tabular-nums">
                      {formatPrice(product.price)}
                    </span>
                    <DeleteProductDialog
                      productId={product.id}
                      productName={product.name}
                    />
                  </div>
                </CardAction>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>

      <ProductsPagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        pageSize={meta.limit}
      />
    </div>
  );
}

function ProductsListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, i) => (
        <div
          key={i}
          className="border-border/60 flex items-center justify-between rounded-lg border p-4"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
