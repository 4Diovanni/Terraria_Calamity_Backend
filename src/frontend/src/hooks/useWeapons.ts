import { useState, useEffect } from 'react';
import { weaponService } from '../services/weaponService';
import { Weapon } from '../types/weapon';

interface UseWeaponsReturn {
  weapons: Weapon[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para gerenciar armas da API
 * Executa requisição uma única vez ao montar o componente
 */
export const useWeapons = (): UseWeaponsReturn => {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeapons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await weaponService.getAllWeapons();
      setWeapons(data);
      console.log('✅ Armas carregadas com sucesso:', data.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar armas';
      setError(errorMessage);
      console.error('❌ Erro ao carregar armas:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ IMPORTANTE: Array vazio = executa UMA VEZ ao montar
  // Sem o array vazio, executa infinitamente!
  useEffect(() => {
    fetchWeapons();
  }, []); // ← Dependências vazias = executa 1x

  return {
    weapons,
    loading,
    error,
    refetch: fetchWeapons, // Permite refetch manual
  };
};
