// Shared types for Admin entity
export interface Admin {
    id?: number;
    username: string;
    email: string;
    password?: string; // Optional on client side
    created_at?: Date;
}

// Shared types for Category entity
export interface Category {
    id?: number;
    name: string;
    description?: string;
}

// Shared types for Customer entity
export interface Customer {
    id?: number;
    first_name: string;
    last_name: string;
    email: string;
    password?: string; // Optional on client side
    phone?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    created_at?: Date;
}

// Shared types for Article entity
export interface Article {
    id?: number;
    name: string;
    description?: string;
    price: number;
    stock_quantity: number;
    image_url?: string;
    category_id: number;
    created_at?: Date;
}

// Order status enum
export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

// Payment status enum
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

// Shared types for Order entity
export interface Order {
    id?: number;
    order_date?: Date;
    status: OrderStatus;
    payment_status: PaymentStatus;
    total_amount: number;
    customer_id: number;
    tracking_number?: string;
    estimated_delivery?: Date;
}

// Shared types for OrderDetail entity
export interface OrderDetail {
    order_id: number;
    article_id: number;
    quantity: number;
    unit_price: number;
}

// Extended types for API responses
export interface OrderWithDetails extends Order {
    items: (OrderDetail & { article_name?: string; image_url?: string })[];
}

export interface ArticleWithCategory extends Article {
    category_name?: string;
}
