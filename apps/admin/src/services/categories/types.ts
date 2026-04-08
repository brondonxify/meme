import { Pagination } from "@/types/pagination";
import { Category } from "./index";

export interface FetchCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FetchCategoriesResponse {
  data: Category[];
  pagination: Pagination;
}

export type CategoryDropdown = Pick<Category, "id" | "name" | "slug">;
