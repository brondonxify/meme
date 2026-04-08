"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { staffFormSchema } from "@/app/(dashboard)/staff/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { StaffServerActionResponse } from "@/types/server-action";

export async function editStaff(
  staffId: string,
  formData: FormData
): Promise<StaffServerActionResponse> {
  const parsedData = staffFormSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    image: formData.get("image"),
  });

  if (!parsedData.success) {
    return {
      validationErrors: formatValidationErrors(
        parsedData.error.flatten().fieldErrors
      ),
    };
  }

  const { image, ...staffData } = parsedData.data;

  if (image instanceof File && image.size > 0) {
    return {
      validationErrors: {
        image: "Image upload is not supported in this version",
      },
    };
  }

  try {
    const response = await serverApiRequest<ApiResponse<{ id: string }>>(
      `/api/v1/staff/${staffId}`,
      {
        method: "PUT",
        data: {
          name: staffData.name,
          phone: staffData.phone,
        },
      }
    );
    if (!response.success) {
      return { dbError: "Something went wrong. Please try again later." };
    }
  } catch (error) {
    console.error("Database update failed:", error);
    return { dbError: "Something went wrong. Please try again later." };
  }

  revalidatePath("/staff");

  return { success: true, staff: { id: staffId } as any };
}
