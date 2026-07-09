import apiClient from './apiClient';
import { WeaponSubmission, WeaponSubmissionRequest, SubmissionStatus } from '../types/weaponSubmission';

const BASE_URL = '/api/v1/submissions';

export const submissionService = {
  async create(entityType: 'WEAPON', data: WeaponSubmissionRequest): Promise<WeaponSubmission> {
    try {
      const response = await apiClient.post<WeaponSubmission>(BASE_URL, data, { params: { entityType } });
      return response.data;
    } catch (error) {
      console.error('❌ [SubmissionService] Erro ao criar submissão:', error);
      throw error;
    }
  },

  async getMine(entityType: 'WEAPON'): Promise<WeaponSubmission[]> {
    try {
      const response = await apiClient.get<WeaponSubmission[]>(`${BASE_URL}/mine`, { params: { entityType } });
      return response.data;
    } catch (error) {
      console.error('❌ [SubmissionService] Erro ao buscar minhas submissões:', error);
      throw error;
    }
  },

  async cancel(id: string): Promise<void> {
    try {
      await apiClient.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      console.error(`❌ [SubmissionService] Erro ao cancelar submissão ${id}:`, error);
      throw error;
    }
  },

  async getAll(entityType: 'WEAPON', status: SubmissionStatus = 'PENDING'): Promise<WeaponSubmission[]> {
    try {
      const response = await apiClient.get<WeaponSubmission[]>(BASE_URL, { params: { entityType, status } });
      return response.data;
    } catch (error) {
      console.error('❌ [SubmissionService] Erro ao listar submissões:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<WeaponSubmission> {
    try {
      const response = await apiClient.get<WeaponSubmission>(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ [SubmissionService] Erro ao buscar submissão ${id}:`, error);
      throw error;
    }
  },

  async approve(id: string): Promise<WeaponSubmission> {
    try {
      const response = await apiClient.post<WeaponSubmission>(`${BASE_URL}/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error(`❌ [SubmissionService] Erro ao aprovar submissão ${id}:`, error);
      throw error;
    }
  },

  async reject(id: string, reason: string): Promise<WeaponSubmission> {
    try {
      const response = await apiClient.post<WeaponSubmission>(`${BASE_URL}/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error(`❌ [SubmissionService] Erro ao rejeitar submissão ${id}:`, error);
      throw error;
    }
  },
};
