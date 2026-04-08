import { Coupon } from "@/services/coupons";
import { Order } from "@/services/orders";

type Props = {
  coupon: Pick<Coupon, "discount_type" | "discount_value"> | null | undefined;
  totalAmount: Order["total_amount"];
  shippingCost: Order["shipping_cost"];
};

export function getDiscount({ coupon, totalAmount, shippingCost }: Props) {
  let calculatedDiscount = 0;

  if (coupon) {
    if (coupon.discount_type === "fixed") {
      calculatedDiscount = coupon.discount_value;
    } else {
      const subtotal = Number(totalAmount) - Number(shippingCost);
      const originalPrice = (subtotal * 100) / (100 - Number(coupon.discount_value));
      calculatedDiscount = originalPrice - subtotal;
    }
  }

  return Math.round(calculatedDiscount).toString();
}
