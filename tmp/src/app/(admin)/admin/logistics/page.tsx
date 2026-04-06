"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import {
    Truck,
    MapPin,
    Clock,
    Globe,
    PackageCheck,
    Package,
    ArrowRight,
    Loader2,
    Box
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function AdminLogisticsPage() {
    const { data: shipments, isLoading } = useQuery({
        queryKey: ["admin-logistics"],
        queryFn: () => adminService.getLogistics(),
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Logistics <span className="text-orange-500">Command</span></h1>
                    <p className="text-slate-500 font-mono text-xs mt-1">DISPATCH_OVERWATCH // GLOBAL_TRANSIT_NET</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase">Active Units</p>
                        <p className="text-2xl font-black text-orange-500">{shipments?.length || 0}</p>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-800 mx-2" />
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase">On Schedule</p>
                        <p className="text-2xl font-black text-white">100%</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-slate-900 border-slate-800 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                    <CardHeader>
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Globe className="h-4 w-4 text-orange-500" /> Active Dispatch Board
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 text-orange-500 animate-spin" /></div>
                        ) : shipments?.length === 0 ? (
                            <div className="text-center py-20 opacity-30">
                                <Box className="h-12 w-12 mx-auto mb-4" />
                                <p className="text-xs font-mono uppercase">No units currently transmitting</p>
                            </div>
                        ) : (
                            shipments?.map((ship) => (
                                <div key={ship.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center group hover:border-orange-500/30 transition-all">
                                    <div className="flex gap-4 items-center">
                                        <div className="h-10 w-10 bg-orange-600/10 rounded-lg flex items-center justify-center">
                                            <Truck className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold uppercase tracking-tight">TRANSMISSION_{ship.id}</p>
                                            <p className="text-[10px] text-slate-500 font-mono">HASH: {ship.tracking_number || "AWAITING_LINK"}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-8 items-center">
                                        <div className="hidden md:block text-right">
                                            <p className="text-[10px] text-slate-600 uppercase font-black">Destination</p>
                                            <p className="text-xs text-slate-400">Sector_Node_{ship.customer_id}</p>
                                        </div>
                                        <Badge className={`${ship.status === 'delivered' ? 'bg-green-600/20 text-green-500' : 'bg-blue-600/20 text-blue-500'} border-none text-[10px] font-black`}>
                                            {ship.status.toUpperCase()}
                                        </Badge>
                                        <Button variant="ghost" size="icon" className="hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" /> Dispatch Feed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="relative pl-6 border-l border-slate-800 space-y-1">
                                <div className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                                <p className="text-[10px] text-orange-500 font-mono">14:2{i}:00</p>
                                <p className="text-xs font-bold uppercase tracking-tighter">Package Departure</p>
                                <p className="text-[10px] text-slate-500 italic">Unit #{800 + i} cleared for Sector B.</p>
                            </div>
                        ))}
                        <Separator className="bg-slate-800" />
                        <div className="p-4 bg-orange-600/5 border border-orange-500/10 rounded-xl space-y-2">
                            <p className="text-[10px] font-black text-orange-500 uppercase">Network Alert</p>
                            <p className="text-xs text-slate-400 leading-tight">Increased neural traffic detected in Sector 4. Minor dispatch delays expected.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
