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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Keep isLoading=true until getCurrentUser() resolves; Header depends on this
  // to avoid flashing "Sign In" before session validation completes.
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setAuthToken(storedToken);
    authService
      .getCurrentUser()
      .then((currentUser) => {
        setToken(storedToken);
        setUser(currentUser);
      })
      .catch(() => {
        removeAuthToken();
      })
      .finally(() => setIsLoading(false));
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
