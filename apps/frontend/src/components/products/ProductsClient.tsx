"use client";

import { useQuery } from "@tanstack/react-query";
import { articlesService } from "@/services/articles.service";
import { categoriesService } from "@/services/categories.service";
import { specificationsService } from "@/services/specifications.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Filter, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductDetailClient } from "./ProductDetailClient";
import { useQueryState, parseAsInteger, parseAsArrayOf } from "nuqs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductsClient() {
    const router = useRouter();
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

    // nuqs hooks for URL-synced state
    const [search, setSearch] = useQueryState("search", {
        defaultValue: "",
        shallow: false,
        throttleMs: 500
    });

    const [selectedCategoryId, setSelectedCategoryId] = useQueryState("category",
        parseAsInteger.withDefault(0)
    );

    const [selectedSpecs, setSelectedSpecs] = useQueryState("specs",
        parseAsArrayOf(parseAsInteger).withDefault([])
    );

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesService.getAll(),
    });

    const { data: specifications } = useQuery({
        queryKey: ["specifications"],
        queryFn: () => specificationsService.getAll(),
    });

    const { data: paginatedData, isLoading, isError } = useQuery({
        queryKey: ["products", search, selectedCategoryId, selectedSpecs],
        queryFn: () => articlesService.getAll({
            search: search || undefined,
            category: selectedCategoryId > 0 ? selectedCategoryId : undefined,
            specs: selectedSpecs.length > 0 ? selectedSpecs : undefined
        }),
    });

    const products = paginatedData?.data || [];

    const toggleCategory = (id: number) => {
        if (selectedCategoryId === id) {
            setSelectedCategoryId(0);
        } else {
            setSelectedCategoryId(id);
        }
    };

    const toggleSpec = (id: number) => {
        if (selectedSpecs.includes(id)) {
            setSelectedSpecs(selectedSpecs.filter(sid => sid !== id));
        } else {
            setSelectedSpecs([...selectedSpecs, id]);
        }
    };

    return (
        <div className="bg-white min-h-screen text-black">
            {/* Sticky Header */}
            <div className="bg-white border-b border-gray-200 py-3 shadow-sm z-30 relative shrink-0">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold font-serif">Results</h1>
                        <p className="text-gray-600 text-sm">
                            {isLoading ? "Searching products..." : `Check each product page for other buying options.`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full md:w-56 space-y-6 flex-shrink-0">
                    <div className="space-y-3">
                        <h3 className="font-bold text-sm text-gray-900">Department</h3>
                        <div className="space-y-2">
                            {categories?.map((cat) => (
                                <div key={cat.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`cat-${cat.id}`}
                                        className="border-gray-400 text-[#ff9900] data-[state=checked]:bg-[#ff9900] data-[state=checked]:border-[#ff9900] rounded-sm"
                                        checked={selectedCategoryId === cat.id!}
                                        onCheckedChange={() => toggleCategory(cat.id!)}
                                    />
                                    <label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer hover:text-[#e47911]">
                                        {cat.name}
                                    </label>
                                </div>
                            ))}
                            {!categories && (
                                <div className="space-y-2 opacity-50">
                                    {[1, 2, 3].map(i => <div key={i} className="h-4 bg-gray-200 rounded w-full animate-pulse" />)}
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    <div className="space-y-3">
                        <h3 className="font-bold text-sm text-gray-900">Specifications</h3>
                        <div className="space-y-2">
                            {specifications?.map((spec) => (
                                <div key={spec.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`spec-${spec.id}`}
                                        className="border-gray-400 text-[#ff9900] data-[state=checked]:bg-[#ff9900] data-[state=checked]:border-[#ff9900] rounded-sm"
                                        checked={selectedSpecs.includes(spec.id!)}
                                        onCheckedChange={() => toggleSpec(spec.id!)}
                                    />
                                    <label htmlFor={`spec-${spec.id}`} className="text-sm cursor-pointer hover:text-[#e47911]">
                                        {spec.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Products Content */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="h-10 w-10 text-[#ff9900] animate-spin" />
                            <p className="text-gray-500 text-sm">Loading products...</p>
                        </div>
                    ) : isError ? (
                        <div className="text-center py-12 border border-red-200 bg-red-50 rounded-lg">
                            <p className="text-red-700 font-bold mb-2">Error connecting to server</p>
                            <Button size="sm" variant="outline" className="bg-white border-gray-300 text-black hover:bg-gray-50" onClick={() => window.location.reload()}>Retry</Button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 border border-gray-200 rounded-lg bg-gray-50">
                            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-900 font-bold text-lg mb-2">No results for {search ? `"${search}"` : "your selection"}</p>
                            <p className="text-gray-500 text-sm mb-4">Try checking your spelling or use more general terms</p>
                            <Button variant="link" className="text-[#007185] hover:text-[#c40000] p-0 h-auto" onClick={() => { setSearch(""); setSelectedCategoryId(0); setSelectedSpecs([]); }}>Clear all filters</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {products.map((product) => (
                                <Card key={product.id} className="bg-white border-gray-200 overflow-hidden flex flex-col group hover:shadow-lg transition-shadow rounded-lg">
                                    <CardHeader className="p-4 flex-shrink-0 cursor-pointer" onClick={() => router.push(`/products/${product.id}`)}>
                                        <div className="aspect-square bg-gray-50 flex items-center justify-center relative rounded-md overflow-hidden">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                    <span className="text-gray-400 font-bold text-2xl">No Image</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-4 py-1 flex-1 flex flex-col cursor-pointer" onClick={() => router.push(`/products/${product.id}`)}>
                                        <CardTitle className="text-sm sm:text-base font-normal text-[#007185] group-hover:text-[#c40000] line-clamp-3 leading-snug mb-1">
                                            {product.name}
                                        </CardTitle>
                                        <div className="flex items-start text-black mb-1">
                                            <span className="text-xs font-semibold relative top-[2px]">$</span>
                                            <span className="text-2xl font-bold">{Math.floor(Number(product.price))}</span>
                                            <span className="text-xs font-semibold relative top-[2px]">{(Number(product.price) % 1).toFixed(2).substring(2)}</span>
                                        </div>
                                        {product.stock_quantity > 0 ? (
                                            <p className="text-xs text-[#007600] font-medium mt-1">In Stock</p>
                                        ) : (
                                            <p className="text-xs text-[#B12704] font-medium mt-1">Currently unavailable.</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{product.description}</p>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-4 mt-auto">
                                        <Button
                                            className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-black border border-[#fcd200] rounded-full shadow-sm text-sm"
                                            disabled={product.stock_quantity <= 0}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProductId(product.id!);
                                            }}
                                        >
                                            Quick View
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={!!selectedProductId} onOpenChange={(open) => !open && setSelectedProductId(null)}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none [&>button]:hidden">
                    <DialogTitle className="sr-only">Product Quick View</DialogTitle>
                    {selectedProductId && (
                        <div className="bg-white rounded-xl shadow-2xl relative overflow-hidden">
                            <Button 
                                variant="ghost" 
                                className="absolute right-4 top-4 z-50 rounded-full w-8 h-8 p-0 bg-slate-100/50 hover:bg-slate-200" 
                                onClick={() => setSelectedProductId(null)}
                            >
                                ✕
                            </Button>
                            <ProductDetailClient id={selectedProductId.toString()} isPopup={true} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
