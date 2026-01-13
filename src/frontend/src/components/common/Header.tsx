/**
 * Header Component
 * Cabeçalho principal do site
 */

import React from 'react';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Terraria Calamity RPG',
  showLogo = true,
}) => {
  return (
    <header className="bg-calamity-bg-dark border-b border-calamity-border shadow-mystical sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center gap-4">
          {showLogo && (
            <div className="text-3xl text-calamity-primary font-display font-bold animate-slow-spin" style={{ animationDuration: '120s' }}>
              ×
            </div>
          )}
          <div>
            <h1 className="font-display text-2xl font-bold text-calamity-text-primary">
              {title}
            </h1>
            <p className="font-accent text-xs text-calamity-text-secondary tracking-widest uppercase">
              Arsenal Místico
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <a
            href="/"
            className="font-body text-calamity-text-primary hover:text-calamity-primary transition-colors duration-300"
          >
            Início
          </a>
          <a
            href="/weapons"
            className="font-body text-calamity-text-primary hover:text-calamity-primary transition-colors duration-300"
          >
            Armas
          </a>
          <a
            href="/about"
            className="font-body text-calamity-text-primary hover:text-calamity-primary transition-colors duration-300"
          >
            Sobre
          </a>
        </nav>
      </div>
    </header>
  );
};
