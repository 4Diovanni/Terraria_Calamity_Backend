import React, { createContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { setAuthToken, removeAuthToken } from '../services/apiClient';
import type { AuthUser } from '../types/auth';

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwtPayload(
  token: string
): { username: string; email: string; role: 'USER' | 'ADMIN'; exp: number } | null {
  try {
    const segment = token.split('.')[1];
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      const payload = decodeJwtPayload(storedToken);
      if (payload && payload.exp * 1000 > Date.now()) {
        setAuthToken(storedToken);
        setToken(storedToken);
        setUser({ username: payload.username, email: payload.email, role: payload.role });
      } else {
        removeAuthToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    setAuthToken(data.token);
    setToken(data.token);
    setUser({ username: data.username, email: data.email, role: data.role });
  };

  const register = async (username: string, email: string, password: string) => {
    const data = await authService.register({ username, email, password });
    setAuthToken(data.token);
    setToken(data.token);
    setUser({ username: data.username, email: data.email, role: data.role });
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
