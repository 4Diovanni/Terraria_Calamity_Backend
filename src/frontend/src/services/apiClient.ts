/**
 * Axios API Client Configuration
 * Configuração centralizada do axios com interceptors
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Criar instância do axios com configuração padrão
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
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
    // Tratamento de erros
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: error.message || 'Erro desconhecido',
      error: error.response?.statusText || 'Unknown Error',
      timestamp: new Date().toISOString(),
    };

    // Log de erro em debug mode
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.error('[API] Error:', apiError);
    }

    // Tratar erros específicos
    if (error.response?.status === 401) {
      // Não autorizado - limpar token
      localStorage.removeItem('jwt_token');
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
  apiClient.interceptors.request.handlers = [];
  apiClient.interceptors.response.handlers = [];
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
