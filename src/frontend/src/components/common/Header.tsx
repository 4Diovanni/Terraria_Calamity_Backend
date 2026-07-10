import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer } from '../ui/Drawer';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';

const tabs = [
  { label: 'Inicio', path: '/' },
  { label: 'Armas', path: '/weapons' },
  { label: 'Armaduras', path: '/armor' },
  { label: 'Inimigos', path: '/enemies' },
  { label: 'Bosses', path: '/bosses' },
  { label: 'NPCs', path: '/npcs' },
  { label: 'Biomas', path: '/biomes' },
  { label: 'Itens', path: '/items' },
];

interface HamburgerIconProps {
  isOpen: boolean;
}

const HamburgerIcon = ({ isOpen }: HamburgerIconProps) => (
  <span className="block w-5 h-[14px] relative" aria-hidden="true">
    <span
      className={[
        'absolute left-0 right-0 h-0.5 bg-current origin-center',
        'transition-all duration-300 ease-in-out',
        isOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0',
      ].join(' ')}
    />
    <span
      className={[
        'absolute left-0 right-0 h-0.5 bg-current top-1/2 -translate-y-1/2',
        'transition-all duration-200 ease-in-out',
        isOpen ? 'opacity-0 scale-x-0' : '',
      ].join(' ')}
    />
    <span
      className={[
        'absolute left-0 right-0 h-0.5 bg-current origin-center',
        'transition-all duration-300 ease-in-out',
        isOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0',
      ].join(' ')}
    />
  </span>
);

export const Header = () => {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const renderLinks = (onNavigate?: () => void) =>
    tabs.map((tab) => (
      <Link
        key={tab.path}
        to={tab.path}
        onClick={onNavigate}
        className={`text-sm font-display uppercase tracking-wider transition-all duration-300 pb-1 border-b-2 ${
          isActive(tab.path)
            ? 'text-calamity-accent-gold border-calamity-accent-gold'
            : 'text-calamity-text-secondary border-transparent hover:text-calamity-text-primary hover:border-calamity-accent-gold'
        }`}
      >
        {tab.label}
      </Link>
    ));

  return (
    <header className="bg-calamity-bg-secondary border-b border-calamity-border sticky top-0 z-50 transition-all duration-300">
      <div
        className={`container mx-auto px-4 flex items-center justify-between gap-4 transition-all duration-300 ${
          compact ? 'py-2' : 'py-4'
        } md:py-4`}
      >
        <Link
          to="/"
          className={`font-bold font-display text-calamity-accent-gold hover:opacity-90 transition-all duration-300 ${
            compact ? 'text-lg' : 'text-xl'
          } md:text-2xl`}
        >
          Terraria Calamity
        </Link>

        <nav className="hidden md:flex gap-8 flex-wrap">{renderLinks()}</nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {!isLoading && (user ? (
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/perfil"
                className="text-sm font-display text-calamity-text-secondary hover:text-calamity-text-primary transition-colors duration-300"
              >
                {user.username}
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:block text-sm font-display uppercase tracking-wider text-calamity-text-secondary hover:text-calamity-primary border border-calamity-border hover:border-calamity-primary px-3 py-1 transition-colors duration-300"
            >
              Entrar
            </Link>
          ))}
          <button
            type="button"
            aria-label="Abrir menu de navegação"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-calamity-text-primary border border-calamity-border hover:border-calamity-primary transition-colors duration-300"
          >
            <HamburgerIcon isOpen={menuOpen} />
          </button>
        </div>
      </div>

      <Drawer open={menuOpen} onOpenChange={setMenuOpen} title="Menu" side="right">
        <nav className="flex flex-col gap-6">
          {renderLinks(() => setMenuOpen(false))}
          <div className="pt-2 border-t border-calamity-border flex flex-col gap-3">
            {!isLoading && (user ? (
              <Link
                to="/perfil"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-display text-calamity-text-secondary hover:text-calamity-text-primary transition-colors duration-300"
              >
                {user.username}
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-display uppercase tracking-wider text-calamity-text-secondary hover:text-calamity-primary transition-colors duration-300"
              >
                Entrar
              </Link>
            ))}
          </div>
        </nav>
      </Drawer>
    </header>
  );
};
