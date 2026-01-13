import { Link, useLocation } from 'react-router-dom';

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

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-calamity-primary' : 'text-calamity-text-primary';
  };

  return (
    <header className="bg-calamity-bg-secondary border-b-2 border-calamity-primary shadow-mystical sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6">
        {/* Logo */}
        <Link
          to="/"
          className="text-4xl font-bold font-display text-calamity-accent-gold hover:text-calamity-primary transition-colors duration-300 mb-6 inline-block"
        >
          ⚡ Terraria Calamity RPG
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex gap-8 flex-wrap">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`text-lg font-display uppercase tracking-wider hover:text-calamity-primary transition-all duration-300 pb-2 border-b-2 ${
                isActive(tab.path)
              } ${
                location.pathname === tab.path
                  ? 'border-calamity-primary'
                  : 'border-transparent hover:border-calamity-accent-gold'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};
