import type { Customer, Admin, Article, Category, Order, Coupon, Staff, ApiResponse, AuthResponse, PaginatedResponse } from '@meme/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = this.token;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.message || error.error || 'Request failed');
    }

    return response.json();
  }

  setToken(token: string | null) {
    this.token = token;
  }

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: { email: string; password: string; first_name: string; last_name: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<ApiResponse<Customer>> {
    return this.request<ApiResponse<Customer>>('/auth/me');
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>('/auth/logout', { method: 'POST' });
  }

  // Admin Auth
  async adminLogin(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getAdminMe(): Promise<ApiResponse<Admin>> {
    return this.request<ApiResponse<Admin>>('/auth/admin/me');
  }

  async adminLogout(): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>('/auth/admin/logout', { method: 'POST' });
  }

  // Articles (Products)
  async getArticles(params?: { category?: number; search?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Article>> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    
    return this.request<PaginatedResponse<Article>>(`/articles?${query}`);
  }

  async getArticle(id: number): Promise<ApiResponse<Article>> {
    return this.request<ApiResponse<Article>>(`/articles/${id}`);
  }

  async createArticle(data: Partial<Article>): Promise<ApiResponse<Article>> {
    return this.request<ApiResponse<Article>>('/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateArticle(id: number, data: Partial<Article>): Promise<ApiResponse<Article>> {
    return this.request<ApiResponse<Article>>(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteArticle(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/articles/${id}`, { method: 'DELETE' });
  }

  // Categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request<ApiResponse<Category[]>>('/categories');
  }

  async getCategory(id: number): Promise<ApiResponse<Category>> {
    return this.request<ApiResponse<Category>>(`/categories/${id}`);
  }

  async createCategory(data: Partial<Category>): Promise<ApiResponse<Category>> {
    return this.request<ApiResponse<Category>>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<ApiResponse<Category>> {
    return this.request<ApiResponse<Category>>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/categories/${id}`, { method: 'DELETE' });
  }

  // Orders
  async getOrders(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Order>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    
    return this.request<PaginatedResponse<Order>>(`/orders?${query}`);
  }

  async getOrder(id: number): Promise<ApiResponse<Order>> {
    return this.request<ApiResponse<Order>>(`/orders/${id}`);
  }

  async createOrder(data: { customer_id: number; items: { article_id: number; quantity: number }[] }): Promise<ApiResponse<Order>> {
    return this.request<ApiResponse<Order>>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelOrder(id: number): Promise<ApiResponse<Order>> {
    return this.request<ApiResponse<Order>>(`/orders/${id}/cancel`, { method: 'POST' });
  }

  async verifyOrder(id: number): Promise<ApiResponse<Order>> {
    return this.request<ApiResponse<Order>>(`/orders/${id}/verify`, { method: 'POST' });
  }

  async getOrderDetails(id: number): Promise<ApiResponse<Order>> {
    return this.request<ApiResponse<Order>>(`/orders/${id}/details`);
  }

  async getCustomerOrders(customerId: number): Promise<PaginatedResponse<Order>> {
    return this.request<PaginatedResponse<Order>>(`/orders/customer/${customerId}`);
  }

  // Customers
  async getCustomers(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Customer>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    
    return this.request<PaginatedResponse<Customer>>(`/customers?${query}`);
  }

  async getCustomer(id: number): Promise<ApiResponse<Customer>> {
    return this.request<ApiResponse<Customer>>(`/customers/${id}`);
  }

  async updateCustomer(id: number, data: Partial<Customer>): Promise<ApiResponse<Customer>> {
    return this.request<ApiResponse<Customer>>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/customers/${id}`, { method: 'DELETE' });
  }

  // Admin Dashboard
  async getAdminStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/stats');
  }

  async getTopProducts(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/top-products');
  }

  async getLowStock(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/low-stock');
  }

  async getActivityFeed(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/activity-feed');
  }

  async getRecentOrders(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/recent-orders');
  }

  async getOrderBreakdown(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/order-breakdown');
  }

  async getRevenueTrend(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/admin/revenue-trend');
  }

  // Contact
  async submitContact(data: { name: string; email: string; subject: string; message: string }): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
