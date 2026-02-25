"use client";

import { useState, useEffect } from "react";

// Define types for our auth responses
interface User {
  id: string;
  email: string;
  created_at: string;
}

interface LoginResponse {
  user: User;
  access_token: string;
  token_type: string;
}

interface SignupResponse {
  id: string;
  email: string;
  created_at: string;
}

interface Session {
  user: User;
  token: string;
}

interface Credentials {
  email: string;
  password: string;
  name?: string;
}

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Log configuration for debugging
if (typeof window !== "undefined") {
  console.log("[Auth] Configuration:", {
    API_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    hasAuthSecret: !!process.env.BETTER_AUTH_SECRET,
  });
}

// Auth client implementation
class AuthClient {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("auth_user");

      if (savedToken && savedUser) {
        this.token = savedToken;
        this.user = JSON.parse(savedUser);
      }
    }
  }

  // Save session to localStorage and cookie
  private saveSession(token: string, user: User) {
    this.token = token;
    this.user = user;

    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));

      // Also set as cookie for server-side middleware
      document.cookie = `auth_token=${token}; path=/; max-age=86400`;
    }
  }

  // Clear session
  private clearSession() {
    this.token = null;
    this.user = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      // Also clear the cookie
      document.cookie = "auth_token=; path=/; max-age=0";
    }
  }

  // Signup
  async signUp(credentials: { email: string; password: string }) {
    try {
      const url = `${API_BASE_URL}/auth/signup`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.detail || `Signup failed with status ${response.status}`;
        console.error(`[Auth] Signup error at ${url}:`, { status: response.status, error: errorMsg });
        throw new Error(errorMsg);
      }

      const data: SignupResponse = await response.json();
      return { user: data, error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Auth] Signup exception:", message);
      return { user: null, error: { message } };
    }
  }

  // Login
  async signIn(credentials: { email: string; password: string }) {
    try {
      const url = `${API_BASE_URL}/auth/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.detail || `Login failed with status ${response.status}`;
        console.error(`[Auth] Login error at ${url}:`, { status: response.status, error: errorMsg });
        throw new Error(errorMsg);
      }

      const data: LoginResponse = await response.json();

      // Save session
      this.saveSession(data.access_token, data.user);

      return { session: { user: data.user, token: data.access_token }, error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Auth] Login exception:", message);
      return { session: null, error: { message } };
    }
  }

  // Logout
  async signOut() {
    try {
      const currentToken = this.token;

      // Clear session first
      this.clearSession();

      // Make logout API call (optional, for server-side cleanup)
      if (currentToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        }).catch(() => {}); // Ignore logout API errors
      }

      return { error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { error: { message } };
    }
  }

  // Get current session — always re-read from localStorage to avoid SSR null
  getSession() {
    if (typeof window !== "undefined" && !this.token) {
      const savedToken = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("auth_user");
      if (savedToken && savedUser) {
        try {
          this.token = savedToken;
          this.user = JSON.parse(savedUser);
        } catch {
          // ignore corrupt data
        }
      }
    }
    if (this.token && this.user) {
      return { data: { user: this.user, token: this.token }, error: null };
    }
    return { data: null, error: null };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }
}

// Create singleton instance
export const authClient = new AuthClient();

// Export convenience functions
export const signUp = {
  email: (credentials: { email: string; password: string; name?: string }) => authClient.signUp(credentials as Credentials)
};

export const signIn = {
  email: (credentials: { email: string; password: string }) => authClient.signIn(credentials)
};

export const signOut = () => authClient.signOut();

// Custom hook for session
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark component as mounted
    setMounted(true);

    const checkSession = () => {
      const sess = authClient.getSession();
      setSession(sess.data as Session);
      setLoading(false);
    };

    checkSession();

    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = () => {
      checkSession();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, []);

  return { data: session, isLoading: loading || !mounted };
}
