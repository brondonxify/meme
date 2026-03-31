"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import {
    CreditCard,
    TrendingUp,
    ArrowDownRight,
    ArrowUpRight,
    DollarSign,
    Calendar,
    Loader2,
    PieChart,
    BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminFinancePage() {
    const { data: transactions, isLoading } = useQuery({
        queryKey: ["admin-transactions"],
        queryFn: () => adminService.getTransactions(),
    });

    const totalRevenue = transactions?.reduce((acc, t) => acc + (t.payment_status === 'paid' ? Number(t.total_amount) : 0), 0);
    const pendingRevenue = transactions?.reduce((acc, t) => acc + (t.payment_status === 'unpaid' ? Number(t.total_amount) : 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter">Financial <span className="text-orange-500">Optics</span></h1>
                <p className="text-slate-500 font-mono text-xs mt-1">REVENUE_STREAM_ANALYSIS // ENCRYPTED_LEDGER</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">Net Capital</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">${totalRevenue?.toLocaleString()}</div>
                        <div className="flex items-center gap-1 text-[10px] text-green-500 mt-1">
                            <ArrowUpRight className="h-3 w-3" /> +12.5% VS LAST QUARTER
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pending Credits</CardTitle>
                        <CreditCard className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">${pendingRevenue?.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Awaiting node validation</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">Avg Transaction</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">$1,120</div>
                        <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">High-tier unit dominance</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-slate-800 h-[300px] flex items-center justify-center">
                    <div className="text-center space-y-4 opacity-30">
                        <BarChart3 className="h-12 w-12 mx-auto" />
                        <p className="text-xs font-mono uppercase tracking-[0.3em]">Volume Mapping Offline</p>
                    </div>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800 h-[300px] flex items-center justify-center">
                    <div className="text-center space-y-4 opacity-30">
                        <PieChart className="h-12 w-12 mx-auto" />
                        <p className="text-xs font-mono uppercase tracking-[0.3em]">Sector Distribution Offline</p>
                    </div>
                </Card>
            </div>

            <div className="border border-slate-800 rounded-3xl overflow-hidden bg-slate-900/50">
                <div className="p-4 bg-slate-900/80 border-b border-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-widest">Transaction Ledger</h3>
                </div>
                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 text-orange-500 animate-spin" /></div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase">TXN_ID</th>
                                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase">Timestamp</th>
                                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase">Flow</th>
                                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions?.map((txn) => (
                                <tr key={txn.id} className="border-b border-slate-800/50 text-xs">
                                    <td className="p-4 font-mono text-orange-500">TXN_NODE_{txn.id}</td>
                                    <td className="p-4 text-slate-400">{new Date(txn.order_date).toLocaleString()}</td>
                                    <td className="p-4 font-bold text-white">+${txn.total_amount}</td>
                                    <td className="p-4">
                                        <Badge className={`${txn.payment_status === 'paid' ? 'bg-green-600/20 text-green-500 border-green-500/20' : 'bg-red-600/20 text-red-500 border-red-500/20'} text-[10px] font-black`}>
                                            {txn.payment_status || 'UNPAID'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
