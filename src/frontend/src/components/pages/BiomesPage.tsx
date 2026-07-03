import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { biomeService } from '../../services/biomeService';
import { Biome } from '../../types/biome';
import { Loading } from '../ui/Loading';
import { Error as ErrorView } from '../ui/Error';
import { BiomeCard } from './BiomeCard';

export const BiomesPage = () => {
  const navigate = useNavigate();
  const [biomes, setBiomes] = useState<Biome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadBiomes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await biomeService.getAllBiomes();
      setBiomes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar biomas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBiomes();
  }, []);

  const filteredBiomes = biomes.filter(
    (biome) => !searchTerm || biome.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading message="Carregando biomas do Calamity..." />;
  }

  if (error) {
    return <ErrorView message={`Erro ao carregar biomas: ${error}`} onRetry={loadBiomes} />;
  }

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold font-display text-calamity-accent-gold mb-4">
            Biomas
          </h1>
          <p className="text-xl text-calamity-text-secondary">
            Total:{' '}
            <span className="text-calamity-primary font-bold">{filteredBiomes.length}</span>{' '}
            biomas encontrados
          </p>
        </div>

        <div className="mb-12 max-w-md">
          <label className="block text-sm font-display text-calamity-text-secondary mb-2">
            Buscar por Nome
          </label>
          <input
            type="text"
            placeholder="Digite o nome do bioma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary placeholder-calamity-text-tertiary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2"
          />
        </div>

        {filteredBiomes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-calamity-text-secondary font-display">Nenhum bioma encontrado</p>
            <p className="text-calamity-text-tertiary mt-2">Tente ajustar a busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBiomes.map((biome) => (
              <BiomeCard key={biome.id} biome={biome} onSelect={(id) => navigate(`/biomes/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
