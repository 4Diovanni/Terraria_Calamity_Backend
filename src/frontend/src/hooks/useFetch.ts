/**
 * Generic useFetch Hook
 * Hook genérico para fazer requisições e gerenciar estado
 */

import { useState, useEffect, useCallback } from 'react';
import { ApiError, LoadingState } from '../types';

/**
 * Interface para estado de requisição
 */
interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  state: LoadingState;
}

/**
 * Opções para o hook
 */
interface UseFetchOptions {
  skip?: boolean; // Pular requisição inicial
  timeout?: number; // Timeout da requisição
  retry?: number; // Número de tentativas em caso de erro
}

/**
 * Hook genérico para fetching de dados
 */
export const useFetch = <T,>(
  fn: (signal?: AbortSignal) => Promise<T>,
  options?: UseFetchOptions
): UseFetchState<T> & { refetch: () => void } => {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: true,
    error: null,
    state: LoadingState.LOADING,
  });

  const [retryCount, setRetryCount] = useState(0);

  const fetch = useCallback(async () => {
    setState({
      data: null,
      loading: true,
      error: null,
      state: LoadingState.LOADING,
    });

    const abortController = new AbortController();

    try {
      const data = await fn(abortController.signal);
      setState({
        data,
        loading: false,
        error: null,
        state: LoadingState.SUCCESS,
      });
      setRetryCount(0);
    } catch (error) {
      const apiError = error as ApiError;

      // Tentar novamente se não atingiu o limite
      if (retryCount < (options?.retry ?? 0)) {
        setRetryCount((prev) => prev + 1);
        setTimeout(() => {
          fetch();
        }, 1000); // Aguardar 1s antes de tentar novamente
      } else {
        setState({
          data: null,
          loading: false,
          error: apiError,
          state: LoadingState.ERROR,
        });
      }
    }

    return () => abortController.abort();
  }, [fn, options?.retry, retryCount]);

  useEffect(() => {
    if (options?.skip) return;
    fetch();
  }, [fetch, options?.skip]);

  const refetch = useCallback(() => {
    setRetryCount(0);
    fetch();
  }, [fetch]);

  return {
    ...state,
    refetch,
  };
};
