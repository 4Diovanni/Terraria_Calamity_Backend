import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enemyService } from '../../services/enemyService';
import { Enemy } from '../../types/enemy';
import { Loading } from '../ui/Loading';
import { Error as ErrorView } from '../ui/Error';
import { Drawer } from '../ui/Drawer';
import { EnemyCard } from './EnemyCard';

export const EnemiesPage = () => {
  const navigate = useNavigate();
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBiome, setSelectedBiome] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'hp'>('name');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const loadEnemies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enemyService.getAllEnemies();
      setEnemies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar inimigos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnemies();
  }, []);

  const biomes = Array.from(new Set(enemies.map((e) => e.biome))).sort();
  const activeFilterCount = [selectedBiome, searchTerm].filter(Boolean).length;

  const filteredEnemies = enemies
    .filter((enemy) => {
      if (selectedBiome && enemy.biome !== selectedBiome) return false;
      if (searchTerm && !enemy.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => (sortBy === 'name' ? a.name.localeCompare(b.name) : b.hp - a.hp));

  if (loading) {
    return <Loading message="Carregando inimigos do Calamity..." />;
  }

  if (error) {
    return <ErrorView message={`Erro ao carregar inimigos: ${error}`} onRetry={loadEnemies} />;
  }

  const filterControls = (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-display text-calamity-text-secondary mb-2">
          Buscar por Nome
        </label>
        <input
          type="text"
          placeholder="Digite o nome do inimigo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary placeholder-calamity-text-tertiary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-display text-calamity-text-secondary mb-2">Bioma</label>
        <select
          value={selectedBiome}
          onChange={(e) => setSelectedBiome(e.target.value)}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
        >
          <option value="">Todos os Biomas</option>
          {biomes.map((biome) => (
            <option key={biome} value={biome}>{biome}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-display text-calamity-text-secondary mb-2">Ordenar por</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'hp')}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
        >
          <option value="name">Nome (A-Z)</option>
          <option value="hp">HP (Maior)</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold font-display text-calamity-accent-gold mb-4">
            Inimigos
          </h1>
          <p className="text-xl text-calamity-text-secondary">
            Total:{' '}
            <span className="text-calamity-primary font-bold">{filteredEnemies.length}</span>{' '}
            inimigos encontrados
          </p>
        </div>

        <div className="md:hidden mb-8">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="w-full px-4 py-3 bg-calamity-bg-secondary border-2 border-calamity-border text-calamity-text-primary font-display"
          >
            Filtrar{activeFilterCount > 0 ? ` (${activeFilterCount} ativos)` : ''}
          </button>
        </div>

        <div className="hidden md:block bg-calamity-bg-secondary border-2 border-calamity-border p-8 mb-12 shadow-mystical">
          <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-6">Filtros</h2>
          {filterControls}
        </div>

        <Drawer open={filtersOpen} onOpenChange={setFiltersOpen} title="Filtros" side="bottom">
          <div className="flex flex-col gap-6">
            {filterControls}
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="px-6 py-3 bg-calamity-primary hover:bg-calamity-primary-light text-calamity-text-primary font-display"
            >
              Aplicar Filtros
            </button>
          </div>
        </Drawer>

        {filteredEnemies.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-calamity-text-secondary font-display">Nenhum inimigo encontrado</p>
            <p className="text-calamity-text-tertiary mt-2">Tente ajustar os filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEnemies.map((enemy) => (
              <EnemyCard key={enemy.id} enemy={enemy} onSelect={(id) => navigate(`/enemies/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
