"use client";

import { AlertCircleIcon } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_PAGE_SIZE, useProducts } from "@/hooks/use-products";
import { ApiError } from "@/lib/api/client";
import { formatPrice, productImageUrl } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/api/products";

import { DeleteProductDialog } from "./delete-product-dialog";
import { ProductsPagination } from "./products-pagination";
import type { ViewMode } from "./search-params";

type Props = {
  page: number;
  view: ViewMode;
};

export function ProductsList({ page, view }: Props) {
  const { data, isPending, isError, error, refetch, isFetching } =
    useProducts(page);

  if (isPending) {
    return <ProductsListSkeleton view={view} />;
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
    <div className="space-y-6" aria-busy={isFetching}>
      {view === "grid" ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <ProductGridCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-3">
          {products.map((product) => (
            <li key={product.id}>
              <ProductListRow product={product} />
            </li>
          ))}
        </ul>
      )}

      <ProductsPagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        pageSize={meta.limit}
        view={view}
      />
    </div>
  );
}

function ProductGridCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden py-0 transition-shadow hover:shadow-md">
      <div className="bg-muted relative aspect-[4/3] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productImageUrl(product.id, { width: 600, height: 450 })}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <CardHeader className="pt-4">
        <CardTitle className="truncate">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex items-center justify-between pb-4">
        <span className="text-base font-semibold tabular-nums">
          {formatPrice(product.price)}
        </span>
        <DeleteProductDialog
          productId={product.id}
          productName={product.name}
        />
      </CardFooter>
    </Card>
  );
}

function ProductListRow({ product }: { product: Product }) {
  return (
    <Card className="gap-3 overflow-hidden py-0">
      <div className="flex items-stretch gap-4">
        <div className="bg-muted relative hidden h-24 w-32 shrink-0 overflow-hidden sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={productImageUrl(product.id, { width: 320, height: 240 })}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        <CardHeader className="flex-1 py-4">
          <CardTitle className="truncate">{product.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {product.description}
          </CardDescription>
          <CardAction>
            <div className="flex items-center gap-3">
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
      </div>
    </Card>
  );
}

function ProductsListSkeleton({ view }: { view: ViewMode }) {
  const count = DEFAULT_PAGE_SIZE;
  return view === "grid" ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border-border/60 overflow-hidden rounded-xl border"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className={cn("space-y-3")}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border-border/60 flex items-center gap-4 rounded-lg border p-4"
        >
          <Skeleton className="hidden h-16 w-24 sm:block" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
