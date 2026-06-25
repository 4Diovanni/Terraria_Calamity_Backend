import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer } from '../ui/Drawer';
import { ThemeToggle } from '../ui/ThemeToggle';

const tabs = [
  { label: 'Início', path: '/' },
  { label: 'Armas', path: '/weapons' },
  { label: 'Inimigos', path: '/enemies' },
  { label: 'NPCs', path: '/npcs' },
  { label: 'Biomas', path: '/biomes' },
  { label: 'Itens', path: '/items' },
];

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
        className={`text-lg font-display uppercase tracking-wider hover:text-calamity-primary transition-all duration-300 pb-2 border-b-2 ${
          isActive(tab.path)
            ? 'text-calamity-primary border-calamity-primary'
            : 'text-calamity-text-primary border-transparent hover:border-calamity-accent-gold'
        }`}
      >
        {tab.label}
      </Link>
    ));

  return (
    <header className="bg-calamity-bg-secondary border-b-2 border-calamity-primary shadow-mystical sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 md:py-6 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="text-2xl md:text-4xl font-bold font-display text-calamity-accent-gold hover:text-calamity-primary transition-colors duration-300"
        >
          ⚡ Terraria Calamity RPG
        </Link>

        <nav className="hidden md:flex gap-8 flex-wrap">{renderLinks()}</nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Abrir menu de navegação"
            onClick={() => setMenuOpen(true)}
            className="md:hidden w-11 h-11 flex items-center justify-center text-calamity-text-primary border border-calamity-border"
          >
            ☰
          </button>
        </div>
      </div>

      <Drawer open={menuOpen} onOpenChange={setMenuOpen} title="Menu" side="right">
        <nav className="flex flex-col gap-6">{renderLinks(() => setMenuOpen(false))}</nav>
      </Drawer>
    </header>
  );
};
