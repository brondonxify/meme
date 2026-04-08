import { Pagination } from "@/types/pagination";

export type ProductStatus = "selling" | "out-of-stock";

export interface Product {
  id: string;
  name: string;
  description: string;
  cost_price: number;
  selling_price: number;
  stock: number;
  min_stock_threshold: number;
  category_id: string;
  image_url: string;
  slug: string;
  sku: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  categories: {
    name: string | null;
    slug: string | null;
  } | null;
}

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  priceSort?: string;
  status?: string;
  published?: boolean;
  dateSort?: string;
}

export interface FetchProductsResponse {
  data: Product[];
  pagination: Pagination;
}

export interface ProductDetails {
  id: string;
  name: string;
  description: string;
  cost_price: number;
  selling_price: number;
  stock: number;
  min_stock_threshold: number;
  category_id: string;
  image_url: string;
  slug: string;
  sku: string;
  categories: {
    name: string;
  };
}
