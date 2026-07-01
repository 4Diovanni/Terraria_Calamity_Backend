/**
 * Axios API Client Configuration
 * Configuração centralizada do axios com interceptors
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ErrorResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * O backend roda no plano free do Render, que coloca o serviço para "dormir"
 * após inatividade. O primeiro request após esse período (cold start) pode
 * levar bem mais que alguns segundos para responder, então o timeout por
 * tentativa e a retentativa com backoff existem para sobreviver a esse
 * cenário sem expor um erro de timeout ao usuário.
 */
const REQUEST_TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 3000;

export interface RetryInfo {
  attempt: number;
  maxRetries: number;
  delayMs: number;
}

type RetryListener = (info: RetryInfo) => void;
let retryListener: RetryListener | null = null;

/** Registrar/remover um listener chamado antes de cada retentativa (ex: UI "acordando servidor") */
export const onRetry = (listener: RetryListener | null) => {
  retryListener = listener;
};

type RetryableConfig = InternalAxiosRequestConfig & { __retryCount?: number };

const isRetryableError = (error: AxiosError): boolean =>
  error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response;

/**
 * Criar instância do axios com configuração padrão
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de requisição
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Adicionar token JWT se existir
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug mode
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de resposta
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log sucesso em debug mode
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log(`[API] Response: ${response.status}`, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined;

    if (config && isRetryableError(error)) {
      const attempt = (config.__retryCount ?? 0) + 1;
      if (attempt <= MAX_RETRIES) {
        config.__retryCount = attempt;
        const delayMs = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
        retryListener?.({ attempt, maxRetries: MAX_RETRIES, delayMs });
        return new Promise((resolve) => setTimeout(resolve, delayMs)).then(() =>
          apiClient(config)
        );
      }
    }

    // Tratamento de erros
    const apiError: ErrorResponse = {
      status: error.response?.status || 500,
      message: error.message || 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    };

    // Log de erro em debug mode
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.error('[API] Error:', apiError);
    }

    // Tratar erros específicos
    if (error.response?.status === 401 && !config?.url?.includes('/api/v1/auth/')) {
      // Não autorizado - limpar token (não redirecionar para endpoints de auth, pois
      // eles precisam propagar o erro para a UI exibir a mensagem inline)
      removeAuthToken();
      window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      // Proibido
      apiError.message = 'Você não tem permissão para acessar este recurso';
    }

    if (error.response?.status === 404) {
      // Não encontrado
      apiError.message = 'Recurso não encontrado';
    }

    if (error.response?.status === 500) {
      // Erro do servidor
      apiError.message = 'Erro do servidor. Tente novamente mais tarde';
    }

    return Promise.reject(apiError);
  }
);

/**
 * Limpar interceptors (útil para testes)
 */
export const clearInterceptors = () => {
  apiClient.interceptors.request.clear();
  apiClient.interceptors.response.clear();
};

/**
 * Definir token JWT
 */
export const setAuthToken = (token: string) => {
  localStorage.setItem('jwt_token', token);
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
};

/**
 * Remover token JWT
 */
export const removeAuthToken = () => {
  localStorage.removeItem('jwt_token');
  delete apiClient.defaults.headers.common.Authorization;
};

export default apiClient;
