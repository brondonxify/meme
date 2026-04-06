"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";

export default function CartPage() {
    const router = useRouter();
    const { items, updateQuantity, removeFromCart, subtotal, total } = useCart();

    const tax = total - subtotal;

    if (items.length === 0) {
        return (
            <div className="bg-white min-h-[70vh] flex flex-col items-center justify-center space-y-6">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Your Amazon Cart is empty</h2>
                    <p className="text-[#007185] hover:text-[#c40000] hover:underline cursor-pointer text-sm">Shop today's deals</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => router.push('/login')} className="bg-[#ffd814] hover:bg-[#f7ca00] text-black border border-[#fcd200] shadow-sm rounded-lg px-8">
                        Sign in to your account
                    </Button>
                    <Button onClick={() => router.push('/register')} variant="outline" className="bg-white border-gray-300 text-black hover:bg-gray-50 rounded-lg shadow-sm">
                        Sign up now
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen py-6 md:py-10 text-black">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid lg:grid-cols-4 gap-6 items-start">
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white p-6 shadow-sm border border-gray-200">
                            <h1 className="text-3xl font-normal text-gray-900 mb-2">Shopping Cart</h1>
                            <div className="text-right text-sm text-gray-600 font-medium mb-1 border-b border-gray-200 pb-2">Price</div>
                            
                            <div className="space-y-6 divide-y divide-gray-200">
                                {items.map((item) => (
                                    <div key={item.id} className="pt-6 flex gap-6 sm:gap-8 flex-col sm:flex-row">
                                        <div className="w-full sm:w-40 aspect-square bg-gray-50 rounded border border-gray-200 flex flex-col items-center justify-center shrink-0">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                            ) : (
                                                <span className="text-gray-400 font-bold select-none text-sm">NO IMAGE</span>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1 pr-4">
                                                    <h3 className="text-lg font-medium text-[#007185] hover:text-[#c40000] hover:underline cursor-pointer leading-snug line-clamp-2">{item.name}</h3>
                                                    <p className="text-xs text-[#007600] font-medium">In Stock</p>
                                                    <div className="flex items-center gap-2 pt-1 text-xs text-gray-500">
                                                        <input type="checkbox" className="rounded-sm border-gray-300" />
                                                        <label>This is a gift <span className="text-[#007185] hover:underline cursor-pointer">Learn more</span></label>
                                                    </div>
                                                </div>
                                                <p className="font-bold text-lg whitespace-nowrap">${Number(item.price).toFixed(2)}</p>
                                            </div>

                                            <div className="mt-4 flex items-center gap-4 flex-wrap">
                                                <div className="flex items-center bg-gray-100 rounded-full border border-gray-300 shadow-sm overflow-hidden h-8">
                                                    <Button variant="ghost" className="h-full px-3 hover:bg-gray-200 rounded-none text-gray-700" onClick={() => updateQuantity(item.id!, item.quantity - 1)}>
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-sm font-semibold bg-white h-full flex items-center justify-center border-x border-gray-300">{item.quantity}</span>
                                                    <Button variant="ghost" className="h-full px-3 hover:bg-gray-200 rounded-none text-gray-700" onClick={() => updateQuantity(item.id!, item.quantity + 1)}>
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
                                                <button className="text-sm text-[#007185] hover:underline" onClick={() => removeFromCart(item.id!)}>Delete</button>
                                                <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
                                                <button className="text-sm text-[#007185] hover:underline">Save for later</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-4 mt-6 border-t border-gray-200">
                                <p className="text-lg font-normal">Subtotal ({items.length} items): <span className="font-bold">${subtotal.toFixed(2)}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="bg-white border-gray-200 shadow-sm rounded-lg sticky top-6">
                            <CardContent className="p-5 space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-normal leading-tight">
                                        Subtotal ({items.length} items): <span className="font-bold">${subtotal.toFixed(2)}</span>
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <input type="checkbox" id="gift-main" className="rounded-sm border-gray-300 accent-[#007185]" />
                                        <label htmlFor="gift-main">This order contains a gift</label>
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-9 bg-[#ffd814] hover:bg-[#f7ca00] text-black border border-[#fcd200] rounded-full shadow-sm text-sm font-normal"
                                    onClick={() => router.push('/checkout')}
                                >
                                    Proceed to checkout
                                </Button>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-white border-gray-200 shadow-sm rounded-lg mt-4 hidden lg:block">
                            <CardContent className="p-4 space-y-3">
                                <h4 className="font-bold text-sm">Customers who bought items in your cart also bought</h4>
                                <div className="space-y-3">
                                    {/* Placeholder related items */}
                                    <div className="flex gap-2">
                                        <div className="w-16 h-16 bg-gray-100 rounded"></div>
                                        <div>
                                            <p className="text-xs text-[#007185] hover:underline line-clamp-2 cursor-pointer">Premium USB-C Cable 6ft Braided Fast Charging</p>
                                            <p className="text-[#c40000] font-bold text-sm mt-1">$12.99</p>
                                            <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 mt-1 rounded-full">Add to cart</Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
