import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="bg-calamity-bg-secondary border-b border-calamity-border shadow-mystical">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link
            to="/"
            className="text-3xl font-bold font-display text-calamity-accent-gold hover:text-calamity-primary transition-colors duration-300"
          >
            ⚡ Terraria Calamity RPG
          </Link>
          <ul className="flex gap-8 text-calamity-text-primary">
            <li>
              <Link
                to="/"
                className="hover:text-calamity-primary transition-colors duration-300"
              >
                Armas
              </Link>
            </li>
            <li>
              <a
                href="#about"
                className="hover:text-calamity-primary transition-colors duration-300"
              >
                Sobre
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
