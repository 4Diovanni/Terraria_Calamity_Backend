import apiClient from './apiClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

const BASE_URL = '/api/v1/auth';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${BASE_URL}/login`, data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`${BASE_URL}/register`, data);
    return response.data;
  },
};
