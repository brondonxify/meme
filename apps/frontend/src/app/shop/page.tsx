import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import Filters from "@/components/shop-page/filters";
import { FiSliders } from "react-icons/fi";
import ProductCard from "@/components/common/ProductCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { fetchProducts } from "@/services/products";
import type { BackendArticle } from "@/types/api";

function mapBackendToFrontendProduct(article: BackendArticle) {
  return {
    id: article.id,
    title: article.name,
    srcUrl: article.image_url || "/images/placeholder.png",
    gallery: article.image_url ? [article.image_url] : ["/images/placeholder.png"],
    price: article.selling_price,
    discount: {
      amount: 0,
      percentage: 0,
    },
    rating: 4.5,
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string; 
    search?: string; 
    sort?: string; 
    categoryId?: string; 
    category?: string;
    minPrice?: string; 
    maxPrice?: string;
  }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const limit = 9;
  const search = params.search;
  const sort = params.sort;
  const categoryId = params.categoryId;
  const category = params.category;
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;

  let products: ReturnType<typeof mapBackendToFrontendProduct>[] = [];
  let totalProducts = 0;
  let totalPages = 1;

  try {
    const result = await fetchProducts({ 
      page: currentPage, 
      limit, 
      search, 
      sort,
      categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
      category,
      minPrice,
      maxPrice
    });
    products = (result.data || []).map(mapBackendToFrontendProduct);
    totalProducts = result.pagination.total;
    totalPages = result.pagination.totalPages;
  } catch (error) {
    // Silently handle - products will show as empty
  }

  const startItem = totalProducts === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalProducts);

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop />
        <div className="flex md:space-x-5 items-start">
          <div className="hidden md:block min-w-[295px] max-w-[295px] border border-black/10 rounded-[20px] px-5 md:px-6 py-5 space-y-5 md:space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black text-xl">Filters</span>
              <a href="/shop" className="text-sm font-medium text-black/40 hover:text-black transition-colors">Reset</a>
            </div>
            <Filters />
          </div>
          <div className="flex flex-col w-full space-y-5">
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-2xl md:text-[32px]">All Products</h1>
                <MobileFilters />
              </div>
              <div className="flex flex-col sm:items-center sm:flex-row">
                <span className="text-sm md:text-base text-black/60 mr-3">
                  Showing {startItem}-{endItem} of {totalProducts} Products
                </span>
                <div className="flex items-center">
                  Sort by:{" "}
                  <Select defaultValue="most-popular">
                    <SelectTrigger className="font-medium text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="most-popular">Most Popular</SelectItem>
                      <SelectItem value="low-price">Low Price</SelectItem>
                      <SelectItem value="high-price">High Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} data={product} />
              ))}
            </div>
            <hr className="border-t-black/10" />
            <Pagination className="justify-between">
              <PaginationPrevious
                href={currentPage > 1 ? `/shop?page=${currentPage - 1}` : "#"}
                className={`border border-black/10 ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
              />
              <PaginationContent>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href={`/shop?page=${pageNum}`}
                        className="text-black/50 font-medium text-sm"
                        isActive={pageNum === currentPage}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {totalPages > 5 && (
                  <PaginationItem>
                    <PaginationEllipsis className="text-black/50 font-medium text-sm" />
                  </PaginationItem>
                )}
              </PaginationContent>

              <PaginationNext
                href={currentPage < totalPages ? `/shop?page=${currentPage + 1}` : "#"}
                className={`border border-black/10 ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
              />
            </Pagination>
          </div>
        </div>
      </div>
    </main>
  );
}
