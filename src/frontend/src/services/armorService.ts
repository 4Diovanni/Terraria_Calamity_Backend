import apiClient from './apiClient';
import { Armor } from '../types/armor';

/**
 * Serviço de Armaduras.
 * Comunica com a API em /api/v1/armor.
 */

const BASE_URL = '/api/v1/armor';

export const armorService = {
  async getAllArmors(): Promise<Armor[]> {
    const response = await apiClient.get<Armor[]>(BASE_URL);
    return response.data;
  },

  async getArmorById(id: string): Promise<Armor> {
    const response = await apiClient.get<Armor>(`${BASE_URL}/${id}`);
    return response.data;
  },
};
