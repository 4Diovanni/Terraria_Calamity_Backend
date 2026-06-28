import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ScrollToTop } from '../ui/ScrollToTop';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-calamity-bg-dark">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};
