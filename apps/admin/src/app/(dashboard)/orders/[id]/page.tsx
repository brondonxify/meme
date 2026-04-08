import { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaBagShopping } from "react-icons/fa6";
import { format } from "date-fns";

import PageTitle from "@/components/shared/PageTitle";
import Typography from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { getDiscount } from "@/helpers/getDiscount";
import { OrderBadgeVariants } from "@/constants/badge";
import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { OrderDetails } from "@/services/orders";
import { InvoiceActions } from "./_components/InvoiceActions";
import { formatAmount } from "@/helpers/formatAmount";

type PageParams = {
  params: Promise<{
    id: string;
  }>;
};

async function getOrderDetails(id: string): Promise<OrderDetails> {
  const response = await serverApiRequest<ApiResponse<OrderDetails>>(
    `/api/v1/orders/${id}`
  );
  return response.data!;
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { id } = await params;
  try {
    const order = await getOrderDetails(id);

    return { title: `Order #${order.invoice_no}` };
  } catch (e) {
    return { title: "Order not found" };
  }
}

export default async function Order({ params }: PageParams) {
  const { id } = await params;
  try {
    const order = await getOrderDetails(id);

    return (
      <section>
        <PageTitle className="print:hidden">Invoice</PageTitle>

        <Card className="mb-8 text-muted-foreground p-4 lg:p-6 print:border-none print:bg-white print:mb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-x-4 gap-y-6 print:flex-row print:justify-between">
            <div className="flex flex-col">
              <Typography
                className="uppercase text-card-foreground mb-1.5 md:text-xl tracking-wide print:text-black"
                variant="h2"
              >
                invoice
              </Typography>

              <div className="flex items-center gap-x-2">
                <Typography className="uppercase font-semibold text-xs print:text-black">
                  status
                </Typography>

                <Badge
                  variant={OrderBadgeVariants[order.status]}
                  className="flex-shrink-0 text-xs capitalize"
                >
                  {order.status}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col text-sm gap-y-0.5 md:text-right print:text-right print:text-black">
              <div className="flex items-center md:justify-end gap-x-1 print:justify-end">
                <FaBagShopping className="size-6 text-primary mb-1 flex-shrink-0" />
                <Typography
                  component="span"
                  variant="h2"
                  className="text-card-foreground print:text-black"
                >
                  HI-TECH
                </Typography>
              </div>

              <Typography component="p">
                Douala, Cameroon
              </Typography>
              <Typography component="p">+237 600 000 000</Typography>
              <Typography component="p" className="break-words">
                support@hi-tech.com
              </Typography>
              <Typography component="p">
                ecommerce-admin-board.vercel.app
              </Typography>
            </div>
          </div>

          <Separator className="my-6 print:bg-print-border" />

          <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-10 print:flex-row print:justify-between print:text-black">
            <div>
              <Typography
                variant="p"
                component="h4"
                className="font-semibold uppercase text-card-foreground mb-1 print:text-black"
              >
                date
              </Typography>

              <Typography className="text-sm">
                {format(order.order_time, "PPP")}
              </Typography>
            </div>

            <div>
              <Typography
                variant="p"
                component="h4"
                className="font-semibold uppercase text-card-foreground mb-1 print:text-black"
              >
                invoice no
              </Typography>

              <Typography className="text-sm">#{order.invoice_no}</Typography>
            </div>

            <div className="md:text-right print:text-right">
              <Typography
                variant="p"
                component="h4"
                className="font-semibold uppercase text-card-foreground mb-1 print:text-black"
              >
                invoice to
              </Typography>

              <div className="flex flex-col text-sm gap-y-0.5">
                <Typography component="p">{order.customer?.first_name} {order.customer?.last_name}</Typography>
                <Typography component="p" className="break-words">
                  {order.customer?.email}
                </Typography>
                {order.customer?.phone && (
                  <Typography component="p">{order.customer?.phone}</Typography>
                )}
              </div>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden mb-10 print:text-black print:border-print-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 dark:bg-transparent print:border-b-print-border">
                  <TableHead className="uppercase h-10 whitespace-nowrap print:text-black">
                    SR.
                  </TableHead>
                  <TableHead className="uppercase h-10 whitespace-nowrap print:text-black">
                    product title
                  </TableHead>
                  <TableHead className="uppercase h-10 whitespace-nowrap text-center print:text-black">
                    quantity
                  </TableHead>
                  <TableHead className="uppercase h-10 whitespace-nowrap text-center print:text-black">
                    item price
                  </TableHead>
                  <TableHead className="uppercase h-10 whitespace-nowrap text-right print:text-black">
                    amount
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {order.items.map((orderItem: any, index: number) => (
                  <TableRow
                    key={`order-item-${index}`}
                    className="hover:bg-transparent print:border-b-print-border"
                  >
                    <TableCell className="py-3 print:font-normal print:text-black">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium py-3 px-6 text-card-foreground print:font-normal print:text-black">
                      {orderItem.article_name}
                    </TableCell>
                    <TableCell className="font-semibold py-3 text-center print:font-normal print:text-black">
                      {orderItem.quantity}
                    </TableCell>
                    <TableCell className="font-semibold py-3 text-center print:font-normal print:text-black uppercase">
                      {formatAmount(orderItem.unit_price)}
                    </TableCell>
                    <TableCell className="font-semibold py-3 text-primary text-right print:text-black uppercase">
                      {formatAmount(orderItem.quantity * orderItem.unit_price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="bg-background rounded-lg flex flex-col gap-4 md:justify-between md:flex-row p-6 md:px-8 mb-4 print:flex-row print:justify-between print:mb-0 print:p-0 print:px-2 print:bg-white">
            <div>
              <Typography
                component="h4"
                className="font-medium text-sm uppercase mb-1 tracking-wide print:text-black"
              >
                payment method
              </Typography>

              <Typography className="text-base capitalize font-semibold text-card-foreground tracking-wide print:text-black">
                {order.payment_method}
              </Typography>
            </div>

            <div>
              <Typography
                component="h4"
                className="font-medium text-sm uppercase mb-1 tracking-wide print:text-black"
              >
                shipping cost
              </Typography>

              <Typography className="text-base capitalize font-semibold text-card-foreground tracking-wide print:text-black uppercase">
                {formatAmount(order.shipping_cost)}
              </Typography>
            </div>

            <div>
              <Typography
                component="h4"
                className="font-medium text-sm uppercase mb-1 tracking-wide print:text-black"
              >
                discount
              </Typography>

              <Typography className="text-base capitalize font-semibold text-card-foreground tracking-wide print:text-black uppercase">
                {formatAmount(getDiscount({
                  totalAmount: order.total_amount,
                  shippingCost: order.shipping_cost,
                  coupon: order.coupon,
                }))}
              </Typography>
            </div>

            <div>
              <Typography
                component="h4"
                className="font-medium text-sm uppercase mb-1 tracking-wide print:text-black"
              >
                total amount
              </Typography>

              <Typography className="text-xl capitalize font-semibold tracking-wide text-primary uppercase">
                {formatAmount(order.total_amount)}
              </Typography>
            </div>
          </div>
        </Card>

        <InvoiceActions order={order} />
      </section>
    );
  } catch (e) {
    return notFound();
  }
}
