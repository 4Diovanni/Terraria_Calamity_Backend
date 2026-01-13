/**
 * Footer Component
 * Rodapé do site
 */

import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-calamity-bg-dark border-t border-calamity-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-display text-lg text-calamity-primary mb-4">
              Terraria Calamity RPG
            </h3>
            <p className="font-body text-sm text-calamity-text-secondary leading-relaxed">
              Um arsenal místico de armas e items do mod Calamity para Terraria,
              adaptado para RPG de mesa.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-accent text-xs text-calamity-accent-gold mb-4 tracking-widest uppercase">
              Ùteis
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="font-body text-sm text-calamity-text-secondary hover:text-calamity-primary transition-colors duration-300"
                >
                  Início
                </a>
              </li>
              <li>
                <a
                  href="/weapons"
                  className="font-body text-sm text-calamity-text-secondary hover:text-calamity-primary transition-colors duration-300"
                >
                  Armas
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="font-body text-sm text-calamity-text-secondary hover:text-calamity-primary transition-colors duration-300"
                >
                  Sobre
                </a>
              </li>
            </ul>
          </div>

          {/* Credits */}
          <div>
            <h4 className="font-accent text-xs text-calamity-accent-gold mb-4 tracking-widest uppercase">
              Créditos
            </h4>
            <p className="font-body text-sm text-calamity-text-secondary leading-relaxed">
              Desenvolvido por Giovanni Moreira<br />
              Baseado no mod Calamity para Terraria
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-calamity-border py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="font-body text-xs text-calamity-text-tertiary">
              &copy; {currentYear} Terraria Calamity RPG. Todos os direitos reservados.
            </p>
            <p className="font-accent text-xs text-calamity-text-tertiary tracking-widest uppercase mt-4 md:mt-0">
              ✩ Mystical Arsenal ✩
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
