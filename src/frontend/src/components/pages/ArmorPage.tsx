import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { armorService } from '../../services/armorService';
import { Armor, ArmorClass } from '../../types/armor';
import { RarityLevel } from '../../types/weapon';
import { Loading } from '../ui/Loading';
import { Error as ErrorView } from '../ui/Error';
import { Drawer } from '../ui/Drawer';
import { ArmorCard } from './ArmorCard';

const ARMOR_CLASSES = Object.values(ArmorClass);
const RARITIES = Object.values(RarityLevel);

export const ArmorPage = () => {
  const navigate = useNavigate();
  const [armors, setArmors] = useState<Armor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'defense'>('name');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const loadArmors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await armorService.getAllArmors();
      setArmors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar armaduras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArmors();
  }, []);

  const activeFilterCount = [selectedClass, selectedRarity, searchTerm].filter(Boolean).length;

  const filteredArmors = armors
    .filter((armor) => {
      if (selectedClass && armor.armorClass !== selectedClass) return false;
      if (selectedRarity && armor.rarity !== selectedRarity) return false;
      if (searchTerm && !armor.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) =>
      sortBy === 'name' ? a.name.localeCompare(b.name) : b.totalDefense - a.totalDefense
    );

  if (loading) {
    return <Loading message="Carregando armaduras do Calamity..." />;
  }

  if (error) {
    return <ErrorView message={`Erro ao carregar armaduras: ${error}`} onRetry={loadArmors} />;
  }

  const filterControls = (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div>
        <label className="block text-sm font-display text-calamity-text-secondary mb-2">
          Buscar por Nome
        </label>
        <input
          type="text"
          placeholder="Digite o nome da armadura..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary placeholder-calamity-text-tertiary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-display text-calamity-text-secondary mb-2">Classe</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
        >
          <option value="">Todas as Classes</option>
          {ARMOR_CLASSES.map((cls) => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-display text-calamity-text-secondary mb-2">Raridade</label>
        <select
          value={selectedRarity}
          onChange={(e) => setSelectedRarity(e.target.value)}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
        >
          <option value="">Todas as Raridades</option>
          {RARITIES.map((rarity) => (
            <option key={rarity} value={rarity}>{rarity}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-display text-calamity-text-secondary mb-2">Ordenar por</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'defense')}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
        >
          <option value="name">Nome (A-Z)</option>
          <option value="defense">Defesa (Maior)</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold font-display text-calamity-accent-gold mb-4">
            Armaduras
          </h1>
          <p className="text-xl text-calamity-text-secondary">
            Total:{' '}
            <span className="text-calamity-primary font-bold">{filteredArmors.length}</span>{' '}
            armaduras encontradas
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

        {filteredArmors.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-calamity-text-secondary font-display">Nenhuma armadura encontrada</p>
            <p className="text-calamity-text-tertiary mt-2">Tente ajustar os filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArmors.map((armor) => (
              <ArmorCard key={armor.id} armor={armor} onSelect={(id) => navigate(`/armor/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
