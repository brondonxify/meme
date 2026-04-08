import { FaBagShopping } from "react-icons/fa6";
import { format } from "date-fns";

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

import { OrderDetails } from "@/services/orders/types";
import { OrderBadgeVariants } from "@/constants/badge";

export default function InvoicePdfTemplate({ order }: { order: OrderDetails }) {
  return (
    <Card
      id={`invoice-${order.invoice_no}`}
      className="text-black p-20 border-none bg-white rounded-none"
      style={{ width: "794px", height: "1123px" }}
    >
      <div className="flex justify-between gap-x-4 gap-y-6">
        <div className="flex flex-col">
          <Typography
            className="uppercase text-black mb-1.5 tracking-wide"
            variant="h2"
          >
            invoice
          </Typography>

          <div className="group light-only flex items-center gap-x-2">
            <Typography className="uppercase font-semibold text-xs">
              status
            </Typography>

            {/* positioning and translate is to rectify html2canvas incorrect rendering */}
            <Badge
              variant={OrderBadgeVariants[order.status]}
              className="flex-shrink-0 text-xs capitalize translate-y-1.5 relative"
            >
              <span className="text-transparent">{order.status}</span>
              <span className="absolute left-2.5 capitalize bottom-2">
                {order.status}
              </span>
            </Badge>
          </div>
        </div>

        <div className="flex flex-col text-sm gap-y-0.5 text-right text-black">
          <div className="flex items-end justify-end gap-x-1">
            <FaBagShopping className="size-6 text-primary flex-shrink-0" />

            {/* margin bottom style is to rectify html2canvas incorrect rendering */}
            <Typography component="span" variant="h2" className="mb-1.5">
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

      <Separator className="my-6 bg-print-border" />

      <div className="flex justify-between gap-4 mb-10 text-black">
        <div>
          <Typography
            variant="p"
            component="h4"
            className="font-semibold uppercase mb-1 text-black"
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
            className="font-semibold uppercase mb-1 text-black"
          >
            invoice no
          </Typography>

          <Typography className="text-sm">#{order.invoice_no}</Typography>
        </div>

        <div className="text-right">
          <Typography
            variant="p"
            component="h4"
            className="font-semibold uppercase mb-1 text-black"
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

      <div className="border rounded-md overflow-hidden mb-10 text-black border-print-border">
        <Table>
          <TableHeader>
            <TableRow className="border-b-print-border hover:bg-transparent">
              <TableHead className="uppercase h-10 whitespace-nowrap text-black">
                SR.
              </TableHead>
              <TableHead className="uppercase h-10 whitespace-nowrap text-black">
                product title
              </TableHead>
              <TableHead className="uppercase h-10 whitespace-nowrap text-center text-black">
                quantity
              </TableHead>
              <TableHead className="uppercase h-10 whitespace-nowrap text-center text-black">
                item price
              </TableHead>
              <TableHead className="uppercase h-10 whitespace-nowrap text-right text-black">
                amount
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {order.items.map((orderItem: any, index: number) => (
              <TableRow
                key={`order-item-${index}`}
                className="hover:bg-transparent border-b-print-border"
              >
                <TableCell className="py-3 font-normal text-black">
                  {index + 1}
                </TableCell>
                <TableCell className="py-3 px-6 font-normal text-black">
                  {orderItem.article_name}
                </TableCell>
                <TableCell className="py-3 text-center font-normal text-black">
                  {orderItem.quantity}
                </TableCell>
                <TableCell className="py-3 text-center font-normal text-black uppercase">
                  {orderItem.unit_price.toFixed(0)} XAF
                </TableCell>
                <TableCell className="font-semibold py-3 text-primary text-right text-black uppercase">
                  {(orderItem.quantity * orderItem.unit_price).toFixed(0)} XAF
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg flex gap-4 justify-between md:flex-row px-2">
        <div>
          <Typography
            component="h4"
            className="font-medium text-sm uppercase mb-1 tracking-wide text-black"
          >
            payment method
          </Typography>

          <Typography className="text-base capitalize font-semibold tracking-wide text-black">
            {order.payment_method}
          </Typography>
        </div>

        <div>
          <Typography
            component="h4"
            className="font-medium text-sm uppercase mb-1 tracking-wide text-black"
          >
            shipping cost
          </Typography>

          <Typography className="text-base capitalize font-semibold tracking-wide text-black uppercase">
            {order.shipping_cost.toFixed(0)} XAF
          </Typography>
        </div>

        <div>
          <Typography
            component="h4"
            className="font-medium text-sm uppercase mb-1 tracking-wide text-black"
          >
            discount
          </Typography>

          <Typography className="text-base capitalize font-semibold tracking-wide text-black uppercase">
            {order.coupon
              ? order.coupon.discount_type === "fixed"
                ? order.coupon.discount_value.toFixed(0)
                : (
                    ((order.total_amount - order.shipping_cost) * 100) /
                      (100 - order.coupon.discount_value) -
                    (order.total_amount - order.shipping_cost)
                  ).toFixed(0)
              : "0"} XAF
          </Typography>
        </div>

        <div>
          <Typography
            component="h4"
            className="font-medium text-sm uppercase mb-1 tracking-wide text-black"
          >
            total amount
          </Typography>

          <Typography className="text-xl capitalize font-semibold tracking-wide text-primary uppercase">
            {order.total_amount.toFixed(0)} XAF
          </Typography>
        </div>
      </div>
    </Card>
  );
}
