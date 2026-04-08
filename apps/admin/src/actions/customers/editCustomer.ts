"use server";

import { revalidatePath } from "next/cache";

import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { customerFormSchema } from "@/app/(dashboard)/customers/_components/form/schema";
import { formatValidationErrors } from "@/helpers/formatValidationErrors";
import { CustomerServerActionResponse } from "@/types/server-action";

export async function editCustomer(
  customerId: string,
  formData: FormData
): Promise<CustomerServerActionResponse> {
  const parsedData = customerFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });

  if (!parsedData.success) {
    return {
      validationErrors: formatValidationErrors(
        parsedData.error.flatten().fieldErrors
      ),
    };
  }

  const customerData = parsedData.data;

  try {
    const response = await serverApiRequest<ApiResponse<{ id: string }>>(
      `/api/v1/customers/${customerId}`,
      {
        method: "PUT",
        data: {
          first_name: customerData.name,
          last_name: "",
          email: customerData.email,
          phone: customerData.phone,
        },
      }
    );

    if (!response.success) {
      return { dbError: response.error || "Something went wrong. Please try again later." };
    }

    revalidatePath("/customers");
    revalidatePath(`/customer-orders/${customerId}`);

    return { success: true, customer: response.data };
  } catch (error) {
    console.error("Customer update failed:", error);
    return { dbError: "Something went wrong. Please try again later." };
  }
}
