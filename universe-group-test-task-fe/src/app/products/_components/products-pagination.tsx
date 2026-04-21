"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
};

/**
 * Stateless pagination — the URL is the single source of truth (`?page=N`).
 * We render `Link` elements so deep-linking and back/forward all work and
 * the server component can SSR the correct page.
 */
export function ProductsPagination({ page, totalPages, total, pageSize }: Props) {
  if (total === 0) return null;

  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  const prevHref = prevPage > 1 ? `/products?page=${prevPage}` : "/products";
  const nextHref = `/products?page=${nextPage}`;

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <p className="text-muted-foreground text-sm">
        Showing <span className="text-foreground font-medium">{firstItem}</span>–
        <span className="text-foreground font-medium">{lastItem}</span> of{" "}
        <span className="text-foreground font-medium">{total}</span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          asChild={page > 1}
          variant="outline"
          size="sm"
          disabled={page <= 1}
          aria-label="Previous page"
        >
          {page > 1 ? (
            <Link href={prevHref}>
              <ChevronLeftIcon />
              Previous
            </Link>
          ) : (
            <span>
              <ChevronLeftIcon />
              Previous
            </span>
          )}
        </Button>

        <span className="text-muted-foreground text-sm tabular-nums">
          Page {page} of {totalPages}
        </span>

        <Button
          asChild={page < totalPages}
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          {page < totalPages ? (
            <Link href={nextHref}>
              Next
              <ChevronRightIcon />
            </Link>
          ) : (
            <span>
              Next
              <ChevronRightIcon />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
