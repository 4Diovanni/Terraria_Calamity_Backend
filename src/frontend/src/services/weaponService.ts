/**
 * Weapon API Service
 * Métodos para comunicar com endpoints de armas
 */

import apiClient from './apiClient';
import { Weapon, CreateWeaponRequest, WeaponFilters, Element, WeaponClass } from '../types';

const WEAPON_ENDPOINT = '/api/v1/weapons';

/**
 * Interface para opções de requisição
 */
interface RequestOptions {
  signal?: AbortSignal;
}

/**
 * Listar todas as armas
 */
export const getAllWeapons = async (options?: RequestOptions): Promise<Weapon[]> => {
  try {
    const response = await apiClient.get<Weapon[]>(WEAPON_ENDPOINT, {
      signal: options?.signal,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Buscar arma por ID
 */
export const getWeaponById = async (
  id: number,
  options?: RequestOptions
): Promise<Weapon> => {
  try {
    const response = await apiClient.get<Weapon>(`${WEAPON_ENDPOINT}/${id}`, {
      signal: options?.signal,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Filtrar armas por elemento
 */
export const getWeaponsByElement = async (
  element: Element | string,
  options?: RequestOptions
): Promise<Weapon[]> => {
  try {
    const response = await apiClient.get<Weapon[]>(
      `${WEAPON_ENDPOINT}/element/${element}`,
      { signal: options?.signal }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Filtrar armas por classe
 */
export const getWeaponsByClass = async (
  weaponClass: WeaponClass | string,
  options?: RequestOptions
): Promise<Weapon[]> => {
  try {
    const response = await apiClient.get<Weapon[]>(
      `${WEAPON_ENDPOINT}/class/${weaponClass}`,
      { signal: options?.signal }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Filtrar armas por raridade
 */
export const getWeaponsByRarity = async (
  rarity: number,
  options?: RequestOptions
): Promise<Weapon[]> => {
  try {
    const response = await apiClient.get<Weapon[]>(
      `${WEAPON_ENDPOINT}/rarity/${rarity}`,
      { signal: options?.signal }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Buscar armas por nome
 */
export const searchWeaponsByName = async (
  name: string,
  options?: RequestOptions
): Promise<Weapon[]> => {
  try {
    const response = await apiClient.get<Weapon[]>(
      `${WEAPON_ENDPOINT}/search`,
      {
        params: { name },
        signal: options?.signal,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Criar nova arma (Requer autenticação)
 */
export const createWeapon = async (
  weaponData: CreateWeaponRequest,
  options?: RequestOptions
): Promise<Weapon> => {
  try {
    const response = await apiClient.post<Weapon>(
      WEAPON_ENDPOINT,
      weaponData,
      { signal: options?.signal }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Atualizar arma (Requer autenticação)
 */
export const updateWeapon = async (
  id: number,
  weaponData: Partial<CreateWeaponRequest>,
  options?: RequestOptions
): Promise<Weapon> => {
  try {
    const response = await apiClient.put<Weapon>(
      `${WEAPON_ENDPOINT}/${id}`,
      weaponData,
      { signal: options?.signal }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Deletar arma (Requer autenticação)
 */
export const deleteWeapon = async (
  id: number,
  options?: RequestOptions
): Promise<void> => {
  try {
    await apiClient.delete(`${WEAPON_ENDPOINT}/${id}`, {
      signal: options?.signal,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Aplicar múltiplos filtros
 */
export const getFilteredWeapons = async (
  filters: WeaponFilters,
  options?: RequestOptions
): Promise<Weapon[]> => {
  try {
    const params = new URLSearchParams();

    if (filters.element) params.append('element', filters.element);
    if (filters.weaponClass) params.append('weaponClass', filters.weaponClass);
    if (filters.rarity !== undefined) params.append('rarity', filters.rarity.toString());
    if (filters.name) params.append('name', filters.name);
    if (filters.minDamage !== undefined) params.append('minDamage', filters.minDamage.toString());
    if (filters.maxDamage !== undefined) params.append('maxDamage', filters.maxDamage.toString());

    const response = await apiClient.get<Weapon[]>(
      `${WEAPON_ENDPOINT}/filter`,
      {
        params: Object.fromEntries(params),
        signal: options?.signal,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
