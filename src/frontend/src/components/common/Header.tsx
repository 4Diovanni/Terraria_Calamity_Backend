import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer } from '../ui/Drawer';
import { ThemeToggle } from '../ui/ThemeToggle';

const tabs = [
  { label: 'Inicio', path: '/' },
  { label: 'Armas', path: '/weapons' },
  { label: 'Inimigos', path: '/enemies' },
  { label: 'NPCs', path: '/npcs' },
  { label: 'Biomas', path: '/biomes' },
  { label: 'Itens', path: '/items' },
];

const HamburgerIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <rect y="3" width="20" height="2" />
    <rect y="9" width="20" height="2" />
    <rect y="15" width="20" height="2" />
  </svg>
);

export const Header = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const renderLinks = (onNavigate?: () => void) =>
    tabs.map((tab) => (
      <Link
        key={tab.path}
        to={tab.path}
        onClick={onNavigate}
        className={`text-sm font-display uppercase tracking-wider hover:text-calamity-primary transition-all duration-300 pb-1 border-b-2 ${
          isActive(tab.path)
            ? 'text-calamity-primary border-calamity-primary'
            : 'text-calamity-text-secondary border-transparent hover:border-calamity-accent-gold hover:text-calamity-text-primary'
        }`}
      >
        {tab.label}
      </Link>
    ));

  return (
    <header className="bg-calamity-bg-secondary border-b border-calamity-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="text-xl md:text-2xl font-bold font-display text-calamity-accent-gold text-glow-gold hover:opacity-90 transition-opacity duration-300"
        >
          Terraria Calamity
        </Link>

        <nav className="hidden md:flex gap-8 flex-wrap">{renderLinks()}</nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Abrir menu de navegação"
            onClick={() => setMenuOpen(true)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-calamity-text-primary border border-calamity-border hover:border-calamity-primary transition-colors duration-300"
          >
            <HamburgerIcon />
          </button>
        </div>
      </div>

      <Drawer open={menuOpen} onOpenChange={setMenuOpen} title="Menu" side="right">
        <nav className="flex flex-col gap-6">{renderLinks(() => setMenuOpen(false))}</nav>
      </Drawer>
    </header>
  );
};
