/**
 * Main App Component
 * Componente raiz da aplicação
 */

import React from 'react';
import { Layout, Header, Footer } from './components';
import { Loading } from './components/ui';
import { useWeapons } from './hooks';

function App() {
  const { weapons, loading, error, state } = useWeapons({ autoLoad: true });

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="space-y-6">
            <h1 className="font-display text-6xl font-bold text-calamity-primary animate-fade-in">
              Arsenal Místico
            </h1>
            <p className="font-body text-xl text-calamity-text-secondary max-w-2xl mx-auto">
              Descubra um vasto colário de armas do Calamity Mod,
              adaptadas para sua aventura em RPG de mesa.
            </p>
            <div className="pt-4 border-t border-calamity-border mt-8">
              <p className="font-accent text-sm text-calamity-accent-gold tracking-widest uppercase">
                ✩ Bem-vindo ao Arsenal ✩
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 grid grid-cols-3 gap-8 my-20">
          <div className="bg-calamity-bg-secondary border border-calamity-border p-8 text-center shadow-mystical">
            <p className="font-display text-4xl font-bold text-calamity-primary">
              {weapons.length}
            </p>
            <p className="font-body text-calamity-text-secondary mt-2">Armas Catalogadas</p>
          </div>
          <div className="bg-calamity-bg-secondary border border-calamity-border p-8 text-center shadow-mystical">
            <p className="font-display text-4xl font-bold text-calamity-accent-purple">
              5
            </p>
            <p className="font-body text-calamity-text-secondary mt-2">Elementos</p>
          </div>
          <div className="bg-calamity-bg-secondary border border-calamity-border p-8 text-center shadow-mystical">
            <p className="font-display text-4xl font-bold text-calamity-accent-gold">
              5
            </p>
            <p className="font-body text-calamity-text-secondary mt-2">Classes</p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 text-center border-t border-calamity-border">
          <h2 className="font-display text-4xl font-bold text-calamity-text-primary mb-6">
            Comece Sua Jornada
          </h2>
          <p className="font-body text-calamity-text-secondary mb-8 max-w-xl mx-auto">
            Explore nosso arsenal completo e encontre a arma perfeita para sua campanha.
          </p>
          <button className="px-8 py-4 bg-calamity-primary hover:bg-calamity-primary-light text-calamity-text-primary border border-calamity-primary shadow-mystical hover:shadow-mystical-lg transition-all duration-800 font-display font-semibold rounded-none">
            Ver Armas
          </button>
        </section>
      </div>
    </Layout>
  );
}

export default App;
