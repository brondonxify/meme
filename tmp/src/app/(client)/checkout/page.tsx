"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Lock, Loader2, MapPin, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/context/cart-context";

export default function CheckoutPage() {
    const router = useRouter();
    const { items, total, subtotal } = useCart();

    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ["user-profile"],
        queryFn: async () => {
            try {
                return await authService.getProfile();
            } catch (e) {
                router.push('/');
                throw e;
            }
        },
        retry: false
    });

    const checkoutMutation = useMutation({
        mutationFn: (orderData: any) => ordersService.create(orderData),
        onSuccess: (order: any) => {
            router.push(`/payment/${order.id}`);
        }
    });

    const handleProcess = () => {
        if (!profile || !profile.id) return alert("Please log in to continue");
        if (items.length === 0) return alert("Cart is empty");

        if (!profile.address || !profile.city || !profile.postal_code) {
            return alert("Shipping information is incomplete. Please update your address in Account Settings.");
        }

        checkoutMutation.mutate({
            customer_id: profile.id,
            items: items.map(i => ({ article_id: i.id!, quantity: i.quantity }))
        });
    };

    const isInfoMissing = profile && (!profile.address || !profile.city || !profile.postal_code);

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] bg-gray-50">
                <Loader2 className="h-10 w-10 text-[#007185] animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8 text-black">
            <div className="container mx-auto px-4 max-w-5xl">
                <h1 className="text-3xl font-normal mb-6 text-gray-900">Checkout ({items.length} items)</h1>

                <div className="grid md:grid-cols-12 gap-6 items-start">
                    <div className="md:col-span-8 space-y-4">
                        {/* Shipping info */}
                        <Card className="bg-white border-gray-200 shadow-sm">
                            <CardHeader className="pb-3 border-b border-gray-200">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <span className="text-lg">1</span> Shipping address
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                {isInfoMissing && (
                                    <div className="bg-[#fff1f1] border border-[#c40000] p-3 rounded text-sm text-[#c40000] flex items-center justify-between">
                                        <span>Shipping address is incomplete.</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-xs bg-white border border-gray-300 text-black hover:bg-gray-50 px-3 shadow-sm rounded-md"
                                            onClick={() => router.push('/account')}
                                        >
                                            Update address
                                        </Button>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold text-gray-700">First Name</Label>
                                        <Input value={profile?.first_name || ""} disabled className="bg-gray-50 border-gray-300 text-gray-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold text-gray-700">Last Name</Label>
                                        <Input value={profile?.last_name || ""} disabled className="bg-gray-50 border-gray-300 text-gray-600" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-sm font-bold text-gray-700">Delivery Address</Label>
                                    <div className="grid grid-cols-1 gap-3">
                                        <Input
                                            value={profile?.address || "No address set"}
                                            disabled
                                            className={`bg-gray-50 border-gray-300 text-gray-600 ${!profile?.address ? 'border-red-300' : ''}`}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input
                                                value={profile?.city || "No city set"}
                                                disabled
                                                className={`bg-gray-50 border-gray-300 text-gray-600 ${!profile?.city ? 'border-red-300' : ''}`}
                                            />
                                            <Input
                                                value={profile?.postal_code || "No zip"}
                                                disabled
                                                className={`bg-gray-50 border-gray-300 text-gray-600 ${!profile?.postal_code ? 'border-red-300' : ''}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Items summary */}
                        <Card className="bg-white border-gray-200 shadow-sm">
                            <CardHeader className="pb-3 border-b border-gray-200">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <span className="text-lg">2</span> Review items and shipping
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-4">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-4 items-start">
                                        <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded flex items-center justify-center p-2 shrink-0">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                            ) : (
                                                <span className="text-[10px] text-gray-400 font-bold">IMAGE</span>
                                            )}
                                        </div>
                                        <div className="flex-1 text-sm">
                                            <p className="font-bold text-gray-900 leading-snug line-clamp-2">{item.name}</p>
                                            <p className="font-bold text-[#c40000] mt-1">${Number(item.price).toFixed(2)}</p>
                                            <p className="text-gray-500 mt-1">Qty: {item.quantity}</p>
                                            <p className="text-[#007600] text-xs mt-1 font-medium">In Stock</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-4">
                        <Card className="bg-white border-gray-200 shadow-sm sticky top-6">
                            <CardContent className="p-5 space-y-4">
                                <Button 
                                    className="w-full h-9 bg-[#ffd814] hover:bg-[#f7ca00] text-black border border-[#fcd200] rounded-full shadow-sm text-sm font-normal disabled:opacity-50 disabled:cursor-not-allowed" 
                                    onClick={handleProcess} 
                                    disabled={checkoutMutation.isPending || isInfoMissing || items.length === 0}
                                >
                                    {checkoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Place your order
                                </Button>
                                
                                <p className="text-xs text-center text-gray-600">
                                    By placing your order, you agree to our <span className="text-[#007185] hover:underline cursor-pointer">privacy notice</span> and <span className="text-[#007185] hover:underline cursor-pointer">conditions of use</span>.
                                </p>
                                
                                <Separator className="bg-gray-200" />
                                
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg mb-2">Order Summary</h3>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Items ({items.length}):</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Shipping & handling:</span>
                                        <span>$0.00</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 pt-1">
                                        <span>Total before tax:</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 border-b border-gray-200 pb-2">
                                        <span>Estimated tax to be collected:</span>
                                        <span>${(total - subtotal).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-xl pt-2 text-[#c40000]">
                                        <span>Order total:</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-gray-50 border-t border-gray-200 p-4 rounded-b-lg">
                                <div className="flex items-start gap-2 text-xs text-gray-600">
                                    <Lock className="h-4 w-4 shrink-0 text-gray-500" />
                                    <div>
                                        <div className="font-bold text-gray-700">Secure transaction</div>
                                        <div>Your transaction is encrypted securely.</div>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
