"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    Package,
    CreditCard,
    Truck,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Activity
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { useAuth } from "@/context/auth-context";

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { label: "Customers", icon: Users, href: "/admin/customers" },
    { label: "Orders", icon: ShoppingBag, href: "/admin/orders" },
    { label: "Products", icon: Package, href: "/admin/products" },
    { label: "Finance", icon: CreditCard, href: "/admin/finance" },
    { label: "Logistics", icon: Truck, href: "/admin/logistics" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const isAdminLogin = pathname === "/admin/login";

    const handleLogout = async () => {
        await logout();
        router.push("/admin/login");
    };

    if (isAdminLogin) {
        return <AdminGuard>{children}</AdminGuard>;
    }

    return (
        <AdminGuard>
            <div className="flex min-h-screen bg-slate-950 text-slate-200">
                {/* Sidebar */}
                <aside
                    className={`sticky top-0 h-screen border-r border-slate-800 bg-slate-900/50 backdrop-blur transition-all duration-300 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}
                >
                    <div className="p-6 flex items-center justify-between">
                        {!isCollapsed && (
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 bg-orange-600 rounded flex items-center justify-center font-black text-white">H</div>
                                <span className="font-black tracking-tighter text-xl">HI-TECH <span className="text-orange-500 text-xs">OS</span></span>
                            </div>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="hover:bg-slate-800">
                            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="px-3 py-2 space-y-1 flex-1">
                        <div className={`text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-4 ${isCollapsed ? 'hidden' : 'block'}`}>
                            Main Operations
                        </div>
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${pathname === item.href
                                    ? 'bg-orange-600/10 text-orange-500 border border-orange-500/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                {!isCollapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
                            </Link>
                        ))}
                    </div>

                    <Separator className="bg-slate-800" />

                    <div className="p-4 space-y-1">
                        <Link
                            href="/admin/settings"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                        >
                            <Settings className="h-5 w-5 shrink-0" />
                            {!isCollapsed && <span className="text-sm font-bold">System Settings</span>}
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all text-left"
                        >
                            <LogOut className="h-5 w-5 shrink-0" />
                            {!isCollapsed && <span className="text-sm font-bold">Terminate Session</span>}
                        </button>
                    </div>

                    <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                        {!isCollapsed ? (
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-orange-600/20 flex items-center justify-center border border-orange-500/30">
                                    <ShieldCheck className="h-5 w-5 text-orange-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold truncate">Command-X</p>
                             
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <ShieldCheck className="h-6 w-6 text-orange-500" />
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur sticky top-0 z-10 px-8 flex items-center justify-between">
                        <div className="text-sm font-mono text-slate-500 tracking-widest hidden md:block">
                            NODE_ID: CMD_CENTER_01 // SECURE_ACCESS_GRANTED
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" className="border-slate-800 bg-transparent text-slate-400 hover:text-white text-[10px] font-black tracking-widest uppercase">
                                Global Search
                            </Button>
                        </div>
                    </header>
                    <div className="p-8 max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </AdminGuard>
    );
}
