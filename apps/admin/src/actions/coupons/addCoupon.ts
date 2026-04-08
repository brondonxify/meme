"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { couponFormSchema } from "@/app/(dashboard)/coupons/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { CouponServerActionResponse } from "@/types/server-action";
import { Coupon } from "@/types/models";

export async function addCoupon(
  formData: FormData
): Promise<CouponServerActionResponse> {
  const parsedData = couponFormSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    image: formData.get("image"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isPercentageDiscount: formData.get("isPercentageDiscount") === "true",
    discountValue: formData.get("discountValue"),
  });

  if (!parsedData.success) {
    return {
      validationErrors: formatValidationErrors(
        parsedData.error.flatten().fieldErrors
      ),
    };
  }

  const { image, ...couponData } = parsedData.data;

  // Note: Image upload would need to be handled separately
  try {
    const response = await serverApiRequest<ApiResponse<Coupon>>("/api/v1/coupons", {
      method: "POST",
      data: {
        campaign_name: couponData.name,
        code: couponData.code,
        start_date: couponData.startDate.toISOString(),
        end_date: couponData.endDate.toISOString(),
        discount_type: couponData.isPercentageDiscount ? "percentage" : "fixed",
        discount_value: couponData.discountValue,
        published: false,
      },
    });

    if (!response.success) {
      if (response.error?.toLowerCase().includes("unique") || response.error?.toLowerCase().includes("duplicate")) {
        return {
          validationErrors: {
            code: "This coupon code is already in use. Please create a unique code for your new coupon.",
          },
        };
      }
      return { dbError: response.error || "Something went wrong. Please try again later." };
    }

    revalidatePath("/coupons");

    return { success: true, coupon: response.data };
  } catch (error) {
    console.error("Coupon creation failed:", error);
    return { dbError: "Something went wrong. Please try again later." };
  }
}
