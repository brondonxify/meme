import pool from '../db/connection.js';
import type { RowDataPacket } from 'mysql2';

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

export const AnalyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const [revenueRows] = await pool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status != 'cancelled'`
    );
    const totalRevenue = revenueRows[0].total_revenue.toString();

    const [ordersRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total_orders FROM orders`
    );
    const totalOrders = ordersRows[0].total_orders as number;

    const [customersRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total_customers FROM customer`
    );
    const totalCustomers = customersRows[0].total_customers as number;

    const [productsRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total_products FROM article WHERE published = TRUE`
    );
    const totalProducts = productsRows[0].total_products as number;

    const [lowStockRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as low_stock_count FROM article WHERE stock <= min_stock_threshold AND published = TRUE`
    );
    const lowStockCount = lowStockRows[0].low_stock_count as number;

    const [statusRows] = await pool.query<RowDataPacket[]>(
      `SELECT status, COUNT(*) as count FROM orders GROUP BY status`
    );
    const ordersByStatus = statusRows.map(row => ({
      status: row.status as string,
      count: row.count as number
    }));

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockCount,
      ordersByStatus
    };
  },

  async getSalesOverTime(days: number = 30): Promise<SalesOverTime[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DATE(order_time) as date,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as order_count
      FROM orders 
      WHERE order_time >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND status != 'cancelled'
      GROUP BY DATE(order_time)
      ORDER BY date ASC`,
      [days]
    );

    return rows.map(row => ({
      date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : String(row.date),
      revenue: row.revenue.toString(),
      orderCount: row.order_count as number
    }));
  },

  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        a.id,
        a.name,
        a.sku,
        a.image_url,
        COALESCE(SUM(od.quantity), 0) as total_sold,
        COALESCE(SUM(od.quantity * od.unit_price), 0) as revenue
      FROM article a
      LEFT JOIN order_details od ON a.id = od.article_id
      LEFT JOIN orders o ON od.order_id = o.id AND o.status != 'cancelled'
      WHERE a.published = TRUE
      GROUP BY a.id, a.name, a.sku, a.image_url
      HAVING total_sold > 0
      ORDER BY total_sold DESC
      LIMIT ?`,
      [limit]
    );

    return rows.map(row => ({
      id: row.id as number,
      name: row.name as string,
      sku: row.sku as string,
      imageUrl: row.image_url as string | null,
      totalSold: row.total_sold as number,
      revenue: row.revenue.toString()
    }));
  }
};