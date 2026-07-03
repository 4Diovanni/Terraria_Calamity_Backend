import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { biomeService } from '../../services/biomeService';
import { enemyService } from '../../services/enemyService';
import { Biome } from '../../types/biome';
import { Enemy } from '../../types/enemy';
import { Loading } from '../ui/Loading';
import { Error as ErrorView } from '../ui/Error';
import { MarkdownContent } from '../ui';
import { BiomeFacts } from './BiomeFacts';
import { EnemyCard } from './EnemyCard';

export const BiomeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [biome, setBiome] = useState<Biome | null>(null);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBiome = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) throw new Error('ID do bioma não fornecido');
        const data = await biomeService.getBiomeById(id);
        setBiome(data);
        setEnemies(await enemyService.getEnemiesByBiome(data.name));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar bioma';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBiome();
  }, [id]);

  if (loading) {
    return <Loading message="Carregando detalhes do bioma..." />;
  }

  if (error || !biome) {
    return <ErrorView message={error || 'Bioma não encontrado'} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to="/biomes"
          className="inline-flex items-center gap-2 text-calamity-primary hover:text-calamity-accent-gold transition-colors duration-300 font-display uppercase"
        >
          &larr; Voltar para Biomas
        </Link>

        {/* Banner */}
        <div className="mt-8 h-48 sm:h-56 flex items-center justify-center bg-calamity-bg-tertiary border-2 border-calamity-border rounded-lg overflow-hidden">
          {biome.imageUrl ? (
            <img src={biome.imageUrl} alt={biome.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display uppercase tracking-widest text-calamity-text-tertiary">
              {biome.name}
            </span>
          )}
        </div>

        <h1 className="mt-6 text-3xl sm:text-5xl font-bold font-display text-calamity-accent-gold">
          {biome.name}
        </h1>

        <div className="mt-6">
          <BiomeFacts facts={biome.facts} />
        </div>

        {/* Descrição */}
        <div className="mt-10 pt-8 border-t border-calamity-border">
          <MarkdownContent content={biome.markdownContent} />
        </div>

        {/* Inimigos do bioma */}
        <div className="mt-10 pt-8 border-t border-calamity-border">
          <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-6">
            Inimigos deste Bioma
          </h2>
          {enemies.length === 0 ? (
            <p className="text-calamity-text-secondary font-body italic">
              Nenhum inimigo catalogado neste bioma ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enemies.map((enemy) => (
                <EnemyCard
                  key={enemy.id}
                  enemy={enemy}
                  onSelect={(enemyId) => navigate(`/enemies/${enemyId}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
