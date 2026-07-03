import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bossService } from '../../services/bossService';
import { Boss } from '../../types/boss';
import { Loading } from '../ui/Loading';
import { Error as ErrorView } from '../ui/Error';
import { BossCard } from './BossCard';

export const BossesPage = () => {
  const navigate = useNavigate();
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadBosses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bossService.getAllBosses();
      setBosses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar bosses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBosses();
  }, []);

  const filteredBosses = bosses
    .filter((boss) => !searchTerm || boss.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.progression - b.progression);

  if (loading) {
    return <Loading message="Carregando bosses do Calamity..." />;
  }

  if (error) {
    return <ErrorView message={`Erro ao carregar bosses: ${error}`} onRetry={loadBosses} />;
  }

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold font-display text-calamity-accent-gold mb-4">
            Bosses
          </h1>
          <p className="text-xl text-calamity-text-secondary">
            Total:{' '}
            <span className="text-calamity-primary font-bold">{filteredBosses.length}</span>{' '}
            bosses encontrados
          </p>
        </div>

        <div className="mb-12 max-w-md">
          <label className="block text-sm font-display text-calamity-text-secondary mb-2">
            Buscar por Nome
          </label>
          <input
            type="text"
            placeholder="Digite o nome do boss..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary placeholder-calamity-text-tertiary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2"
          />
        </div>

        {filteredBosses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-calamity-text-secondary font-display">Nenhum boss encontrado</p>
            <p className="text-calamity-text-tertiary mt-2">Tente ajustar a busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBosses.map((boss) => (
              <BossCard key={boss.id} boss={boss} onSelect={(id) => navigate(`/bosses/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
