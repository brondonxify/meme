"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AuthSection() {
    const router = useRouter();
    const { isAuthenticated, user, login, register, isLoading: authLoading } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const [regFirst, setRegFirst] = useState("");
    const [regLast, setRegLast] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setErrorMsg("");
        try {
            await login(loginEmail, loginPassword);
            router.push("/shop");
        } catch (error: any) {
            setErrorMsg(error.message || "Login failed");
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRegistering(true);
        setErrorMsg("");
        try {
            await register({
                first_name: regFirst,
                last_name: regLast,
                email: regEmail,
                password: regPassword
            });
            router.push("/shop");
        } catch (error: any) {
            setErrorMsg(error.message || "Registration failed");
        } finally {
            setIsRegistering(false);
        }
    };

    if (!mounted || authLoading) {
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
                <div className="mx-auto w-20 h-20 rounded-full bg-[#ff9900]/10 flex items-center justify-center">
                    <UserCircle className="h-12 w-12 text-[#ff9900]" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
                    <p className="text-gray-600 text-sm">Hello, {user?.first_name || 'User'}. Ready for new tech?</p>
                </div>
                <Button className="w-full bg-black hover:bg-black/80 text-white rounded-full h-12 text-sm font-semibold" onClick={() => router.push('/shop')}>
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
                <Card className="bg-white border-gray-200 shadow-sm mt-2 rounded-lg decoration-none">
                    <form onSubmit={handleLogin}>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {errorMsg && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{errorMsg}</div>}
                            <div className="space-y-1">
                                <Label htmlFor="email" className="text-sm font-bold text-gray-900">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    className="bg-white border-gray-300 focus-visible:ring-[#ff9900] focus-visible:border-[#ff9900] rounded-md"
                                    value={loginEmail}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password" title="password" className="text-sm font-bold text-gray-900">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    className="bg-white border-gray-300 focus-visible:ring-[#ff9900] focus-visible:border-[#ff9900] rounded-md"
                                    value={loginPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-[#ff9900] hover:bg-[#e28a00] text-black border-none shadow-sm rounded-full" disabled={isLoggingIn}>
                                {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign in
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </TabsContent>
            <TabsContent value="register">
                <Card className="bg-white border-gray-200 shadow-sm mt-2 rounded-lg">
                    <form onSubmit={handleRegister}>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl font-bold">Create account</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {errorMsg && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{errorMsg}</div>}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="first" className="text-sm font-bold text-gray-900">First name</Label>
                                    <Input
                                        id="first"
                                        placeholder="First name"
                                        className="bg-white border-gray-300 focus-visible:ring-[#ff9900] rounded-md"
                                        value={regFirst}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegFirst(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="last" className="text-sm font-bold text-gray-900">Last name</Label>
                                    <Input
                                        id="last"
                                        placeholder="Last name"
                                        className="bg-white border-gray-300 focus-visible:ring-[#ff9900] rounded-md"
                                        value={regLast}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegLast(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="reg-email" className="text-sm font-bold text-gray-900">Email</Label>
                                <Input
                                    id="reg-email"
                                    type="email"
                                    className="bg-white border-gray-300 focus-visible:ring-[#ff9900] rounded-md"
                                    value={regEmail}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="reg-password" title="register-password" className="text-sm font-bold text-gray-900">Password</Label>
                                <Input
                                    id="reg-password"
                                    type="password"
                                    placeholder="At least 6 characters"
                                    className="bg-white border-gray-300 focus-visible:ring-[#ff9900] rounded-md"
                                    value={regPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-[#ff9900] hover:bg-[#e28a00] text-black border-none shadow-sm rounded-full" disabled={isRegistering}>
                                {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continue
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
