"use client";
import { useEffect, useState } from "react";
import { ordersService } from "@/services/orders.service";
import { BackendOrder } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Clock, Package, CheckCircle2, XCircle, Truck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { integralCF } from "@/styles/fonts";
import { cn } from "@/lib/utils";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      ordersService.getMyOrderById(Number(orderId)).then(res => {
        setOrder(res);
        setLoading(false);
      });
    }
  }, [orderId]);

  if (loading) return <div className="py-20 text-center">Loading order details...</div>;
  if (!order) return <div className="py-20 text-center">Order not found.</div>;

  return (
    <main className="py-10 max-w-frame mx-auto px-4 mt-10">
      <div className="mb-6">
        <Link href="/account/orders" className="text-black/60 hover:text-black mb-4 inline-block">&larr; Back to Orders</Link>
        <h1 className={cn(integralCF.className, "text-2xl md:text-3xl font-bold uppercase")}>Order Details</h1>
      </div>

      <div className="mb-10 p-6 border border-black/10 rounded-[20px] bg-white shadow-sm overflow-x-auto">
        {order.status === 'cancelled' ? (
          <div className="flex flex-col items-center justify-center text-red-500 py-4">
            <XCircle className="w-12 h-12 mb-3" />
            <h2 className="text-xl font-bold">Order Cancelled</h2>
            <p className="text-black/60 mt-1">This order was cancelled and will not be fulfilled.</p>
          </div>
        ) : (
          <div className="flex items-center justify-between min-w-[600px] relative">
            <div className="absolute left-[10%] right-[10%] top-6 h-1 bg-gray-100 -z-10 rounded-full" />
            
            {[
              { id: 'pending', label: 'Order Placed', icon: Clock },
              { id: 'processing', label: 'Processing', icon: Package },
              { id: 'shipped', label: 'Shipped', icon: Truck },
              { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
            ].map((step, index, arr) => {
              const currentIndex = arr.findIndex(s => s.id === (order.status === 'pending' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? order.status : 'pending'));
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              
              return (
                <div key={step.id} className="flex flex-col items-center relative z-10 w-1/4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border-4 border-white mb-3",
                    isCompleted ? "bg-black text-white" : 
                    isCurrent ? "bg-[#FF9900] text-white ring-4 ring-[#FF9900]/20" : 
                    "bg-gray-100 text-gray-400"
                  )}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-sm font-semibold text-center",
                    (isCompleted || isCurrent) ? "text-black" : "text-gray-400"
                  )}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-black/10 rounded-[20px] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-black/10 pb-4">
              <div>
                <p className="font-bold text-lg">{order.invoice_no}</p>
                <p className="text-black/60 text-sm">{new Date(order.order_time).toLocaleString()}</p>
              </div>
              <span className="bg-black text-white px-4 py-1.5 rounded-full text-sm capitalize">{order.status}</span>
            </div>
            
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 border-b border-black/5 pb-4 last:border-0 last:pb-0">
                  <div className="w-16 h-16 bg-[#F0EEED] rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.article_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-xs text-black/40">No Image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-black line-clamp-1">{item.article_name}</p>
                    <p className="text-black/60 text-sm italic">Qty: {item.quantity} × {item.unit_price} XAF</p>
                  </div>
                  <div className="font-bold text-[#FF9900]">
                    {(Number(item.quantity) * Number(item.unit_price)).toFixed(0)} XAF
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-black/10 rounded-[20px] p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Summary</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-black/60">
                <span>Shipping Cost</span>
                <span>{order.shipping_cost} XAF</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-black/10">
                <span>Total Amount</span>
                <span className="text-[#FF9900]">{order.total_amount} XAF</span>
              </div>
            </div>
          </div>

          <div className="border border-black/10 rounded-[20px] p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Information</h3>
            <div className="space-y-3 text-sm">
              <p><strong className="block text-black/60">Payment Method</strong> <span className="uppercase">{order.payment_method}</span></p>
              {order.tracking_number && (
                <p><strong className="block text-black/60">Tracking Number</strong> {order.tracking_number} ({order.carrier})</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
