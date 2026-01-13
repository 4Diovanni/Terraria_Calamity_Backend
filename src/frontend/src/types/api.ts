/**
 * API Response Types and Error Handling
 * Tipos para respostas da API
 */

/**
 * Resposta genérica de sucesso
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * Resposta de erro da API
 */
export interface ApiError {
  status: number;
  message: string;
  error?: string;
  timestamp?: string;
  path?: string;
}

/**
 * Estado de carregamento
 */
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Hook de estado para requisições
 */
export interface UseQueryState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  state: LoadingState;
}

/**
 * Opções para requisições
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retry?: number;
}

/**
 * Resposta de página (futura)
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
