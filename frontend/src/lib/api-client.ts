import { authClient } from "./auth-client";
import { getNetworkErrorMessage } from "./auth-errors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export class APIError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.detail = detail;
    
    // Properly set the prototype chain for ES5 inheritance
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

// Keep your original function logic
export async function apiFetch<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const session = authClient.getSession();
  const userId = session?.data?.user?.id;
  const token = session?.data?.token;

  // Endpoints that need Bearer token injected
  const authPrefixes = ["/tasks", "/tags", "/search", "/chat"];
  const isProtected = authPrefixes.some((p) => endpoint.startsWith(p));

  // Endpoints that also need /api/{userId} path rewriting (chat uses its own routes)
  const rewritePrefixes = ["/tasks", "/tags", "/search"];
  const needsRewrite = rewritePrefixes.some((p) => endpoint.startsWith(p));

  // If no session and trying to access protected endpoints, throw error
  if (!token && isProtected) {
    throw new APIError("Not authenticated. Please log in.", 401);
  }

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Path rewriting: only for tasks/tags/search → /api/{userId}/...
  // Chat endpoints go directly to /chat/... (no rewrite)
  let finalEndpoint = endpoint;
  if (userId && needsRewrite) {
    finalEndpoint = `/api/${userId}${endpoint}`;
  }
  const url = `${API_BASE_URL}${finalEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      redirect: 'follow',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Extract error message properly from various error formats
      let errorMessage = `API Error: ${response.status}`;
      const detail = (errorData as Record<string, unknown>)?.detail;
      
      if (detail) {
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          // FastAPI validation errors are arrays
          errorMessage = detail.map((e: any) => String(e.msg || e)).join('; ');
        } else {
          errorMessage = String(detail);
        }
      }

      // Handle 401 errors — clear stale token and redirect to login
      if (response.status === 401) {
        console.warn("[API] 401 Unauthorized - clearing stale session");
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          document.cookie = "auth_token=; path=/; max-age=0";
          window.location.href = "/login";
        }
      }

      // Ensure errorMessage is always a string
      throw new APIError(String(errorMessage), response.status, detail);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as T;
    }

    return await response.json() as T;
  } catch (err: unknown) {
    // Re-throw APIError as-is
    if (err instanceof APIError) {
      throw err;
    }
    // Handle network errors
    if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
      throw new APIError(getNetworkErrorMessage(err), 0);
    }
    // Re-throw any other error
    throw err;
  }
}

/** * ✅ ADD THIS: The Object wrapper that components are looking for
 * This maps .post(), .get(), etc. to your apiFetch function
 */
export const apiClient = {
  get: <T>(url: string, options?: RequestInit) =>
    apiFetch<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, data?: any, options?: RequestInit) =>
    apiFetch<T>(url, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data)
    }),

  put: <T>(url: string, data?: any, options?: RequestInit) =>
    apiFetch<T>(url, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data)
    }),

  delete: <T>(url: string, options?: RequestInit) =>
    apiFetch<T>(url, { ...options, method: 'DELETE' }),
};