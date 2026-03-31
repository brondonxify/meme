"use client";

import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2, Lock, Terminal, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";

export default function AdminLoginPage() {
    const router = useRouter();
    const { adminLogin, isAdmin, isAuthenticated } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isAdmin) {
            router.push("/admin");
        }
    }, [isAdmin, router]);

    const loginMutation = useMutation({
        mutationFn: () => adminLogin({ email, password }),
        onSuccess: () => {
            router.push("/admin");
        },
        onError: (error: any) => {
            alert(error.response?.data?.message || "Admin authorization failed. Trace rejected.");
        }
    });

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10 space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                        <ShieldAlert className="h-3 w-3" /> RESTRICTED_AREA
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                        SYSTEM <span className="text-orange-500 text-glow-orange">ADMIN</span>
                    </h1>
                    <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">
                        Kernel Access Point // Secure Handshake Required
                    </p>
                </div>

                <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800 shadow-2xl relative overflow-hidden border-t-orange-500/50">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                        <Terminal className="h-24 w-24 text-white" />
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(); }}>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                                <Lock className="h-4 w-4 text-orange-500" /> AUTHORIZATION
                            </CardTitle>
                            <CardDescription className="text-slate-500 font-mono text-[10px]">VERIFY_SIGNATURE_TO_GAIN_SUDO_ACCESS</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-black text-slate-400 tracking-widest uppercase">Admin Identifier</Label>
                                <div className="relative group">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@hitech.os"
                                        className="bg-slate-950/50 border-slate-800 focus:border-orange-500/50 focus:ring-orange-500/20 transition-all h-12 font-mono text-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" title="password" className="text-xs font-black text-slate-400 tracking-widest uppercase">Encryption Key</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    className="bg-slate-950/50 border-slate-800 focus:border-orange-500/50 focus:ring-orange-500/20 transition-all h-12 font-mono text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                className="w-full h-12 bg-orange-600 hover:bg-orange-700 font-black tracking-[0.2em] relative group overflow-hidden"
                                disabled={loginMutation.isPending}
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                {loginMutation.isPending ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span>INITIATE_HANDSHAKE</span>
                                    </div>
                                )}
                            </Button>

                            <div className="flex justify-between w-full items-center text-[10px] text-slate-600 font-mono tracking-tighter">
                                <span>PROTOCOL: MAXIMUS_SECURE_V3</span>
                                <span className="text-orange-500/50 flex items-center gap-1 group cursor-pointer hover:text-orange-500 transition-colors" onClick={() => router.push('/')}>
                                    RETURN_TO_BASE_UI
                                </span>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                <div className="text-center opacity-30">
                    <p className="text-[10px] text-slate-700 font-mono tracking-widest">
                        Unauthorized access attempts are logged and transmitted <br /> to the nearest Hi-Tech security node.
                    </p>
                </div>
            </div>
        </div>
    );
}
