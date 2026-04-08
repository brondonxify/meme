"use server";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { getDiscount } from "@/helpers/getDiscount";
import { Order } from "@/types/models";

interface OrdersExport {
  id: number;
  invoice_no: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  discount: number;
  shipping_cost: number;
  payment_method: string;
  order_time: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function exportOrders() {
  try {
    const response = await serverApiRequest<ApiResponse<Order[]>>(
      "/api/v1/orders?limit=1000"
    );

    return {
      data: response.data.map(
        (order): OrdersExport => ({
          id: order.id,
          invoice_no: order.invoice_no,
          customer_name: order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : "",
          customer_email: order.customer?.email ?? "",
          total_amount: order.total_amount,
          discount: getDiscount({
            coupon: order.coupon,
            totalAmount: order.total_amount,
            shippingCost: order.shipping_cost,
          }),
          shipping_cost: order.shipping_cost,
          payment_method: order.payment_method,
          order_time: order.order_time,
          status: order.status,
          created_at: order.created_at,
          updated_at: order.updated_at,
        })
      ),
    };
  } catch (error) {
    console.error(`Error fetching orders:`, error);
    return { error: `Failed to fetch data for orders.` };
  }
}
