"use server";

import { revalidatePath } from "next/cache";
import { staffFormSchema } from "@/app/(dashboard)/staff/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { StaffServerActionResponse } from "@/types/server-action";
import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await import("next/headers").then(m => m.cookies());
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

export async function editStaff(
  staffId: number,
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

  let imageUrl: string | undefined;

  if (image instanceof File && image.size > 0) {
    try {
      imageUrl = await uploadImage(image, `staff/${staffData.name}`);
    } catch {
      return { validationErrors: { image: "Failed to upload image" } };
    }
  }

  try {
    const response = await serverApiRequest<ApiResponse<{ id: number }>>(
      `staff/${staffId}`,
      {
        method: "PUT",
        data: {
          name: staffData.name,
          phone: staffData.phone,
          ...(imageUrl && { image_url: imageUrl }),
        },
      }
    );

    if (!response.success) {
      return { dbError: response.error || "Failed to update staff" };
    }
  } catch {
    return { dbError: "Something went wrong. Please try again later." };
  }

  revalidatePath("/staff");

  return { success: true, staff: { id: staffId } as any };
}

export async function deleteStaff(staffId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await serverApiRequest<ApiResponse<{ id: number }>>(
      `staff/${staffId}`,
      { method: "DELETE" }
    );

    if (!response.success) {
      return { success: false, error: response.error || "Could not delete the staff." };
    }

    revalidatePath("/staff");
    return { success: true };
  } catch {
    return { success: false, error: "Could not delete the staff." };
  }
}
