"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import {
    Users,
    Search,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ExternalLink,
    Loader2,
    Filter,
    Activity
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
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export default function AdminCustomersPage() {
    const [search, setSearch] = useState("");

    const { data: customers, isLoading } = useQuery({
        queryKey: ["admin-customers"],
        queryFn: () => adminService.getCustomers(),
    });

    const filteredCustomers = customers?.filter(c =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Client <span className="text-orange-500">Oversight</span></h1>
                    <p className="text-slate-500 font-mono text-xs mt-1">TOTAL_RECORDS: {customers?.length || 0} // AUTH_LEVEL: MASTER</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-10 bg-slate-900 border-slate-800"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="border-slate-800 bg-slate-900">
                        <Filter className="h-4 w-4 mr-2" /> Filter
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-40">
                    <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredCustomers?.map((customer) => (
                        <Card key={customer.id} className="bg-slate-900/50 border-slate-800 hover:border-orange-500/30 transition-all duration-300 group">
                            <CardContent className="p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                <div className="flex gap-4 items-center">
                                    <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center font-black text-orange-500 border border-slate-700">
                                        {customer.first_name[0]}{customer.last_name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white group-hover:text-orange-500 transition-colors uppercase tracking-tight">
                                            {customer.first_name} {customer.last_name}
                                        </h3>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <Mail className="h-3 w-3" /> {customer.email}
                                            </span>
                                            {customer.phone && (
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Phone className="h-3 w-3" /> {customer.phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
                                    <div className="hidden xl:flex flex-col">
                                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Registered</span>
                                        <span className="text-xs text-slate-400 font-mono">{new Date(customer.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="hidden xl:flex flex-col">
                                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Location</span>
                                        <span className="text-xs text-slate-400">{customer.city || "N/A"}, {customer.postal_code || ""}</span>
                                    </div>

                                    <Separator orientation="vertical" className="h-8 bg-slate-800 hidden lg:block" />

                                    <div className="flex gap-2 ml-auto lg:ml-0">
                                        <Button variant="ghost" size="sm" className="text-orange-500 hover:bg-orange-500/10 font-bold uppercase text-[10px] tracking-widest">
                                            <Activity className="h-3 w-3 mr-2" /> Orders
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="hover:bg-slate-800">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                                                <DropdownMenuLabel className="text-[10px] uppercase font-black text-slate-500">Client Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-slate-800" />
                                                <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">View Full Profile</DropdownMenuItem>
                                                <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">Acquisition History</DropdownMenuItem>
                                                <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer text-red-400">Suspend Access</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredCustomers?.length === 0 && (
                        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
                            <Users className="h-12 w-12 text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-600 font-mono tracking-widest uppercase text-sm">No client nodes match the query profile.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
