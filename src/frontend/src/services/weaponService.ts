import apiClient from './apiClient';
import { Weapon, WeaponFilters } from '../types/weapon';
import { ApiResponse } from '../types/api';

/**
 * Serviço para gerenciar armas
 * Comunica com a API em /api/v1/weapons
 */

const BASE_URL = '/api/v1/weapons';

export const weaponService = {
  /**
   * Busca todas as armas
   * ✅ EXECUTA UMA VEZ ao montar o componente
   */
  async getAllWeapons(): Promise<Weapon[]> {
    try {
      const response = await apiClient.get<Weapon[]>(BASE_URL);
      console.log('✅ [WeaponService] Armas carregadas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [WeaponService] Erro ao buscar armas:', error);
      throw error;
    }
  },

  /**
   * Busca uma arma por ID
   */
  async getWeaponById(id: string): Promise<Weapon> {
    try {
      const response = await apiClient.get<Weapon>(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ [WeaponService] Erro ao buscar arma ${id}:`, error);
      throw error;
    }
  },

  /**
   * Busca armas por elemento
   */
  async getWeaponsByElement(element: string): Promise<Weapon[]> {
    try {
      const response = await apiClient.get<Weapon[]>(`${BASE_URL}/element/${element}`);
      return response.data;
    } catch (error) {
      console.error(`❌ [WeaponService] Erro ao buscar armas do elemento ${element}:`, error);
      throw error;
    }
  },

  /**
   * Busca armas por classe
   */
  async getWeaponsByClass(weaponClass: string): Promise<Weapon[]> {
    try {
      const response = await apiClient.get<Weapon[]>(`${BASE_URL}/class/${weaponClass}`);
      return response.data;
    } catch (error) {
      console.error(`❌ [WeaponService] Erro ao buscar armas da classe ${weaponClass}:`, error);
      throw error;
    }
  },

  /**
   * Busca armas por raridade
   */
  async getWeaponsByRarity(rarity: string): Promise<Weapon[]> {
    try {
      const response = await apiClient.get<Weapon[]>(`${BASE_URL}/rarity/${rarity}`);
      return response.data;
    } catch (error) {
      console.error(`❌ [WeaponService] Erro ao buscar armas de raridade ${rarity}:`, error);
      throw error;
    }
  },

  /**
   * Busca armas por nome
   */
  async searchWeapons(name: string): Promise<Weapon[]> {
    try {
      const response = await apiClient.get<Weapon[]>(`${BASE_URL}/search`, {
        params: { name },
      });
      return response.data;
    } catch (error) {
      console.error(`❌ [WeaponService] Erro ao buscar armas com nome ${name}:`, error);
      throw error;
    }
  },

  /**
   * Criar nova arma (Admin)
   */
  async createWeapon(weapon: Omit<Weapon, 'id' | 'createdAt' | 'updatedAt'>): Promise<Weapon> {
    try {
      const response = await apiClient.post<Weapon>(BASE_URL, weapon);
      console.log('✅ [WeaponService] Arma criada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [WeaponService] Erro ao criar arma:', error);
      throw error;
    }
  },

  /**
   * Atualizar arma (Admin)
   */
  async updateWeapon(id: string, weapon: Partial<Weapon>): Promise<Weapon> {
    try {
      const response = await apiClient.put<Weapon>(`${BASE_URL}/${id}`, weapon);
      console.log('✅ [WeaponService] Arma atualizada:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ [WeaponService] Erro ao atualizar arma ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deletar arma (Admin)
   */
  async deleteWeapon(id: string): Promise<void> {
    try {
      await apiClient.delete(`${BASE_URL}/${id}`);
      console.log(`✅ [WeaponService] Arma ${id} deletada`);
    } catch (error) {
      console.error(`❌ [WeaponService] Erro ao deletar arma ${id}:`, error);
      throw error;
    }
  },
};
