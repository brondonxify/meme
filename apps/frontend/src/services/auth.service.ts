import apiClient from '../lib/api';
import { Admin, Customer } from 'shared';

export interface LoginResponse {
    token: string;
    user: Admin | Customer;
}

export const authService = {
    // Admin Auth
    adminLogin: async (credentials: Pick<Admin, 'username' | 'password'>) => {
        const response = await apiClient.post<LoginResponse>('/auth/admin/login', credentials);
        if (response.data.token) {
            localStorage.setItem('admin_token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    adminLogout: async () => {
        await apiClient.post('/auth/admin/logout');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user');
    },

    getAdminProfile: async () => {
        const response = await apiClient.get<Admin>('/auth/admin/me');
        return response.data;
    },

    // Customer Auth
    register: async (customer: Omit<Customer, 'id' | 'created_at'>) => {
        const response = await apiClient.post<Customer>('/auth/register', customer);
        return response.data;
    },

    login: async (credentials: Pick<Customer, 'email' | 'password'>) => {
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('customer_token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: async () => {
        await apiClient.post('/auth/logout');
        localStorage.removeItem('customer_token');
        localStorage.removeItem('user');
    },

    getProfile: async () => {
        const response = await apiClient.get<Customer>('/auth/me');
        return response.data;
    },
};
