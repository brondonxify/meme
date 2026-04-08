"use client";

import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";

export type UserRole = "super_admin" | "admin" | "cashier";

type UserProfile = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
};

type UserContextType = {
  user: UserProfile | null;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        if (response.status === 401) return null;
        throw new Error("Failed to fetch user profile");
      }
      const data = await response.json();
      return data.data || data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const value = {
    user: data ?? null,
    isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
