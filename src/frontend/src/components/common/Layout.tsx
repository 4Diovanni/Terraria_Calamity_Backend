/**
 * Layout Component
 * Layout principal que envolve todas as páginas
 */

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-calamity-bg-dark text-calamity-text-primary">
      {showHeader && <Header />}

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>

      {showFooter && <Footer />}
    </div>
  );
};
