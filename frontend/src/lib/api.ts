import { authClient } from "./auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const session = authClient.getSession();
    const token = session?.data?.token;

    // Better Auth JWT plugin usually puts the token in the session object if configured
    // Since we are using HS256 symmetric JWT plugin, it should be available.

    const headers = new Headers(options.headers);
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401) {
            // Handle unauthorized - possibly redirect to login
            console.error("Unauthorized request");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "API request failed");
    }

    return response.json();
}
