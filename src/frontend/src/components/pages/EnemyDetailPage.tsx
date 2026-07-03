import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { enemyService } from '../../services/enemyService';
import { Enemy, ENEMY_TYPE_LABEL } from '../../types/enemy';
import { Loading } from '../ui/Loading';
import { Error as ErrorView } from '../ui/Error';
import { StatBar, MarkdownContent, DetailFooter } from '../ui';
import { EnemyChip } from './EnemyChip';

export const EnemyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnemy = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) throw new Error('ID do inimigo não fornecido');
        const data = await enemyService.getEnemyById(id);
        setEnemy(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar inimigo';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEnemy();
  }, [id]);

  if (loading) {
    return <Loading message="Carregando detalhes do inimigo..." />;
  }

  if (error || !enemy) {
    return <ErrorView message={error || 'Inimigo não encontrado'} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          to="/enemies"
          className="inline-flex items-center gap-2 text-calamity-primary hover:text-calamity-accent-gold transition-colors duration-300 font-display uppercase"
        >
          &larr; Voltar para Inimigos
        </Link>

        {/* Herói centralizado */}
        <div className="mt-8 flex flex-col items-center text-center">
          {enemy.imageUrl && (
            <div className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center bg-calamity-bg-tertiary border-2 border-calamity-border rounded-lg p-6">
              <img
                src={enemy.imageUrl}
                alt={enemy.name}
                className="max-w-full max-h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          )}
          <h1 className="mt-6 text-3xl sm:text-5xl font-bold font-display text-calamity-accent-gold">
            {enemy.name}
          </h1>
          <div className="mt-4 flex gap-2 flex-wrap justify-center">
            <EnemyChip label={enemy.biome} />
            <EnemyChip label={ENEMY_TYPE_LABEL[enemy.enemyType]} />
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mt-10 pt-8 border-t border-calamity-border grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatBar label="HP" value={enemy.hp} max={1000} colorClass="text-calamity-primary" />
          <StatBar label="Dano" value={enemy.damage} max={100} colorClass="text-calamity-accent-purple" />
          <StatBar label="Defesa" value={enemy.defense} max={50} colorClass="text-calamity-accent-green" />
        </div>

        {/* Descrição */}
        <div className="mt-10 pt-8 border-t border-calamity-border">
          <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-6">Descrição</h2>
          <MarkdownContent content={enemy.markdownContent} />
        </div>

        {/* Rodapé */}
        <div className="mt-10 pt-8 border-t border-calamity-border">
          <DetailFooter
            items={[
              { label: 'Bioma', value: enemy.biome },
              { label: 'Adicionado em', value: new Date(enemy.createdAt).toLocaleDateString('pt-BR') },
            ]}
            quote={enemy.flavorText}
          />
        </div>
      </div>
    </div>
  );
};
