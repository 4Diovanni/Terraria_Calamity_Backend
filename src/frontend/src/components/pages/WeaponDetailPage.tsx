import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { weaponService } from '../../services/weaponService';
import { Weapon } from '../../types/weapon';
import { Loading } from '../ui/Loading';
import { Error as ErrorView } from '../ui/Error';
import { Badge } from '../ui/Badge';

export const WeaponDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeapon = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) throw new Error('ID da arma não fornecido');
        const data = await weaponService.getWeaponById(id);
        setWeapon(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar arma';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchWeapon();
  }, [id]);

  if (loading) {
    return <Loading message="Carregando detalhes da arma..." />;
  }

  if (error || !weapon) {
    return <ErrorView message={error || 'Arma não encontrada'} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/weapons')}
          className="flex items-center gap-2 text-calamity-primary hover:text-calamity-accent-gold transition-colors duration-300 font-display uppercase"
        >
          ← Voltar para Armas
        </button>
      </div>

      <section className="bg-calamity-bg-secondary py-12 border-b-2 border-calamity-primary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {weapon.imageUrl && (
              <img
                src={weapon.imageUrl}
                alt={weapon.name}
                className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 object-contain"
              />
            )}

            <div className="flex-1">
              <h1 className="text-3xl sm:text-5xl font-bold font-display text-calamity-accent-gold mb-4">
                {weapon.name}
              </h1>
              <div className="flex gap-3 flex-wrap">
                <Badge variant="rarity" value={weapon.rarity} />
                <Badge variant="element" value={weapon.element} />
                <Badge variant="class" value={weapon.weaponClass} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-calamity-bg-secondary border-2 border-calamity-border p-8 shadow-mystical space-y-6">
              <h2 className="text-2xl font-bold font-display text-calamity-accent-gold border-b-2 border-calamity-border pb-4">
                Estatísticas
              </h2>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-display text-calamity-text-secondary">Dano</span>
                  <span className="text-2xl font-bold text-calamity-accent-gold">{weapon.baseDamage}</span>
                </div>
                <div className="w-full bg-calamity-bg-tertiary rounded-full h-2 overflow-hidden">
                  <div className="bg-calamity-primary h-full" style={{ width: `${Math.min((weapon.baseDamage / 200) * 100, 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-display text-calamity-text-secondary">Chance de Crítico</span>
                  <span className="text-2xl font-bold text-calamity-accent-purple">{weapon.criticalChance}%</span>
                </div>
                <div className="w-full bg-calamity-bg-tertiary rounded-full h-2 overflow-hidden">
                  <div className="bg-calamity-accent-purple h-full" style={{ width: `${weapon.criticalChance}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-display text-calamity-text-secondary">Velocidade</span>
                  <span className="text-2xl font-bold text-calamity-accent-green">{weapon.attacksPerTurn}</span>
                </div>
                <div className="w-full bg-calamity-bg-tertiary rounded-full h-2 overflow-hidden">
                  <div className="bg-calamity-accent-green h-full" style={{ width: `${Math.min((weapon.attacksPerTurn / 5) * 100, 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-display text-calamity-text-secondary">Knockback</span>
                  <span className="text-2xl font-bold text-calamity-primary">{weapon.range}</span>
                </div>
                <div className="w-full bg-calamity-bg-tertiary rounded-full h-2 overflow-hidden">
                  <div className="bg-calamity-primary h-full" style={{ width: `${Math.min((weapon.range / 10) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-calamity-bg-secondary border-2 border-calamity-border p-8 shadow-mystical mb-8">
              <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-4 border-b-2 border-calamity-border pb-4">
                Descrição
              </h2>
              <p className="text-calamity-text-secondary font-body leading-relaxed text-lg">{weapon.description}</p>
            </div>

            <div className="bg-calamity-bg-secondary border-2 border-calamity-border p-8 shadow-mystical space-y-6">
              <h2 className="text-2xl font-bold font-display text-calamity-accent-gold border-b-2 border-calamity-border pb-4">
                Informações
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-calamity-bg-tertiary p-4 rounded-lg">
                  <p className="text-sm text-calamity-text-tertiary font-display mb-1">Tipo</p>
                  <p className="text-lg font-bold text-calamity-primary">{weapon.weaponClass}</p>
                </div>
                <div className="bg-calamity-bg-tertiary p-4 rounded-lg">
                  <p className="text-sm text-calamity-text-tertiary font-display mb-1">ID</p>
                  <p className="text-lg font-bold text-calamity-accent-gold font-mono">{weapon.id}</p>
                </div>
                <div className="bg-calamity-bg-tertiary p-4 rounded-lg">
                  <p className="text-sm text-calamity-text-tertiary font-display mb-1">Adicionado em</p>
                  <p className="text-lg font-bold text-calamity-text-secondary">
                    {new Date(weapon.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
