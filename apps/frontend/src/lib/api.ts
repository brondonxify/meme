import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const customerToken = typeof window !== 'undefined' ? localStorage.getItem('customer_token') : null;
        const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

        const isAdminRequest = config.url?.includes('/admin/');
        const isCustomerProfileRequest = config.url === '/auth/me';

        if (isAdminRequest) {
            if (adminToken) config.headers.Authorization = `Bearer ${adminToken}`;
        } else if (isCustomerProfileRequest) {
            if (customerToken) config.headers.Authorization = `Bearer ${customerToken}`;
        } else {
            // For other requests (orders, products, etc.), try customer first, then admin
            if (customerToken) {
                config.headers.Authorization = `Bearer ${customerToken}`;
            } else if (adminToken) {
                config.headers.Authorization = `Bearer ${adminToken}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const message = (error.response?.data as any)?.message || error.message || 'An unexpected error occurred';
        console.error(`API Error: ${message}`, error.response?.data);

        // Handle 401 Unauthorized globally if needed (e.g., redirect to login)
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            // Potentially clear tokens and redirect
            // localStorage.removeItem('customer_token');
            // localStorage.removeItem('admin_token');
        }

        return Promise.reject(error);
    }
);

export default apiClient;
