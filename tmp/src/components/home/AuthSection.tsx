"use client";

import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function AuthSection() {
    const router = useRouter();
    const { isAuthenticated, user, login } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [regFirst, setRegFirst] = useState("");
    const [regLast, setRegLast] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");

    const loginMutation = useMutation({
        mutationFn: () => login({ email: loginEmail, password: loginPassword }),
        onSuccess: () => {
            router.push("/products");
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || "Login failed");
        }
    });

    const registerMutation = useMutation({
        mutationFn: () => authService.register({
            first_name: regFirst,
            last_name: regLast,
            email: regEmail,
            password: regPassword
        }),
        onSuccess: () => {
            alert("Registration successful! Please log in.");
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || "Registration failed");
        }
    });

    if (!mounted) {
        return (
            <div className="w-full space-y-4">
                <div className="h-10 w-full bg-gray-100 animate-pulse rounded-lg" />
                <div className="h-64 w-full bg-gray-50 animate-pulse rounded-xl" />
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <Card className="bg-white border-gray-200 p-8 text-center space-y-6 shadow-sm">
                <div className="mx-auto w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                    <UserCircle className="h-12 w-12 text-[#007185]" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
                    <p className="text-gray-600 text-sm">Hello, {user && 'first_name' in user ? user.first_name : 'User'}. Ready to shop?</p>
                </div>
                <Button className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-black border border-[#fcd200] shadow-sm rounded-full h-12 text-sm font-semibold" onClick={() => router.push('/products')}>
                    CONTINUE SHOPPING
                </Button>
            </Card>
        );
    }

    return (
        <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 border border-gray-200 p-1 rounded-md">
                <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">Sign in</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <Card className="bg-white border-gray-200 shadow-sm mt-2 rounded-lg">
                    <form onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(); }}>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="email" className="text-sm font-bold text-gray-900">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    className="bg-white border-gray-400 focus-visible:ring-[#e77600] focus-visible:border-[#e77600] rounded-[3px] shadow-[0_1px_2px_rgba(15,17,17,.15)_inset]"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password" title="password" className="text-sm font-bold text-gray-900">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    className="bg-white border-gray-400 focus-visible:ring-[#e77600] focus-visible:border-[#e77600] rounded-[3px] shadow-[0_1px_2px_rgba(15,17,17,.15)_inset]"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-black border border-[#fcd200] shadow-sm rounded-full hover:shadow-md transition-shadow" disabled={loginMutation.isPending}>
                                {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign in
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </TabsContent>
            <TabsContent value="register">
                <Card className="bg-white border-gray-200 shadow-sm mt-2 rounded-lg">
                    <form onSubmit={(e) => { e.preventDefault(); registerMutation.mutate(); }}>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl font-bold">Create account</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="first" className="text-sm font-bold text-gray-900">First name</Label>
                                    <Input
                                        id="first"
                                        placeholder="First name"
                                        className="bg-white border-gray-400 focus-visible:ring-[#e77600] focus-visible:border-[#e77600] rounded-[3px] shadow-[0_1px_2px_rgba(15,17,17,.15)_inset]"
                                        value={regFirst}
                                        onChange={(e) => setRegFirst(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="last" className="text-sm font-bold text-gray-900">Last name</Label>
                                    <Input
                                        id="last"
                                        placeholder="Last name"
                                        className="bg-white border-gray-400 focus-visible:ring-[#e77600] focus-visible:border-[#e77600] rounded-[3px] shadow-[0_1px_2px_rgba(15,17,17,.15)_inset]"
                                        value={regLast}
                                        onChange={(e) => setRegLast(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="reg-email" className="text-sm font-bold text-gray-900">Email</Label>
                                <Input
                                    id="reg-email"
                                    type="email"
                                    className="bg-white border-gray-400 focus-visible:ring-[#e77600] focus-visible:border-[#e77600] rounded-[3px] shadow-[0_1px_2px_rgba(15,17,17,.15)_inset]"
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="reg-password" title="register-password" className="text-sm font-bold text-gray-900">Password</Label>
                                <Input
                                    id="reg-password"
                                    type="password"
                                    placeholder="At least 6 characters"
                                    className="bg-white border-gray-400 focus-visible:ring-[#e77600] focus-visible:border-[#e77600] rounded-[3px] shadow-[0_1px_2px_rgba(15,17,17,.15)_inset]"
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-[#f3a847] hover:bg-[#e29735] text-black border border-[#a88734] shadow-sm rounded-sm hover:shadow-md transition-shadow" disabled={registerMutation.isPending}>
                                {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continue
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
