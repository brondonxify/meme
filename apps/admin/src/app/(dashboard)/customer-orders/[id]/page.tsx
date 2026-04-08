import { Metadata } from "next";
import { notFound } from "next/navigation";
import { IoBagHandle } from "react-icons/io5";

import { Card } from "@/components/ui/card";
import Typography from "@/components/ui/typography";
import PageTitle from "@/components/shared/PageTitle";

import CustomerOrdersTable from "./_components/Table";
import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { CustomerOrder } from "@/services/customers";

type PageParams = {
  params: Promise<{
    id: string;
  }>;
};

async function getCustomerOrders(customerId: string): Promise<CustomerOrder[]> {
  const response = await serverApiRequest<ApiResponse<CustomerOrder[]>>(
    `/api/v1/customers/${customerId}/orders`
  );
  const responseData = response.data as any;
  return responseData?.items || response.data || [];
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { id } = await params;
  try {
    const customerOrders = await getCustomerOrders(id);

    if (customerOrders.length === 0) {
      return { title: "No customer orders" };
    }

    return { title: customerOrders[0].customers?.first_name || "Customer" };
  } catch (e) {
    return { title: "Customer not found" };
  }
}

export default async function CustomerOrders({ params }: PageParams) {
  const { id } = await params;
  try {
    const customerOrders = await getCustomerOrders(id);

    return (
      <section>
        <PageTitle>Customer Order List</PageTitle>

        {customerOrders.length === 0 ? (
          <Card className="w-full flex flex-col text-center items-center py-8">
            <IoBagHandle className="text-red-500 size-20 mb-4" />
            <Typography>This customer has no order yet!</Typography>
          </Card>
        ) : (
          <CustomerOrdersTable data={customerOrders} />
        )}
      </section>
    );
  } catch (e) {
    return notFound();
  }
}
