"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { couponFormSchema } from "@/app/(dashboard)/coupons/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { CouponServerActionResponse } from "@/types/server-action";
import { Coupon } from "@/types/models";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function uploadImage(file: File, path: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", path);

  const res = await fetch(`${BACKEND_URL}/api/v1/upload`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload image");
  }

  const json = await res.json();
  return json.data.url as string;
}

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

  let imageUrl: string | undefined;

  if (image instanceof File && image.size > 0) {
    try {
      imageUrl = await uploadImage(image, `coupons/${couponData.code}`);
    } catch {
      return { validationErrors: { image: "Failed to upload image" } };
    }
  }

  try {
    const response = await serverApiRequest<ApiResponse<Coupon>>("/api/v1/coupons", {
      method: "POST",
      data: {
        campaign_name: couponData.name,
        code: couponData.code,
        image_url: imageUrl,
        discount_type: couponData.isPercentageDiscount ? "percentage" : "fixed",
        discount_value: couponData.discountValue,
        start_date: couponData.startDate.toISOString(),
        end_date: couponData.endDate.toISOString(),
        published: true,
      },
    });

    if (!response.success) {
      if (response.error?.toLowerCase().includes("unique") || response.error?.toLowerCase().includes("duplicate")) {
        return {
          validationErrors: {
            code: "This coupon code is already in use. Please create a unique code.",
          },
        };
      }
      return { dbError: response.error || "Something went wrong. Please try again later." };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("already exists") || message.includes("DUPLICATE")) {
      return {
        validationErrors: {
          code: "This coupon code is already in use. Please create a unique code.",
        },
      };
    }
    return { dbError: "Something went wrong. Please try again later." };
  }

  revalidatePath("/coupons");

  return { success: true };
}

export async function editCoupon(
  couponId: number,
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

  let imageUrl: string | undefined;

  if (image instanceof File && image.size > 0) {
    try {
      imageUrl = await uploadImage(image, `coupons/${couponData.code}`);
    } catch {
      return { validationErrors: { image: "Failed to upload image" } };
    }
  }

  try {
    const response = await serverApiRequest<ApiResponse<Coupon>>(
      `/api/v1/coupons/${couponId}`,
      {
        method: "PUT",
        data: {
          campaign_name: couponData.name,
          code: couponData.code,
          ...(imageUrl && { image_url: imageUrl }),
          discount_type: couponData.isPercentageDiscount ? "percentage" : "fixed",
          discount_value: couponData.discountValue,
          start_date: couponData.startDate.toISOString(),
          end_date: couponData.endDate.toISOString(),
        },
      }
    );

    if (!response.success) {
      if (response.error?.toLowerCase().includes("unique") || response.error?.toLowerCase().includes("duplicate")) {
        return {
          validationErrors: {
            code: "This coupon code is already in use. Please create a unique code.",
          },
        };
      }
      return { dbError: response.error || "Something went wrong. Please try again later." };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("already exists") || message.includes("DUPLICATE")) {
      return {
        validationErrors: {
          code: "This coupon code is already in use. Please create a unique code.",
        },
      };
    }
    return { dbError: "Something went wrong. Please try again later." };
  }

  revalidatePath("/coupons");

  return { success: true };
}

export async function deleteCoupon(couponId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await serverApiRequest<ApiResponse<{ id: string }>>(
      `/api/v1/coupons/${couponId}`,
      { method: "DELETE" }
    );

    if (!response.success) {
      return { success: false, error: response.error || "Could not delete the coupon." };
    }

    revalidatePath("/coupons");
    return { success: true };
  } catch {
    return { success: false, error: "Could not delete the coupon." };
  }
}
