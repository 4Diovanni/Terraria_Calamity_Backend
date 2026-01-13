import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

interface UseFetchOptions {
  skip?: boolean;
  dependencies?: unknown[];
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook genérico para fetching de dados
 * @param url - URL para fazer requisição
 * @param options - Opções (skip: pula a requisição, dependencies: quando refetch)
 */
export const useFetch = <T>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchReturn<T> => {
  const { skip = false, dependencies = [] } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!skip);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (skip) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<T>(url);
      setData(response.data);
      console.log(`✅ Dados carregados de ${url}:`, response.data);
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorMessage = axiosError.message || 'Erro ao carregar dados';
      setError(errorMessage);
      console.error(`❌ Erro ao buscar ${url}:`, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ IMPORTANTE: Array de dependências = executa quando dependências mudam
  // Se vazio [] = executa UMA VEZ ao montar
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies); // ← Seu array de dependências aqui

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
