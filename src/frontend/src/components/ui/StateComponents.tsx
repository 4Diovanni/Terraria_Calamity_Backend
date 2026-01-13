/**
 * State Components
 * Componentes para diferentes estados de carregamento
 */

import React from 'react';

/**
 * Loading Component
 */
interface LoadingProps {
  message?: string;
  fullHeight?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Carregando...',
  fullHeight = true,
}) => (
  <div
    className={`flex flex-col items-center justify-center gap-4 ${
      fullHeight ? 'min-h-screen' : 'py-16'
    }`}
  >
    <div className="animate-slow-spin text-4xl text-calamity-primary">⊗</div>
    <p className="text-calamity-text-secondary font-body text-lg">{message}</p>
  </div>
);

/**
 * Error Component
 */
interface ErrorProps {
  title?: string;
  message?: string;
  fullHeight?: boolean;
  onRetry?: () => void;
}

export const Error: React.FC<ErrorProps> = ({
  title = 'Erro ao carregar',
  message = 'Algo deu errado. Tente novamente.',
  fullHeight = true,
  onRetry,
}) => (
  <div
    className={`flex flex-col items-center justify-center gap-6 ${
      fullHeight ? 'min-h-screen' : 'py-16'
    }`}
  >
    <div className="text-4xl text-calamity-primary">⚠</div>
    <div className="text-center">
      <h3 className="font-display text-2xl text-calamity-primary mb-2">
        {title}
      </h3>
      <p className="text-calamity-text-secondary font-body max-w-md">
        {message}
      </p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 px-6 py-3 bg-calamity-primary hover:bg-calamity-primary-light text-calamity-text-primary border border-calamity-primary shadow-mystical transition-all duration-800 font-display font-semibold rounded-none"
      >
        Tentar Novamente
      </button>
    )}
  </div>
);

/**
 * Success Component
 */
interface SuccessProps {
  title?: string;
  message?: string;
  fullHeight?: boolean;
}

export const Success: React.FC<SuccessProps> = ({
  title = 'Sucesso!',
  message = 'Operação realizada com sucesso.',
  fullHeight = true,
}) => (
  <div
    className={`flex flex-col items-center justify-center gap-6 ${
      fullHeight ? 'min-h-screen' : 'py-16'
    }`}
  >
    <div className="text-4xl text-calamity-accent-gold">✓</div>
    <div className="text-center">
      <h3 className="font-display text-2xl text-calamity-accent-gold mb-2">
        {title}
      </h3>
      <p className="text-calamity-text-secondary font-body max-w-md">
        {message}
      </p>
    </div>
  </div>
);

/**
 * Empty State Component
 */
interface EmptyStateProps {
  title?: string;
  message?: string;
  fullHeight?: boolean;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nenhum resultado encontrado',
  message = 'Tente ajustar seus filtros ou crie um novo item.',
  fullHeight = true,
  icon = '○',
}) => (
  <div
    className={`flex flex-col items-center justify-center gap-6 ${
      fullHeight ? 'min-h-screen' : 'py-16'
    }`}
  >
    <div className="text-4xl text-calamity-text-tertiary">{icon}</div>
    <div className="text-center">
      <h3 className="font-display text-2xl text-calamity-text-primary mb-2">
        {title}
      </h3>
      <p className="text-calamity-text-secondary font-body max-w-md">
        {message}
      </p>
    </div>
  </div>
);

/**
 * Skeleton Loader
 */
interface SkeletonProps {
  count?: number;
  height?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  count = 1,
  height = 'h-12',
  className = '',
}) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`${height} bg-calamity-border rounded-none mb-4 animate-pulse ${className}`}
      />
    ))}
  </>
);
