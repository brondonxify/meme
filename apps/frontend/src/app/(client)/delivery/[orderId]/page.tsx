"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ordersService } from "@/services/orders.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Truck, CheckCircle2, Box, Package, ShieldCheck, MapPin, Loader2 } from "lucide-react";

export default function DeliveryPage() {
    const { orderId } = useParams();

    const { data: order, isLoading } = useQuery({
        queryKey: ["order", orderId],
        queryFn: () => ordersService.getById(Number(orderId)),
        refetchInterval: 5000 // Polling for status updates
    });

    if (isLoading) return <div className="flex items-center justify-center min-h-screen text-orange-500"><Loader2 className="animate-spin h-10 w-10" /></div>;

    const steps = [
        { label: "ACQUIRED", icon: Box, active: true },
        { label: "VALIDATED", icon: ShieldCheck, active: order?.payment_status === 'paid' },
        { label: "TRANSMITTING", icon: Truck, active: order?.status === 'shipped' || order?.status === 'delivered' },
        { label: "DELIVERED", icon: CheckCircle2, active: order?.status === 'delivered' },
    ];

    return (
        <div className="bg-slate-950 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-4xl space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Transmission <span className="text-orange-500">Status</span></h1>
                        <p className="text-slate-500 font-mono text-xs">LOG ID: #{orderId}</p>
                    </div>
                    <Badge className="bg-orange-600 text-xs py-1 px-4 uppercase font-black">{order?.status}</Badge>
                </div>

                {/* Tracking Map Simulation */}
                <div className="grid md:grid-cols-4 gap-4">
                    {steps.map((step, idx) => (
                        <Card key={idx} className={`bg-slate-900 border-slate-800 border-t-4 transition-all duration-1000 ${step.active ? 'border-t-orange-500' : 'opacity-30'}`}>
                            <CardContent className="p-4 flex flex-col items-center gap-2">
                                <step.icon className={`h-8 w-8 ${step.active ? 'text-orange-500' : 'text-slate-700'}`} />
                                <span className="text-[10px] font-black tracking-widest">{step.label}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <Package className="h-4 w-4 text-orange-500" /> Package Manifest
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order?.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span className="font-bold">{item.article_name}</span>
                                    <span className="text-slate-500">X{item.quantity}</span>
                                </div>
                            ))}
                            <Separator className="bg-slate-800" />
                            <div className="space-y-1">
                                <p className="text-[10px] text-slate-500 uppercase font-black">Tracking Hash</p>
                                <p className="text-xs font-mono text-white truncate">0x9f3d...a4b2_{orderId}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-orange-500" /> Target Node
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Sector: Camber-IV<br />
                                Quadrant: Industrial_Zone_Subnode_12<br />
                                Priority: HIGH_TECH_UPGRADE
                            </p>
                            <div className="p-4 bg-orange-600/10 border border-orange-500/20 rounded-lg">
                                <p className="text-[10px] text-orange-500 font-black uppercase mb-1">Estimated Arrival</p>
                                <p className="text-lg font-black text-white">48:00:00 HOURS</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {order?.status === 'delivered' && (
                    <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-4">
                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                        <div>
                            <h3 className="font-black uppercase tracking-widest text-green-500">Acquisition Complete</h3>
                            <p className="text-slate-500 text-xs">The hardware unit has been successfully integrated into your sector.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
