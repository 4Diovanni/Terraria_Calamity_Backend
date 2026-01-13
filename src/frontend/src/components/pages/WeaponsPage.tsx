import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeapons } from '../../hooks/useWeapons';
import { Loading } from '../ui/Loading';
import { Error } from '../ui/Error';
import { Weapon } from '../../types/weapon';

const WEAPON_CLASSES = ['MELEE', 'RANGED', 'MAGIC', 'SUMMONER', 'ROGUE'];
const RARITIES = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];

export const WeaponsPage = () => {
  const navigate = useNavigate();
  const { weapons, loading, error, refetch } = useWeapons();
  
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'damage'>('name');

  // Filtrar armas
  const filteredWeapons = weapons
    .filter(weapon => {
      if (selectedClass && weapon.element !== selectedClass) return false;
      if (selectedRarity && weapon.rarity !== selectedRarity) return false;
      if (searchTerm && !weapon.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b.damage - a.damage;
    });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'EPIC':
        return 'text-purple-400 bg-purple-400/10';
      case 'RARE':
        return 'text-blue-400 bg-blue-400/10';
      case 'UNCOMMON':
        return 'text-green-400 bg-green-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'MELEE':
        return 'bg-red-600';
      case 'RANGED':
        return 'bg-blue-600';
      case 'MAGIC':
        return 'bg-purple-600';
      case 'SUMMONER':
        return 'bg-green-600';
      case 'ROGUE':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (loading) {
    return <Loading message="Carregando armas do Calamity..." />;
  }

  if (error) {
    return <Error message={`Erro ao carregar armas: ${error}`} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold font-display text-calamity-accent-gold mb-4">⚔️ Armas</h1>
          <p className="text-xl text-calamity-text-secondary">
            Total: <span className="text-calamity-primary font-bold">{filteredWeapons.length}</span> armas encontradas
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-calamity-bg-secondary border-2 border-calamity-border p-8 mb-12 shadow-mystical">
          <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-6">Filtros</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Busca */}
            <div>
              <label className="block text-sm font-display text-calamity-text-secondary mb-2">Buscar por Nome</label>
              <input
                type="text"
                placeholder="Digite o nome da arma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary placeholder-calamity-text-tertiary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2"
              />
            </div>

            {/* Classe */}
            <div>
              <label className="block text-sm font-display text-calamity-text-secondary mb-2">Classe</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
              >
                <option value="">Todas as Classes</option>
                {WEAPON_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Raridade */}
            <div>
              <label className="block text-sm font-display text-calamity-text-secondary mb-2">Raridade</label>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
              >
                <option value="">Todas as Raridades</option>
                {RARITIES.map((rarity) => (
                  <option key={rarity} value={rarity}>
                    {rarity}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenar */}
            <div>
              <label className="block text-sm font-display text-calamity-text-secondary mb-2">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'damage')}
                className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
              >
                <option value="name">Nome (A-Z)</option>
                <option value="damage">Dano (Maior)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Armas */}
        {filteredWeapons.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-calamity-text-secondary font-display">Nenhuma arma encontrada</p>
            <p className="text-calamity-text-tertiary mt-2">Tente ajustar os filtros</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWeapons.map((weapon: Weapon) => (
              <button
                key={weapon.id}
                onClick={() => navigate(`/weapons/${weapon.id}`)}
                className="w-full group bg-calamity-bg-secondary border-2 border-calamity-border p-6 shadow-mystical hover:shadow-mystical-lg hover:border-calamity-primary transition-all duration-300 hover:-translate-x-2 flex items-center gap-6 text-left"
              >
                {/* Ícone de Classe */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-lg ${getElementColor(weapon.element)} flex items-center justify-center text-2xl font-bold text-white`}>
                  {weapon.element.charAt(0)}
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold font-display text-calamity-accent-gold group-hover:text-calamity-primary transition-colors duration-300 truncate">
                    {weapon.name}
                  </h3>
                  <p className="text-calamity-text-secondary mt-1 line-clamp-2">{weapon.description}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span className={`px-3 py-1 rounded text-xs font-display uppercase ${getRarityColor(weapon.rarity)}`}>
                      {weapon.rarity}
                    </span>
                    <span className="px-3 py-1 bg-calamity-primary/20 text-calamity-primary text-xs font-display uppercase rounded">
                      {weapon.element}
                    </span>
                  </div>
                </div>

                {/* Dano */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-3xl font-bold text-calamity-accent-gold font-display">{weapon.damage}</div>
                  <p className="text-xs text-calamity-text-tertiary font-display">DANO</p>
                </div>

                {/* Seta */}
                <div className="flex-shrink-0 text-calamity-primary group-hover:translate-x-2 transition-transform duration-300">
                  →
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
