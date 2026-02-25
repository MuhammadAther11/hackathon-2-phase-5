'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession, signIn, signUp, signOut } from '@/lib/auth-client';

interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface Credentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  signup: (credentials: Credentials & { name?: string }) => Promise<void>;
  handleSessionExpiry: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isLoading } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (session?.user) {
      const u = session.user as unknown as Record<string, unknown>;
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: typeof u.name === 'string' ? u.name : undefined,
        avatarUrl: typeof u.avatarUrl === 'string' ? u.avatarUrl : undefined,
      });
    } else {
      setUser(null);
    }
  }, [session]);

  const login = async (credentials: Credentials) => {
    await signIn.email({ email: credentials.email, password: credentials.password });
  };

  const logout = async () => {
    await signOut();
  };

  const signup = async (credentials: Credentials & { name?: string }) => {
    const { error: signUpError } = await signUp.email({
      email: credentials.email,
      password: credentials.password,
      name: credentials.name,
    });
    if (signUpError) throw signUpError;
    // Auto-login after signup
    await login(credentials);
  };

  const handleSessionExpiry = () => {
    // Save current location for redirect after re-auth
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    // Show session expired message
    const event = new CustomEvent('session-expired', {
      detail: { message: 'Your session has expired. Please log in again.' },
    });
    window.dispatchEvent(event);
    // Redirect to login
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
    handleSessionExpiry,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
