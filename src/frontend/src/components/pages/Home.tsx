import { useWeapons } from '../../hooks/useWeapons';
import { Loading } from '../ui/Loading';
import { Error } from '../ui/Error';
import { Weapon } from '../../types/weapon';

/**
 * Página inicial - Lista de armas
 * ✅ Aqui SIM fazemos a requisição via hook useWeapons
 */
export const Home = () => {
  const { weapons, loading, error, refetch } = useWeapons();

  if (loading) {
    return <Loading message="Carregando armas..." />;
  }

  if (error) {
    return (
      <Error 
        message={`Erro ao carregar armas: ${error}`}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold mb-4 font-display">Armas do Calamity</h1>
        <p className="text-calamity-text-secondary mb-8">
          Total: {weapons.length} armas
        </p>

        {weapons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-calamity-text-secondary">
              Nenhuma arma encontrada
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weapons.map((weapon: Weapon) => (
              <div
                key={weapon.id}
                className="bg-calamity-bg-secondary border border-calamity-border p-6 shadow-mystical hover:shadow-mystical-lg transition-shadow duration-800"
              >
                <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-2">
                  {weapon.name}
                </h2>
                <p className="text-calamity-text-secondary mb-4">
                  {weapon.description}
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-calamity-accent-purple">Raridade: {weapon.rarity}</span>
                  <span className="text-calamity-accent-green">Elemento: {weapon.element}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
