import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { bossService } from '../../services/bossService';
import { Boss } from '../../types/boss';
import { Loading } from '../ui/Loading';
import { Error as ErrorView } from '../ui/Error';
import { MarkdownContent, DetailFooter } from '../ui';
import { EnemyChip } from './EnemyChip';
import { BossStat } from './BossStat';

const phasesLabel = (phases: number) => `${phases} ${phases === 1 ? 'Fase' : 'Fases'}`;

export const BossDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [boss, setBoss] = useState<Boss | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoss = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) throw new Error('ID do boss não fornecido');
        const data = await bossService.getBossById(id);
        setBoss(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar boss';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBoss();
  }, [id]);

  if (loading) {
    return <Loading message="Carregando detalhes do boss..." />;
  }

  if (error || !boss) {
    return <ErrorView message={error || 'Boss não encontrado'} onRetry={() => window.location.reload()} />;
  }

  const theme = boss.themeColor;

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to="/bosses"
          className="inline-flex items-center gap-2 text-calamity-primary hover:text-calamity-accent-gold transition-colors duration-300 font-display uppercase"
        >
          &larr; Voltar para Bosses
        </Link>

        {/* Faixa temática com glow na cor do boss */}
        <div className="mt-8 relative overflow-hidden rounded-lg border-2 border-calamity-border bg-calamity-bg-secondary">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${theme}, transparent 65%)`,
              opacity: 0.35,
            }}
          />
          <div className="relative flex items-center justify-center py-12">
            <div
              className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center bg-calamity-bg-tertiary rounded-lg p-4 border-2"
              style={{ borderColor: theme, boxShadow: `0 0 30px ${theme}` }}
            >
              {boss.imageUrl ? (
                <img
                  src={boss.imageUrl}
                  alt={boss.name}
                  className="max-w-full max-h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <span
                  className="font-display uppercase tracking-widest text-sm text-center px-2"
                  style={{ color: theme }}
                >
                  {boss.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <h1
          className="mt-6 text-4xl sm:text-5xl font-bold font-display text-center"
          style={{ color: theme, textShadow: `0 0 18px ${theme}66` }}
        >
          {boss.name}
        </h1>

        <div className="mt-4 flex gap-2 flex-wrap justify-center">
          <EnemyChip label={boss.biome} />
          <EnemyChip label={phasesLabel(boss.phases)} />
          <EnemyChip label={boss.progressionLabel} />
        </div>

        {/* Stats numéricos temáticos */}
        <div className="mt-10 pt-8 border-t border-calamity-border grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BossStat label="HP" value={boss.hp} color={theme} />
          <BossStat label="Dano" value={boss.damage} color={theme} />
          <BossStat label="Defesa" value={boss.defense} color={theme} />
        </div>

        {/* Estratégia */}
        <div className="mt-10 pt-8 border-t border-calamity-border">
          <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-6">Estratégia</h2>
          <MarkdownContent content={boss.markdownContent} />
        </div>

        {/* Rodapé */}
        <div className="mt-10 pt-8 border-t border-calamity-border">
          <DetailFooter
            items={[
              { label: 'Bioma', value: boss.biome },
              { label: 'Fases', value: boss.phases },
              { label: 'Progressão', value: boss.progressionLabel },
              { label: 'Adicionado em', value: new Date(boss.createdAt).toLocaleDateString('pt-BR') },
            ]}
            quote={boss.flavorText}
          />
        </div>
      </div>
    </div>
  );
};
