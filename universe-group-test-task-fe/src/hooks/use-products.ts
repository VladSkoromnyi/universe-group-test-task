"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createProduct,
  deleteProduct,
  listProducts,
  type CreateProductInput,
  type PaginatedProducts,
} from "@/lib/api/products";
import { queryKeys } from "@/lib/api/query-keys";

export const DEFAULT_PAGE_SIZE = 10;

/**
 * Paginated products list. Uses `keepPreviousData` so the previous page stays
 * visible while the next one loads — no layout jump.
 * On the products page we pre-populate the cache on the server, so this hook
 * usually hits a warm cache on first render.
 */
export function useProducts(page: number, limit: number = DEFAULT_PAGE_SIZE) {
  return useQuery<PaginatedProducts>({
    queryKey: queryKeys.products.list(page, limit),
    queryFn: () => listProducts({ page, limit }),
    placeholderData: keepPreviousData,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () => {
      // Invalidate every paginated list — the newly created product may
      // appear on any page depending on sort order.
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}
