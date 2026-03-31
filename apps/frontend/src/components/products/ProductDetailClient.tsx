"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { articlesService } from "@/services/articles.service";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ShieldCheck, Truck, Loader2, MapPin } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ProductDetailSkeleton } from "./ProductDetailSkeleton";

export function ProductDetailClient({ id, isPopup = false }: { id: string, isPopup?: boolean }) {
    const router = useRouter();
    const { addToCart } = useCart();

    const { data: product, isLoading, isError } = useQuery({
        queryKey: ["product", id],
        queryFn: () => articlesService.getById(Number(id)),
    });

    const handleAddToCart = () => {
        if (product) {
            addToCart(product);
            router.push('/cart');
        }
    };

    if (isLoading) {
        return <ProductDetailSkeleton />;
    }

    if (isError || !product) {
        return (
            <div className="py-20 text-center bg-white min-h-[60vh] flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-red-600">Product Not Found</h1>
                <p className="text-gray-500 mt-2">The product you're looking for might have been removed or unavailable.</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push('/products')}>Back to Results</Button>
            </div>
        );
    }

    return (
        <div className={`bg-white text-black ${!isPopup ? 'min-h-screen' : ''}`}>
            <div className={`container mx-auto px-4 ${!isPopup ? 'py-6 md:py-12' : 'py-6'}`}>
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in duration-500">
                    {/* Product Image Column */}
                    <div className="lg:col-span-4 xl:col-span-5 flex flex-col gap-4">
                        <div className="aspect-square bg-white rounded-lg border border-gray-200 flex items-center justify-center relative group p-6 shadow-sm">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <span className="text-2xl font-bold text-gray-300 select-none">No Image</span>
                            )}
                        </div>
                    </div>

                    {/* Product Info Column */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl md:text-3xl font-normal text-gray-900 leading-tight">{product.name}</h1>
                            <a href="#" className="text-sm text-[#007185] hover:text-[#c40000] hover:underline">Visit the Store</a>
                        </div>

                        <Separator className="bg-gray-200" />

                        <div className="space-y-2">
                            <div className="flex items-start text-black">
                                <span className="text-sm font-semibold relative top-[3px]">$</span>
                                <span className="text-4xl font-medium">{Math.floor(Number(product.price))}</span>
                                <span className="text-sm font-semibold relative top-[3px]">{(Number(product.price) % 1).toFixed(2).substring(2)}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                                <span className="text-[#007185] hover:underline cursor-pointer">FREE Returns</span>
                            </div>
                        </div>

                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                            {product.description || "No description available for this product."}
                        </p>

                        <div className="pt-2">
                            <table className="text-sm w-full divide-y divide-gray-100 table-fixed">
                                <tbody>
                                    <tr className="py-2">
                                        <td className="w-1/3 py-2 font-bold text-gray-700">Brand</td>
                                        <td className="w-2/3 py-2 text-gray-900">Generic</td>
                                    </tr>
                                    <tr className="py-2">
                                        <td className="w-1/3 py-2 font-bold text-gray-700">Model Name</td>
                                        <td className="w-2/3 py-2 text-gray-900">{product.name}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Buy Box Column */}
                    <div className="lg:col-span-3">
                        <Card className="bg-white border-gray-200 p-5 shadow-sm rounded-lg sticky top-24">
                            <div className="space-y-4">
                                <div className="flex items-start text-black">
                                    <span className="text-sm font-semibold relative top-[2px]">$</span>
                                    <span className="text-3xl font-medium">{Math.floor(Number(product.price))}</span>
                                    <span className="text-sm font-semibold relative top-[2px]">{(Number(product.price) % 1).toFixed(2).substring(2)}</span>
                                </div>

                                <div className="text-sm text-gray-600">
                                    <p><span className="text-[#007185] hover:underline cursor-pointer">FREE Prime Delivery</span></p>
                                    <div className="flex items-start gap-1 mt-2 text-[#007185]">
                                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                        <span className="hover:underline cursor-pointer">Deliver to User - Location</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    {product.stock_quantity > 0 ? (
                                        <h4 className="text-[#007600] text-lg font-medium">In Stock</h4>
                                    ) : (
                                        <h4 className="text-[#b12704] text-lg font-medium">Currently unavailable.</h4>
                                    )}
                                </div>

                                <div className="space-y-2 pt-2">
                                    <Button
                                        className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-black border border-[#fcd200] rounded-full shadow-sm text-sm h-10 font-normal"
                                        disabled={product.stock_quantity <= 0}
                                        onClick={handleAddToCart}
                                    >
                                        Add to Cart
                                    </Button>
                                    <Button
                                        className="w-full bg-[#ffa41c] hover:bg-[#fa8900] text-black border border-[#ff8f00] rounded-full shadow-sm text-sm h-10 font-normal"
                                        disabled={product.stock_quantity <= 0}
                                        onClick={handleAddToCart}
                                    >
                                        Buy Now
                                    </Button>
                                </div>

                                <div className="text-xs text-gray-500 pt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                                    <span className="text-gray-500">Ships from</span>
                                    <span>HI-TECH</span>
                                    <span className="text-gray-500">Sold by</span>
                                    <span>HI-TECH</span>
                                    <span className="text-gray-500">Returns</span>
                                    <Popover>
                                        <PopoverTrigger className="text-[#007185] hover:underline cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-orange-500 focus:ring-offset-1 rounded-sm">
                                            Eligible for Return, Refund or Replacement within 30 days of receipt
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-4 text-sm bg-white shadow-xl border border-gray-200 text-gray-800">
                                            <h4 className="font-bold mb-2">Return Policy</h4>
                                            <p>This item can be returned in its original condition for a full refund or replacement within 30 days of receipt. Read full return policy.</p>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex items-center gap-1 text-[#007185] text-xs pt-1 cursor-pointer hover:underline">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>Secure transaction</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
