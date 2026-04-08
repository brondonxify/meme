import { Fragment } from "react";
import { Metadata } from "next";

import PageTitle from "@/components/shared/PageTitle";
import SalesOverview from "./_components/SalesOverview";
import StatusOverview from "./_components/StatusOverview";
import DashboardCharts from "./_components/dashboard-charts";
import RecentOrders from "@/app/(dashboard)/orders/_components/orders-table";
import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";

export const metadata: Metadata = {
  title: "Dashboard",
};

interface DashboardStats {
  totalRevenue: string;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  ordersByStatus: { status: string; count: number }[];
}

async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const response = await serverApiRequest<ApiResponse<DashboardStats>>(
      "/api/v1/analytics/dashboard"
    );
    return response.data || null;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <Fragment>
      <section>
        <PageTitle>Dashboard Overview</PageTitle>

        <div className="space-y-8 mb-8">
          <SalesOverview stats={stats} />
          <StatusOverview stats={stats} />
          <DashboardCharts />
        </div>
      </section>

      <section>
        <PageTitle component="h2">Recent Orders</PageTitle>

        <RecentOrders />
      </section>
    </Fragment>
  );
}
