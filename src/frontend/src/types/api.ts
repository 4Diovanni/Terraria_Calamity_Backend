/**
 * Tipos para respostas de API
 */

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
  isFirst: boolean;
}

export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
  path?: string;
}
