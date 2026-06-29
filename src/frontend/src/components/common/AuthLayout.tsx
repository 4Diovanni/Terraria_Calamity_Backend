import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-calamity-bg-dark px-4 py-8">
      <div className="w-full max-w-md bg-calamity-bg-secondary border border-calamity-border p-8">
        <Link to="/" className="block mb-8 text-center no-underline">
          <h1 className="text-2xl font-display text-calamity-text-primary tracking-wide">
            Terraria Calamity RPG
          </h1>
        </Link>
        {children}
      </div>
    </div>
  );
}
