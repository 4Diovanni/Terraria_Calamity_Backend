import apiClient from './apiClient';
import { AdminDashboard } from '../types/weaponSubmission';

const BASE_URL = '/api/v1/admin';

export const adminService = {
  async getDashboard(): Promise<AdminDashboard> {
    try {
      const response = await apiClient.get<AdminDashboard>(`${BASE_URL}/dashboard`);
      return response.data;
    } catch (error) {
      console.error('❌ [AdminService] Erro ao buscar dashboard:', error);
      throw error;
    }
  },
};
