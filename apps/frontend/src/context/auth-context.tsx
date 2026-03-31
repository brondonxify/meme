"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { Admin, Customer } from 'shared';

interface AuthContextType {
    user: Admin | Customer | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    adminLogin: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Admin | Customer | null>(() => {
        if (typeof window !== 'undefined') {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;
    const isAdmin = !!(user && 'username' in user);

    useEffect(() => {
        const initAuth = async () => {
            const customerToken = localStorage.getItem('customer_token');
            const adminToken = localStorage.getItem('admin_token');

            if (adminToken || customerToken) {
                // If we already have user data from localStorage, we can turn off loading early
                // but we still want to verify the profile in the background
                setIsLoading(false);

                try {
                    if (adminToken) {
                        const profile = await authService.getAdminProfile();
                        // If profile check succeeds, we might want to update the saved user info
                        // but for now profile endpoints are just placeholders
                        // setUser(profile); 
                    } else {
                        const profile = await authService.getProfile();
                        // setUser(profile);
                    }
                } catch (error) {
                    console.error("Hydration check failed", error);
                    // If the token is invalid, we should clear everything
                    // localStorage.removeItem('admin_token');
                    // localStorage.removeItem('customer_token');
                    // localStorage.removeItem('user');
                    // setUser(null);
                }
            } else {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials: any) => {
        const data = await authService.login(credentials);
        setUser(data.user);
    };

    const adminLogin = async (credentials: any) => {
        const data = await authService.adminLogin(credentials);
        setUser(data.user);
    };

    const logout = async () => {
        if (isAdmin) {
            await authService.adminLogout();
        } else {
            await authService.logout();
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isLoading, login, adminLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
