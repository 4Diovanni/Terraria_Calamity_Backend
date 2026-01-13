/**
 * useWeapons Hook
 * Hook específico para gerenciar dados de armas
 */

import { useState, useCallback } from 'react';
import {
  getAllWeapons,
  getWeaponById,
  getWeaponsByElement,
  getWeaponsByClass,
  getWeaponsByRarity,
  searchWeaponsByName,
  createWeapon,
  updateWeapon,
  deleteWeapon,
  getFilteredWeapons,
} from '../services';
import { Weapon, CreateWeaponRequest, WeaponFilters, Element, WeaponClass, ApiError, LoadingState } from '../types';
import { useFetch } from './useFetch';

/**
 * Estado do hook useWeapons
 */
interface UseWeaponsState {
  weapons: Weapon[];
  selectedWeapon: Weapon | null;
  loading: boolean;
  error: ApiError | null;
  state: LoadingState;
}

/**
 * Opções para o hook
 */
interface UseWeaponsOptions {
  autoLoad?: boolean; // Carregar armas automaticamente
}

/**
 * Hook para gerenciar armas
 */
export const useWeapons = (options?: UseWeaponsOptions) => {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);

  // Fetch inicial de todas as armas
  const { data, loading, error, state, refetch } = useFetch(
    () => getAllWeapons(),
    { skip: options?.autoLoad === false }
  );

  // Atualizar estado local quando dados chegam
  if (data && JSON.stringify(data) !== JSON.stringify(weapons)) {
    setWeapons(data);
  }

  /**
   * Buscar arma por ID
   */
  const getWeapon = useCallback(async (id: number) => {
    try {
      const weapon = await getWeaponById(id);
      setSelectedWeapon(weapon);
      return weapon;
    } catch (err) {
      console.error('Erro ao buscar arma:', err);
      throw err;
    }
  }, []);

  /**
   * Buscar armas por elemento
   */
  const filterByElement = useCallback(async (element: Element | string) => {
    try {
      const result = await getWeaponsByElement(element);
      setWeapons(result);
      return result;
    } catch (err) {
      console.error('Erro ao filtrar por elemento:', err);
      throw err;
    }
  }, []);

  /**
   * Buscar armas por classe
   */
  const filterByClass = useCallback(async (weaponClass: WeaponClass | string) => {
    try {
      const result = await getWeaponsByClass(weaponClass);
      setWeapons(result);
      return result;
    } catch (err) {
      console.error('Erro ao filtrar por classe:', err);
      throw err;
    }
  }, []);

  /**
   * Buscar armas por raridade
   */
  const filterByRarity = useCallback(async (rarity: number) => {
    try {
      const result = await getWeaponsByRarity(rarity);
      setWeapons(result);
      return result;
    } catch (err) {
      console.error('Erro ao filtrar por raridade:', err);
      throw err;
    }
  }, []);

  /**
   * Buscar armas por nome
   */
  const searchByName = useCallback(async (name: string) => {
    try {
      if (!name.trim()) {
        setWeapons(data || []);
        return data || [];
      }
      const result = await searchWeaponsByName(name);
      setWeapons(result);
      return result;
    } catch (err) {
      console.error('Erro ao buscar por nome:', err);
      throw err;
    }
  }, [data]);

  /**
   * Aplicar múltiplos filtros
   */
  const applyFilters = useCallback(async (filters: WeaponFilters) => {
    try {
      const result = await getFilteredWeapons(filters);
      setWeapons(result);
      return result;
    } catch (err) {
      console.error('Erro ao aplicar filtros:', err);
      throw err;
    }
  }, []);

  /**
   * Criar arma
   */
  const addWeapon = useCallback(async (weaponData: CreateWeaponRequest) => {
    try {
      const newWeapon = await createWeapon(weaponData);
      setWeapons((prev) => [...prev, newWeapon]);
      return newWeapon;
    } catch (err) {
      console.error('Erro ao criar arma:', err);
      throw err;
    }
  }, []);

  /**
   * Atualizar arma
   */
  const editWeapon = useCallback(async (id: number, weaponData: Partial<CreateWeaponRequest>) => {
    try {
      const updatedWeapon = await updateWeapon(id, weaponData);
      setWeapons((prev) =>
        prev.map((w) => (w.id === id ? updatedWeapon : w))
      );
      if (selectedWeapon?.id === id) {
        setSelectedWeapon(updatedWeapon);
      }
      return updatedWeapon;
    } catch (err) {
      console.error('Erro ao atualizar arma:', err);
      throw err;
    }
  }, [selectedWeapon?.id]);

  /**
   * Deletar arma
   */
  const removeWeapon = useCallback(async (id: number) => {
    try {
      await deleteWeapon(id);
      setWeapons((prev) => prev.filter((w) => w.id !== id));
      if (selectedWeapon?.id === id) {
        setSelectedWeapon(null);
      }
    } catch (err) {
      console.error('Erro ao deletar arma:', err);
      throw err;
    }
  }, [selectedWeapon?.id]);

  /**
   * Resetar filtros
   */
  const resetFilters = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    // Estado
    weapons,
    selectedWeapon,
    loading,
    error,
    state,

    // Ações
    getWeapon,
    filterByElement,
    filterByClass,
    filterByRarity,
    searchByName,
    applyFilters,
    addWeapon,
    editWeapon,
    removeWeapon,
    resetFilters,
  };
};
