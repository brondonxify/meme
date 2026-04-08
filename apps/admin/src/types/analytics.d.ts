export interface DashboardStats {
  totalRevenue: string;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  ordersByStatus: {
    status: string;
    count: number;
  }[];
}

export interface SalesOverTime {
  date: string;
  revenue: string;
  orderCount: number;
}

export interface TopProduct {
  id: number;
  name: string;
  sku: string;
  imageUrl: string | null;
  totalSold: number;
  revenue: string;
}
