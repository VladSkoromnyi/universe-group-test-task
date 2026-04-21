import { apiFetch } from "@/lib/api/client";

export type Product = {
  id: string;
  name: string;
  description: string;
  /** Backend returns Postgres NUMERIC as a string to preserve precision */
  price: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedProducts = {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CreateProductInput = {
  name: string;
  description: string;
  price: number;
};

export type ListProductsParams = {
  page?: number;
  limit?: number;
};

/** Server-safe list fetch (no cache — we always want fresh data on the list page) */
export function listProducts(params: ListProductsParams = {}): Promise<PaginatedProducts> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiFetch<PaginatedProducts>(`/products?${qs.toString()}`, {
    cache: "no-store",
  });
}

export function createProduct(input: CreateProductInput): Promise<Product> {
  return apiFetch<Product>("/products", {
    method: "POST",
    body: input,
  });
}

export function deleteProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, {
    method: "DELETE",
  });
}
