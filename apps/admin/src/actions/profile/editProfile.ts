"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { profileFormSchema } from "@/app/(dashboard)/edit-profile/_components/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { ProfileServerActionResponse } from "@/types/server-action";

export async function editProfile(
  userId: string,
  formData: FormData
): Promise<ProfileServerActionResponse> {
  const parsedData = profileFormSchema.safeParse({
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

  const { image, ...profileData } = parsedData.data;

  if (image instanceof File && image.size > 0) {
    return {
      validationErrors: {
        image: "Image upload is not supported in this version",
      },
    };
  }

  try {
    const response = await serverApiRequest<ApiResponse<{ id: string }>>(
      `/api/v1/staff/${userId}`,
      {
        method: "PUT",
        data: {
          name: profileData.name,
          phone: profileData.phone,
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

  revalidatePath("/edit-profile");

  return { success: true };
}
