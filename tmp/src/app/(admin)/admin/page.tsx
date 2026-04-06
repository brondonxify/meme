"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import {
    DollarSign,
    ShoppingBag,
    Users,
    AlertTriangle,
    ArrowUpRight,
    Activity,
    TrendingUp,
    Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
    const { data: stats, isLoading, isError } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: () => adminService.getStats(),
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
                <p className="font-mono text-xs tracking-[0.3em] text-slate-500 animate-pulse">DECRYPTING SYSTEM ANALYTICS...</p>
            </div>
        );
    }

    const statCards = [
        {
            label: "Gross Capital",
            value: `$${stats?.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: "text-green-500",
            description: "Total confirmed revenue inflow"
        },
        {
            label: "Active Operations",
            value: stats?.activeOrders,
            icon: ShoppingBag,
            color: "text-orange-500",
            description: "Pending or in-transit acquisitions"
        },
        {
            label: "Total Units",
            value: stats?.totalCustomers,
            icon: Users,
            color: "text-blue-500",
            description: "Registered system members"
        },
        {
            label: "Critical Alerts",
            value: stats?.stockAlerts,
            icon: AlertTriangle,
            color: "text-red-500",
            description: "Hardware units below stock safety"
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter">Command <span className="text-orange-500">Center</span></h1>
                <p className="text-slate-500 font-mono text-xs mt-1">REAL-TIME GLOBAL TELEMETRY // SECTOR 7G</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <Card key={i} className="bg-slate-900/50 border-slate-800 hover:border-orange-500/30 transition-all duration-300 group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                {card.label}
                            </CardTitle>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">{card.value}</div>
                            <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-tighter">{card.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800 h-[400px] flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Activity className="absolute top-4 right-4 h-4 w-4 text-orange-500/20" />
                    <div className="text-center space-y-4">
                        <TrendingUp className="h-12 w-12 text-slate-800 mx-auto" />
                        <div className="space-y-1">
                            <p className="font-black text-slate-700 uppercase tracking-widest text-sm text-decoration-none">Earning Projection</p>
                            <p className="text-[10px] text-slate-800 font-mono">ENCRYPTED DATA STREAM_0xFF</p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" /> System Events
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex gap-3 border-l-2 border-slate-800 pl-4 py-1">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-tighter">Event_Log_Alpha_{i}</p>
                                        <p className="text-xs text-slate-500">Acquisition sequence initiated for node #882{i}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
