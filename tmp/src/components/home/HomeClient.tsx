"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Cpu, Globe, Rocket, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function HomeClient() {
    const router = useRouter();
    const { isAuthenticated, user, login } = useAuth();
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

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-slate-950">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
                <div className="container relative px-4 flex flex-col lg:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6 text-center lg:text-left">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white">
                            The <span className="text-orange-500">Future</span> is in your hands
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0">
                            Explore cutting-edge tech at unbeatable prices. From raw power to seamless design.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => router.push('/products')}>
                                EXPLORE NOW
                            </Button>
                            <Button size="lg" variant="outline" className="border-orange-600 text-orange-500 hover:bg-orange-950">
                                LATEST ARRIVALS
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-md">
                        {isAuthenticated ? (
                            <Card className="bg-slate-900/50 backdrop-blur border-slate-800 p-8 text-center space-y-6">
                                <div className="mx-auto w-20 h-20 rounded-full bg-orange-600/20 flex items-center justify-center">
                                    <Rocket className="h-10 w-10 text-orange-500" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                                    <p className="text-slate-400">Hello, {user && 'first_name' in user ? user.first_name : 'User'}. Ready to shop?</p>
                                </div>
                                <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => router.push('/products')}>
                                    START SHOPPING
                                </Button>
                            </Card>
                        ) : (
                            <Tabs defaultValue="login" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-slate-900 border-none">
                                    <TabsTrigger value="login" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Log In</TabsTrigger>
                                    <TabsTrigger value="register" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Register</TabsTrigger>
                                </TabsList>
                                <TabsContent value="login">
                                    <Card className="bg-slate-900/50 backdrop-blur border-slate-800">
                                        <form onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(); }}>
                                            <CardHeader>
                                                <CardTitle className="text-orange-500">Welcome Back</CardTitle>
                                                <CardDescription className="text-slate-400">Enter your credentials to access your account.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="name@example.com"
                                                        className="bg-slate-950 border-slate-800"
                                                        value={loginEmail}
                                                        onChange={(e) => setLoginEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="password">Password</Label>
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        className="bg-slate-950 border-slate-800"
                                                        value={loginPassword}
                                                        onChange={(e) => setLoginPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button className="w-full bg-orange-600 hover:bg-orange-700" disabled={loginMutation.isPending}>
                                                    {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    SIGN IN
                                                </Button>
                                            </CardFooter>
                                        </form>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="register">
                                    <Card className="bg-slate-900/50 backdrop-blur border-slate-800">
                                        <form onSubmit={(e) => { e.preventDefault(); registerMutation.mutate(); }}>
                                            <CardHeader>
                                                <CardTitle className="text-orange-500">Create Account</CardTitle>
                                                <CardDescription className="text-slate-400">Join our tech community today.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="first">First Name</Label>
                                                        <Input
                                                            id="first"
                                                            placeholder="John"
                                                            className="bg-slate-950 border-slate-800"
                                                            value={regFirst}
                                                            onChange={(e) => setRegFirst(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="last">Last Name</Label>
                                                        <Input
                                                            id="last"
                                                            placeholder="Doe"
                                                            className="bg-slate-950 border-slate-800"
                                                            value={regLast}
                                                            onChange={(e) => setRegLast(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="reg-email">Email</Label>
                                                    <Input
                                                        id="reg-email"
                                                        type="email"
                                                        placeholder="name@example.com"
                                                        className="bg-slate-950 border-slate-800"
                                                        value={regEmail}
                                                        onChange={(e) => setRegEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="reg-password">Password</Label>
                                                    <Input
                                                        id="reg-password"
                                                        type="password"
                                                        className="bg-slate-950 border-slate-800"
                                                        value={regPassword}
                                                        onChange={(e) => setRegPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button className="w-full bg-orange-600 hover:bg-orange-700" disabled={registerMutation.isPending}>
                                                    {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    GET STARTED
                                                </Button>
                                            </CardFooter>
                                        </form>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                </div>
            </section>

            {/* Features/Stats Section */}
            <section className="py-20 bg-slate-900 border-y border-slate-800">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="text-center space-y-2">
                        <Zap className="h-10 w-10 text-orange-500 mx-auto" />
                        <h3 className="font-bold">Fast Delivery</h3>
                        <p className="text-sm text-slate-400">Global shipping in 48h</p>
                    </div>
                    <div className="text-center space-y-2">
                        <Cpu className="h-10 w-10 text-orange-500 mx-auto" />
                        <h3 className="font-bold">latest Tech</h3>
                        <p className="text-sm text-slate-400">Direct from manufacturers</p>
                    </div>
                    <div className="text-center space-y-2">
                        <Globe className="h-10 w-10 text-orange-500 mx-auto" />
                        <h3 className="font-bold">24/7 Support</h3>
                        <p className="text-sm text-slate-400">Always here to help</p>
                    </div>
                    <div className="text-center space-y-2">
                        <Rocket className="h-10 w-10 text-orange-500 mx-auto" />
                        <h3 className="font-bold">Innovation</h3>
                        <p className="text-sm text-slate-400">Leading the digital curve</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
