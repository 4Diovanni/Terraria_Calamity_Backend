/**
 * Card Component
 * Componente de card para contéudo genérico
 */

import React from 'react';

/**
 * Props do componente Card
 */
interface CardProps {
  /**
   * Conteúdo do card
   */
  children: React.ReactNode;

  /**
   * Classes CSS customizadas
   */
  className?: string;

  /**
   * Se o card pode ser clicado
   */
  clickable?: boolean;

  /**
   * Função de click (se clickable for true)
   */
  onClick?: () => void;

  /**
   * Se mostrar efeito de hover
   */
  hoverable?: boolean;
}

/**
 * Card - Componente reutilizável
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  clickable = false,
  onClick,
  hoverable = true,
}) => {
  const baseStyles =
    'bg-calamity-bg-secondary border border-calamity-border p-6 shadow-mystical';

  const hoverStyles = hoverable
    ? 'hover:shadow-mystical-lg transition-all duration-800 hover:border-calamity-primary'
    : '';

  const clickableStyles = clickable ? 'cursor-pointer' : '';

  const finalClassName = `${baseStyles} ${hoverStyles} ${clickableStyles} ${className}`;

  return (
    <div className={finalClassName} onClick={onClick}>
      {children}
    </div>
  );
};

/**
 * CardHeader - Cabeçalho do card
 */
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
}) => (
  <div
    className={`pb-4 border-b border-calamity-border mb-4 ${className}`}
  >
    {children}
  </div>
);

/**
 * CardBody - Corpo do card
 */
interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
}) => <div className={`${className}`}>{children}</div>;

/**
 * CardFooter - Rodapé do card
 */
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => (
  <div
    className={`pt-4 border-t border-calamity-border mt-4 ${className}`}
  >
    {children}
  </div>
);
