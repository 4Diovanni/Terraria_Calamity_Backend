/**
 * Button Component
 * Componente de botão com suporte a diferentes variações
 */

import React from 'react';

/**
 * Props do componente Button
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Variação visual do botão
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';

  /**
   * Tamanho do botão
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Se o botão está em estado de carregamento
   */
  isLoading?: boolean;

  /**
   * Texto do botão
   */
  children?: React.ReactNode;

  /**
   * Classes CSS customizadas
   */
  className?: string;
}

/**
 * Botão - Componente reutilizável
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Estilos base
  const baseStyles = 'font-display font-semibold transition-all duration-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calamity-primary rounded-none';

  // Estilos por variação
  const variantStyles = {
    primary: 'bg-calamity-primary hover:bg-calamity-primary-light active:bg-calamity-primary-dark text-calamity-text-primary border border-calamity-primary shadow-mystical hover:shadow-mystical-lg',
    secondary: 'bg-calamity-bg-tertiary hover:bg-calamity-border text-calamity-text-primary border border-calamity-border shadow-mystical hover:shadow-mystical-lg',
    outline: 'bg-transparent border-2 border-calamity-border text-calamity-text-primary hover:bg-calamity-bg-tertiary hover:border-calamity-primary',
    ghost: 'bg-transparent text-calamity-text-primary hover:text-calamity-primary border-0',
  };

  // Estilos por tamanho
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // Combinar estilos
  const finalClassName = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <button
      className={finalClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="animate-slow-spin">Ø</span>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};
