"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersService } from "@/services/customers.service";
import { authService } from "@/services/auth.service";
import { ordersService } from "@/services/orders.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, Package, Shield, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";

export default function AccountPage() {
    const router = useRouter();
    const { isAdmin, user: authUser } = useAuth();
    const [profileData, setProfileData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("profile");

    useEffect(() => {
        if (isAdmin) {
            router.push('/admin');
        }
    }, [isAdmin, router]);

    // Check auth and fetch profile
    const { data: profile, isLoading, isError } = useQuery({
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

    // Fetch order history
    const { data: orders, isLoading: ordersLoading } = useQuery({
        queryKey: ["order-history", profile?.id],
        queryFn: () => ordersService.getByCustomer(profile!.id!),
        enabled: !!profile?.id,
    });

    useEffect(() => {
        if (profile) setProfileData(profile);
    }, [profile]);

    const queryClient = useQueryClient();
    const updateMutation = useMutation({
        mutationFn: (data: any) => customersService.update(profile!.id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
            alert("Profile updated successfully");
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] bg-gray-50">
                <Loader2 className="h-10 w-10 text-[#007185] animate-spin" />
            </div>
        );
    }

    if (isError || !profile) return null;

    return (
        <div className="bg-gray-50 min-h-screen py-10 text-black">
            <div className="container mx-auto px-4 max-w-5xl">
                <h1 className="text-3xl font-normal mb-8">Your Account</h1>
                
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Sidebar menu */}
                    <Card className="w-full md:w-64 bg-white border-gray-200 shadow-sm rounded-lg overflow-hidden shrink-0">
                        <CardHeader className="text-center bg-gray-50 border-b border-gray-200 py-6">
                            <div className="mx-auto mb-3">
                                <Avatar className="h-20 w-20 border-2 border-white shadow-sm bg-gray-100">
                                    <AvatarFallback className="text-[#007185] text-2xl font-bold bg-gray-100">
                                        {(profile?.first_name?.[0] || "?")}{(profile?.last_name?.[0] || "?")}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <CardTitle className="text-lg text-gray-900">{profile.first_name} {profile.last_name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="flex flex-col">
                                <Button
                                    variant="ghost"
                                    className={`justify-start rounded-none h-14 px-6 border-l-4 ${activeTab === 'profile' ? 'border-[#007185] bg-gray-50 text-[#007185] font-bold' : 'border-transparent text-gray-700 font-normal hover:bg-gray-50'}`}
                                    onClick={() => setActiveTab('profile')}
                                >
                                    <User className="mr-3 h-5 w-5" /> Login & security
                                </Button>
                                <Button
                                    variant="ghost"
                                    className={`justify-start rounded-none h-14 px-6 border-l-4 ${activeTab === 'orders' ? 'border-[#007185] bg-gray-50 text-[#007185] font-bold' : 'border-transparent text-gray-700 font-normal hover:bg-gray-50'}`}
                                    onClick={() => setActiveTab('orders')}
                                >
                                    <Package className="mr-3 h-5 w-5" /> Your Orders
                                </Button>
                                <Button
                                    variant="ghost"
                                    className={`justify-start rounded-none h-14 px-6 border-l-4 ${activeTab === 'addresses' ? 'border-[#007185] bg-gray-50 text-[#007185] font-bold' : 'border-transparent text-gray-700 font-normal hover:bg-gray-50'}`}
                                    onClick={() => setActiveTab('addresses')}
                                >
                                    <Settings className="mr-3 h-5 w-5" /> Your Addresses
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Main Content */}
                    <div className="flex-1 w-full min-w-0">
                        {activeTab === 'profile' && (
                            <Card className="bg-white border-gray-200 shadow-sm rounded-lg animate-in fade-in duration-300">
                                <CardHeader className="border-b border-gray-200 pb-4">
                                    <CardTitle className="text-2xl font-normal">Login & security</CardTitle>
                                    <CardDescription className="text-gray-500">Edit your name, mobile number, and email address.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="space-y-4 max-w-lg">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold text-gray-900">First Name</Label>
                                            <Input
                                                value={profileData?.first_name || ""}
                                                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                                className="bg-white border-gray-400 focus-visible:ring-[#e77600] focus-visible:border-[#e77600] rounded-[3px] shadow-[0_1px_2px_rgba(15,17,17,.15)_inset]"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold text-gray-900">Last Name</Label>
                                            <Input
                                                value={profileData?.last_name || ""}
                                                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                                                className="bg-white border-gray-400 focus-visible:ring-[#e77600] focus-visible:border-[#e77600] rounded-[3px] shadow-[0_1px_2px_rgba(15,17,17,.15)_inset]"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold text-gray-900">Email</Label>
                                            <Input value={profile.email} disabled className="bg-gray-100 border-gray-300 opacity-70 cursor-not-allowed" />
                                            <p className="text-xs text-gray-500">To change your email address, please contact support.</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold text-gray-900">Mobile phone number</Label>
                                            <Input
                                                value={profileData?.phone || ""}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                className="bg-white border-gray-400 focus-visible:ring-[#e77600] focus-visible:border-[#e77600] rounded-[3px] shadow-[0_1px_2px_rgba(15,17,17,.15)_inset]"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4">
                                        <Button
                                            className="bg-[#ffd814] hover:bg-[#f7ca00] text-black border border-[#fcd200] rounded-full shadow-sm text-sm font-normal px-6"
                                            disabled={updateMutation.isPending}
                                            onClick={() => updateMutation.mutate(profileData)}
                                        >
                                            {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save changes"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        
                        {activeTab === 'addresses' && (
                            <Card className="bg-white border-gray-200 shadow-sm rounded-lg animate-in fade-in duration-300">
                                <CardHeader className="border-b border-gray-200 pb-4">
                                    <CardTitle className="text-2xl font-normal">Your Addresses</CardTitle>
                                    <CardDescription className="text-gray-500">Edit your default shipping address for faster checkout.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    <div className="space-y-4 max-w-lg">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold text-gray-900">Street Address</Label>
                                            <Input
                                                value={profileData?.address || ""}
                                                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                                className="bg-white border-gray-400 focus-visible:ring-[#e77600] focus-visible:border-[#e77600] rounded-[3px] shadow-[0_1px_2px_rgba(15,17,17,.15)_inset]"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-sm font-bold text-gray-900">City</Label>
                                                <Input
                                                    value={profileData?.city || ""}
                                                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                                    className="bg-white border-gray-400 focus-visible:ring-[#e77600] focus-visible:border-[#e77600] rounded-[3px] shadow-[0_1px_2px_rgba(15,17,17,.15)_inset]"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-sm font-bold text-gray-900">ZIP / Postal Code</Label>
                                                <Input
                                                    value={profileData?.postal_code || ""}
                                                    onChange={(e) => setProfileData({ ...profileData, postal_code: e.target.value })}
                                                    className="bg-white border-gray-400 focus-visible:ring-[#e77600] focus-visible:border-[#e77600] rounded-[3px] shadow-[0_1px_2px_rgba(15,17,17,.15)_inset]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4">
                                        <Button
                                            className="bg-[#ffd814] hover:bg-[#f7ca00] text-black border border-[#fcd200] rounded-full shadow-sm text-sm font-normal px-6"
                                            disabled={updateMutation.isPending}
                                            onClick={() => updateMutation.mutate(profileData)}
                                        >
                                            {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save address"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'orders' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <h2 className="text-2xl font-normal mb-6 text-gray-900">Your Orders</h2>
                                {ordersLoading ? (
                                    <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-[#007185] animate-spin" /></div>
                                ) : orders && orders.length > 0 ? (
                                    orders.map((ord: any) => (
                                        <Card key={ord.id} className="bg-white border-gray-200 shadow-sm rounded-lg overflow-hidden">
                                            <div className="bg-gray-100 px-5 py-3 border-b border-gray-200 text-sm text-gray-600 flex flex-wrap gap-x-8 gap-y-2 justify-between items-center whitespace-nowrap">
                                                <div className="flex gap-8">
                                                    <div>
                                                        <div className="uppercase mb-0.5 text-xs text-gray-500">Order placed</div>
                                                        <div>{new Date(ord.order_date).toLocaleDateString()}</div>
                                                    </div>
                                                    <div>
                                                        <div className="uppercase mb-0.5 text-xs text-gray-500">Total</div>
                                                        <div>${ord.total_amount}</div>
                                                    </div>
                                                    <div>
                                                        <div className="uppercase mb-0.5 text-xs text-gray-500">Ship to</div>
                                                        <div><span className="text-[#007185] hover:underline cursor-pointer">{profile.first_name} {profile.last_name}</span></div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-1 sm:flex-none">
                                                    <div className="uppercase mb-0.5 text-xs text-gray-500">Order # {ord.id}</div>
                                                    <div className="flex gap-2 justify-end">
                                                        <span className="text-[#007185] hover:underline cursor-pointer">View order details</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div className="space-y-2">
                                                    <h3 className="font-bold text-lg text-gray-900">
                                                        {ord.status === 'delivered' ? 'Delivered' : ord.status === 'processing' ? 'Processing' : 'Status: ' + ord.status}
                                                    </h3>
                                                </div>
                                                <Button
                                                    className="w-full sm:w-auto bg-white border border-gray-300 text-black hover:bg-gray-50 rounded-full shadow-sm text-sm"
                                                    onClick={() => router.push(`/delivery/${ord.id}`)}
                                                >
                                                    Track package
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="bg-white border text-center border-gray-200 rounded-lg py-12 px-4 shadow-sm">
                                        <p className="text-gray-900 font-medium mb-2">You have not placed any orders yet.</p>
                                        <Button 
                                            onClick={() => router.push('/products')}
                                            className="mt-2 bg-[#ffd814] hover:bg-[#f7ca00] text-black border border-[#fcd200] rounded-full shadow-sm"
                                        >
                                            Continue shopping
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
