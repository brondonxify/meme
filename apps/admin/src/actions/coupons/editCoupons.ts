"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { couponBulkFormSchema } from "@/app/(dashboard)/coupons/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { VServerActionResponse } from "@/types/server-action";

export async function editCoupons(
  couponIds: string[],
  formData: FormData
): Promise<VServerActionResponse> {
  const parsedData = couponBulkFormSchema.safeParse({
    published: !!(formData.get("published") === "true"),
  });

  if (!parsedData.success) {
    return {
      validationErrors: formatValidationErrors(
        parsedData.error.flatten().fieldErrors
      ),
    };
  }

  const { published } = parsedData.data;

  try {
    for (const couponId of couponIds) {
      await serverApiRequest<ApiResponse<{ id: string }>>(
        `/api/v1/coupons/${couponId}`,
        {
          method: "PUT",
          data: { published },
        }
      );
    }
  } catch (error) {
    console.error("Bulk update failed:", error);
    return { dbError: "Something went wrong. Please try again later." };
  }

  revalidatePath("/coupons");

  return { success: true };
}
