import { useState, useEffect } from 'react';
import { weaponService } from '../services/weaponService';
import { onRetry, RetryInfo } from '../services/apiClient';
import { Weapon } from '../types/weapon';

interface UseWeaponsReturn {
  weapons: Weapon[];
  loading: boolean;
  error: string | null;
  /** true enquanto o apiClient está retentando após um timeout (ex: cold start do Render) */
  wakingUp: boolean;
  retryAttempt: { attempt: number; maxRetries: number } | null;
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
  const [retryAttempt, setRetryAttempt] = useState<{ attempt: number; maxRetries: number } | null>(
    null
  );

  const fetchWeapons = async () => {
    onRetry(({ attempt, maxRetries }: RetryInfo) => setRetryAttempt({ attempt, maxRetries }));
    try {
      setLoading(true);
      setError(null);
      setRetryAttempt(null);
      const data = await weaponService.getAllWeapons();
      setWeapons(data);
      console.log('✅ Armas carregadas com sucesso:', data.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar armas';
      setError(errorMessage);
      console.error('❌ Erro ao carregar armas:', errorMessage);
    } finally {
      setLoading(false);
      setRetryAttempt(null);
      onRetry(null);
    }
  };

  // ✅ IMPORTANTE: Array vazio = executa UMA VEZ ao montar
  // Sem o array vazio, executa infinitamente!
  useEffect(() => {
    fetchWeapons();
    return () => onRetry(null);
  }, []); // ← Dependências vazias = executa 1x

  return {
    weapons,
    loading,
    error,
    wakingUp: retryAttempt !== null,
    retryAttempt,
    refetch: fetchWeapons, // Permite refetch manual
  };
};
