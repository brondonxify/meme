import { get } from "@/lib/api-client";
import type { BackendArticle, PaginatedResponse } from "@/types/api";

export interface FetchProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
}

export interface FetchProductsResponse {
    data: BackendArticle[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export async function fetchProducts(
    params: FetchProductsParams = {},
): Promise<FetchProductsResponse> {
    const { page = 1, limit = 10, search, categoryId, category, minPrice, maxPrice, sort } = params;

    const searchParams = new URLSearchParams();
    searchParams.set("page", String(page));
    searchParams.set("limit", String(limit));
    if (search) searchParams.set("search", search);
    if (categoryId) searchParams.set("categoryId", String(categoryId));
    if (category) searchParams.set("category", category);
    if (minPrice !== undefined) searchParams.set("minPrice", String(minPrice));
    if (maxPrice !== undefined) searchParams.set("maxPrice", String(maxPrice));
    if (sort) searchParams.set("sort", sort);

    const response = await get<PaginatedResponse<BackendArticle>>(
        `/api/v1/articles?${searchParams.toString()}`,
    );

    const items = response.data?.items || [];
    const meta = response.meta || { total: items.length, page, limit };

    return {
        data: items,
        pagination: {
            page: meta.page,
            limit: meta.limit,
            total: meta.total,
            totalPages: Math.ceil(meta.total / meta.limit),
        },
    };
}

export async function getProductBySlug(slug: string): Promise<BackendArticle> {
    const response = await get<BackendArticle>(`/api/v1/articles/${slug}`);
    console.log("Response : ", response.data);
    return response.data;
}

export async function getProductById(id: number): Promise<BackendArticle> {
    const response = await get<BackendArticle>(`/api/v1/articles/${id}`);
    return response.data;
}

// === Compatibility aliases for legacy imports ===
/** @deprecated Use BackendArticle from @/types/api instead */
export type FrontendProduct = BackendArticle;
/** @deprecated Use fetchProducts instead */
export const fetchFrontendProducts = fetchProducts;
