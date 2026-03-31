"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { ordersService } from "@/services/orders.service";
import {
    ShoppingBag,
    Search,
    Truck,
    CreditCard,
    Clock,
    Box,
    MoreVertical,
    Loader2,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useState } from "react";

export default function AdminOrdersPage() {
    const [search, setSearch] = useState("");
    const [logisticsOrder, setLogisticsOrder] = useState<any>(null);
    const [trackingInfo, setTrackingInfo] = useState({ tracking_number: "", carrier: "", estimated_delivery: "" });
    const queryClient = useQueryClient();

    const { data: orders, isLoading } = useQuery({
        queryKey: ["admin-orders"],
        queryFn: () => ordersService.getAll(),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number, status: any }) => ordersService.updateStatus(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
    });

    const refundMutation = useMutation({
        mutationFn: (id: number) => adminService.refundOrder(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
    });

    const deliveryMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => adminService.updateOrderDelivery(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            setLogisticsOrder(null);
        }
    });

    const handleLogistics = (order: any) => {
        setLogisticsOrder(order);
        setTrackingInfo({
            tracking_number: order.tracking_number || "",
            carrier: order.carrier || "",
            estimated_delivery: order.estimated_delivery ? new Date(order.estimated_delivery).toISOString().split('T')[0] : ""
        });
    };

    const filteredOrders = orders?.filter(o =>
        o.id?.toString().includes(search) ||
        o.customer_id.toString().includes(search)
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'delivered': return <Badge className="bg-green-600 font-black uppercase text-[10px]">DELIVERED</Badge>;
            case 'shipped': return <Badge className="bg-blue-600 font-black uppercase text-[10px]">IN_TRANSIT</Badge>;
            case 'cancelled': return <Badge className="bg-red-600 font-black uppercase text-[10px]">TERMINATED</Badge>;
            default: return <Badge className="bg-orange-600 font-black uppercase text-[10px]">PENDING</Badge>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Master <span className="text-orange-500">Manifest</span></h1>
                    <p className="text-slate-500 font-mono text-xs mt-1">LOG_STREAM: {orders?.length || 0} ENTRIES // OPS_CONTROL_ACTIVE</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search by ID or Customer ID..."
                        className="pl-10 bg-slate-900 border-slate-800"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-40">
                    <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
                </div>
            ) : (
                <div className="border border-slate-800 rounded-3xl overflow-hidden bg-slate-900/50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/80">
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Order ID</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Client Info</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Credits</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Transmission</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Payment</th>
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders?.map((order) => (
                                <tr key={order.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                                    <td className="p-4 font-mono text-xs font-bold text-orange-500">#ORD_{order.id}</td>
                                    <td className="p-4">
                                        <p className="text-xs font-bold">Node_{order.customer_id}</p>
                                        <p className="text-[10px] text-slate-600 font-mono italic">Primary sector</p>
                                    </td>
                                    <td className="p-4 font-black">${order.total_amount}</td>
                                    <td className="p-4">{getStatusBadge(order.status)}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {order.payment_status === 'paid' ? (
                                                <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                            ) : order.payment_status === 'refunded' ? (
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            ) : (
                                                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                            )}
                                            <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                                                {order.payment_status || 'unpaid'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="hover:bg-slate-800">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                                                <DropdownMenuLabel className="text-[10px] uppercase font-black text-slate-500">Status Control</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-slate-800" />
                                                <DropdownMenuItem
                                                    className="hover:bg-slate-800 cursor-pointer flex gap-2 items-center"
                                                    onClick={() => updateStatusMutation.mutate({ id: order.id!, status: 'shipped' })}
                                                >
                                                    <Truck className="h-3 w-3 text-blue-500" /> Dispatch Unit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="hover:bg-slate-800 cursor-pointer flex gap-2 items-center"
                                                    onClick={() => handleLogistics(order)}
                                                >
                                                    <Box className="h-3 w-3 text-orange-500" /> Edit Logistics
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="hover:bg-slate-800 cursor-pointer flex gap-2 items-center"
                                                    onClick={() => updateStatusMutation.mutate({ id: order.id!, status: 'delivered' })}
                                                >
                                                    <CheckCircle2 className="h-3 w-3 text-green-500" /> Confirm Delivery
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="hover:bg-slate-800 cursor-pointer flex gap-2 items-center text-red-400"
                                                    onClick={() => refundMutation.mutate(order.id!)}
                                                >
                                                    <AlertCircle className="h-3 w-3" /> Terminate & Refund
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-800" />
                                                <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">View Manifest Details</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredOrders?.length === 0 && (
                        <div className="text-center py-20">
                            <ShoppingBag className="h-12 w-12 text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-600 font-mono tracking-widest uppercase text-xs">No active logistics logs found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Logistics Modal */}
            <Dialog open={!!logisticsOrder} onOpenChange={() => setLogisticsOrder(null)}>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tighter">
                            Logistics <span className="text-orange-500">Override</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black text-slate-500">Tracking Hash</Label>
                            <Input
                                value={trackingInfo.tracking_number}
                                onChange={(e) => setTrackingInfo({ ...trackingInfo, tracking_number: e.target.value })}
                                className="bg-slate-950 border-slate-800 font-mono text-xs"
                                placeholder="TXN_772..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black text-slate-500">Carrier Node</Label>
                            <Select
                                value={trackingInfo.carrier}
                                onValueChange={(val) => setTrackingInfo({ ...trackingInfo, carrier: val })}
                            >
                                <SelectTrigger className="bg-slate-950 border-slate-800">
                                    <SelectValue placeholder="Select Carrier" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                    <SelectItem value="FEDEX_GLOBAL">FEDEX Global</SelectItem>
                                    <SelectItem value="DHL_QUANTUM">DHL Quantum</SelectItem>
                                    <SelectItem value="UPS_NEURAL">UPS Neural</SelectItem>
                                    <SelectItem value="LOCAL_DRONE">Local Drone</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black text-slate-500">ETA Timestamp</Label>
                            <Input
                                type="date"
                                value={trackingInfo.estimated_delivery}
                                onChange={(e) => setTrackingInfo({ ...trackingInfo, estimated_delivery: e.target.value })}
                                className="bg-slate-950 border-slate-800"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" className="hover:bg-slate-800" onClick={() => setLogisticsOrder(null)}>ABORT</Button>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700 font-black tracking-widest text-[10px]"
                            onClick={() => deliveryMutation.mutate({ id: logisticsOrder.id, data: trackingInfo })}
                            disabled={deliveryMutation.isPending}
                        >
                            {deliveryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "SYCHRONIZE_LOGISTICS"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
