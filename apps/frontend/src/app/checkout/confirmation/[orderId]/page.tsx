"use client";
import { useEffect, useState } from "react";
import { ordersService } from "@/services/orders.service";
import { BackendOrder } from "@/types/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ConfirmationPage() {
  const params = useParams();
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;
  const [order, setOrder] = useState<BackendOrder | null>(null);

  useEffect(() => {
    if (orderId) {
      ordersService.getMyOrderById(Number(orderId)).then(res => setOrder(res));
    }
  }, [orderId]);

  if (!order) return <div className="py-20 text-center mt-20">Loading order details...</div>;

  return (
    <main className="py-20 max-w-frame mx-auto px-4 text-center mt-10">
      <div className="text-6xl mb-6">✅</div>
      <h1 className="text-3xl md:text-4xl font-bold mb-4 uppercase">Order Placed Successfully!</h1>
      <p className="text-black/60 mb-2">Invoice: <strong>{order.invoice_no}</strong></p>
      <p className="text-black/60 mb-8">Payment Method: <strong>{order.payment_method.toUpperCase()}</strong></p>
      
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <Button asChild className="rounded-full bg-black h-[54px] px-8 w-full sm:w-auto"><Link href="/shop">Continue Shopping</Link></Button>
        <Button asChild variant="outline" className="rounded-full h-[54px] px-8 border-black/20 w-full sm:w-auto"><Link href="/account/orders">View My Orders</Link></Button>
      </div>
    </main>
  );
}
