import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-calamity-bg-dark">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
