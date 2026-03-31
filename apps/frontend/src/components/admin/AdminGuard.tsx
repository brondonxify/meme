"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = () => {
            if (window.location.pathname === "/admin/login") {
                setIsAuthorized(true);
                return;
            }

            const adminToken = localStorage.getItem("admin_token");
            if (!adminToken) {
                router.push("/admin/login");
                setIsAuthorized(false);
            } else {
                setIsAuthorized(true);
            }
        };

        checkAuth();
    }, [router]);

    if (isAuthorized === null) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
            </div>
        );
    }

    return isAuthorized ? <>{children}</> : null;
}
