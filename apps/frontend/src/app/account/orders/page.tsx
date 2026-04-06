"use client";
import { useEffect, useState } from "react";
import { ordersService } from "@/services/orders.service";
import { BackendOrder } from "@/types/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersService.getMyOrders(1, 50).then(res => {
      setOrders(res.items || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="py-20 text-center">Loading orders...</div>;

  return (
    <main className="py-10 max-w-frame mx-auto px-4 mt-10">
      <h1 className={cn(integralCF.className, "text-3xl font-bold uppercase mb-8")}>My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-20 border border-black/10 rounded-[20px]">
          <p className="text-black/60 mb-4">You haven't placed any orders yet.</p>
          <Button asChild className="rounded-full bg-black h-[50px]"><Link href="/shop">Start Shopping</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border border-black/10 p-5 rounded-[20px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-lg mb-1">{order.invoice_no}</p>
                <p className="text-black/60 text-sm">{new Date(order.order_time).toLocaleString()}</p>
                <div className="mt-2 text-sm">
                  <span className="bg-black/5 px-3 py-1 rounded-full capitalize mr-2">Status: {order.status}</span>
                  <span className="bg-black/5 px-3 py-1 rounded-full uppercase">Pay: {order.payment_method}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-xl uppercase text-[#FF9900]">{order.total_amount} XAF</span>
                <Button asChild variant="outline" className="rounded-full border-black/20">
                  <Link href={`/account/orders/${order.id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
