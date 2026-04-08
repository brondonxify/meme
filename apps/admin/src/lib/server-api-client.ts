import { cookies } from "next/headers";

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    meta?: {
        total: number;
        page: number;
        limit: number;
    };
}

async function getServerToken(): Promise<string | undefined> {
    try {
        const cookieStore = await cookies();
        return cookieStore.get("auth_token")?.value;
    } catch {
        return undefined;
    }
}

export async function serverApiRequest<T>(
    path: string,
    options: RequestInit & { data?: any } = {},
): Promise<T> {
    const token = await getServerToken();
    const baseURL = process.env.BACKEND_URL || "http://localhost:3001";

    const { data, ...fetchOptions } = options;

    const response = await fetch(`${baseURL}${path}`, {
        ...fetchOptions,
        body: data ? JSON.stringify(data) : fetchOptions.body,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...((fetchOptions.headers as Record<string, string>) || {}),
        },
    });

    const output = await response.json().catch(() => ({}));

    if (!response.ok) {
        // Return as a failed ApiResponse so callers can check .success / .error
        return {
            success: false,
            error: output?.error?.message || output?.error || output?.message || `HTTP ${response.status}`,
            data: null,
        } as T;
    }

    return output;
}
