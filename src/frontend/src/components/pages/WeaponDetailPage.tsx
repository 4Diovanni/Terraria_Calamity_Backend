import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { weaponService } from '../../services/weaponService';
import { Weapon } from '../../types/weapon';
import { Loading } from '../ui/Loading';
import { Error } from '../ui/Error';

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

  const getWeaponClassColor = (weaponClass: string) => {
    switch (weaponClass) {
      case 'MELEE':
        return { bg: 'bg-red-600', light: 'bg-red-600/20', text: 'text-red-400' };
      case 'RANGED':
        return { bg: 'bg-cyan-600', light: 'bg-cyan-600/20', text: 'text-cyan-400' };
      case 'MAGE':
        return { bg: 'bg-blue-600', light: 'bg-blue-600/20', text: 'text-blue-400' };
      case 'SUMMON':
        return { bg: 'bg-yellow-600', light: 'bg-yellow-600/20', text: 'text-yellow-400' };
      case 'ROGUE':
        return { bg: 'bg-green-600', light: 'bg-green-600/20', text: 'text-green-400' };
      default:
        return { bg: 'bg-gray-600', light: 'bg-gray-600/20', text: 'text-gray-400' };
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY':
        return { light: 'bg-yellow-400/20', text: 'text-yellow-400', dark: 'from-yellow-600 to-yellow-700' };
      case 'EPIC':
        return { light: 'bg-purple-400/20', text: 'text-purple-400', dark: 'from-purple-600 to-purple-700' };
      case 'RARE':
        return { light: 'bg-blue-400/20', text: 'text-blue-400', dark: 'from-blue-600 to-blue-700' };
      case 'UNCOMMON':
        return { light: 'bg-green-400/20', text: 'text-green-400', dark: 'from-green-600 to-green-700' };
      default:
        return { light: 'bg-gray-400/20', text: 'text-gray-400', dark: 'from-gray-600 to-gray-700' };
    }
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'NEUTRAL':
        return { bg: 'bg-gray-600', light: 'bg-gray-600/20', text: 'text-gray-400' };
      case 'FIRE':
        return { bg: 'bg-red-600', light: 'bg-red-600/20', text: 'text-red-400' };
      case 'ICE':
        return { bg: 'bg-blue-400', light: 'bg-blue-400/20', text: 'text-blue-400' };
      case 'LIGHTNING':
        return { bg: 'bg-yellow-500', light: 'bg-yellow-500/20', text: 'text-yellow-400' };
      case 'EARTH':
        return { bg: 'bg-amber-700', light: 'bg-amber-700/20', text: 'text-amber-400' };
      case 'WATER':
        return { bg: 'bg-blue-600', light: 'bg-blue-600/20', text: 'text-blue-400' };
      case 'WIND':
        return { bg: 'bg-sky-400', light: 'bg-sky-400/20', text: 'text-sky-400' };
      case 'NATURE':
        return { bg: 'bg-green-600', light: 'bg-green-600/20', text: 'text-green-400' };
      case 'HOLY':
        return { bg: 'bg-yellow-400', light: 'bg-yellow-400/20', text: 'text-yellow-400' };
      case 'BRIMSTONE':
        return { bg: 'bg-red-700', light: 'bg-red-700/20', text: 'text-red-400' };
      case 'HOLY_FLAMES':
        return { bg: 'bg-yellow-400', light: 'bg-yellow-400/20', text: 'text-yellow-400' };
      case 'SHADOWFLAME':
        return { bg: 'bg-slate-700', light: 'bg-slate-700/20', text: 'text-slate-400' };
      case 'ASTRAL':
        return { bg: 'bg-purple-600', light: 'bg-purple-600/20', text: 'text-purple-400' };
      case 'PLAGUE':
        return { bg: 'bg-lime-500', light: 'bg-lime-500/20', text: 'text-lime-400' };
      case 'GOD_SLAYER':
        return { bg: 'bg-red-800', light: 'bg-red-800/20', text: 'text-red-400' };
      case 'SULPHURIC':
        return { bg: 'bg-green-400', light: 'bg-green-400/20', text: 'text-green-400' };
      case 'SHADOW':
        return { bg: 'bg-gray-800', light: 'bg-gray-800/20', text: 'text-gray-400' };
      case 'BLOOD':
        return { bg: 'bg-red-900', light: 'bg-red-900/20', text: 'text-red-400' };
      case 'CRYSTAL':
        return { bg: 'bg-cyan-500', light: 'bg-cyan-500/20', text: 'text-cyan-400' };
      case 'ARCANE':
        return { bg: 'bg-purple-500', light: 'bg-purple-500/20', text: 'text-purple-400' };
      case 'ELEMENTAL':
        return { bg: 'bg-pink-500', light: 'bg-pink-500/20', text: 'text-pink-400' };
      case 'COSMIC':
        return { bg: 'bg-blue-700', light: 'bg-blue-700/20', text: 'text-blue-400' };
      case 'TEMPORAL':
        return { bg: 'bg-sky-500', light: 'bg-sky-500/20', text: 'text-sky-400' };
      case 'ABYSSAL':
        return { bg: 'bg-indigo-900', light: 'bg-indigo-900/20', text: 'text-indigo-400' };
      case 'TOXIC':
        return { bg: 'bg-lime-400', light: 'bg-lime-400/20', text: 'text-lime-400' };
      case 'OMNI':
        return { bg: 'bg-pink-600', light: 'bg-pink-600/20', text: 'text-pink-400' };
      case 'MAGIC':
        return { bg: 'bg-purple-600', light: 'bg-purple-600/20', text: 'text-purple-400' };
      default:
        return { bg: 'bg-gray-600', light: 'bg-gray-600/20', text: 'text-gray-400' };
    }
  };

  if (loading) {
    return <Loading message="Carregando detalhes da arma..." />;
  }

  if (error || !weapon) {
    return (
      <Error
        message={error || 'Arma não encontrada'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const weaponClassColor = getWeaponClassColor(weapon.weaponClass);
  const elementColor = getElementColor(weapon.element);
  const rarityColor = getRarityColor(weapon.rarity);

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
      {/* Voltar */}
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/weapons')}
          className="flex items-center gap-2 text-calamity-primary hover:text-calamity-accent-gold transition-colors duration-300 font-display uppercase"
        >
          ← Voltar para Armas
        </button>
      </div>

      {/* Header com Ícone */}
      <section className={`bg-gradient-to-r ${rarityColor.dark} py-12 border-b-2 border-calamity-primary`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">

            {/* Ícone Grande */}
            <div className={`flex-shrink-0 w-32 h-32 rounded-lg ${getWeaponClassColor(weapon.weaponClass).bg} flex items-center justify-center text-6xl font-bold text-white shadow-mystical-lg`}>
              {weapon.imageUrl ? (
                    <img
                      src={weapon.imageUrl}
                      alt={weapon.name}
                      className="w-20 h-20 object-contain"
                    />
                  ) : (
                    weapon.weaponClass.charAt(0)
                  )}
                </div>

            {/* Título e Info */}
            <div className="flex-1">
              <h1 className="text-5xl font-bold font-display text-white mb-4">{weapon.name}</h1>
              <div className="flex gap-4 flex-wrap">
                <div className={`px-4 py-2 rounded-lg ${rarityColor.light}`}>
                  <span className={`font-display uppercase text-sm font-bold ${rarityColor.text}`}>
                    {weapon.rarity}
                  </span>
                </div>
                <div className={`px-4 py-2 rounded-lg ${elementColor.light}`}>
                  <span className={`font-display uppercase text-sm font-bold ${elementColor.text}`}>
                    {weapon.element}
                  </span>
                </div>
                <div className={`px-4 py-2 rounded-lg ${weaponClassColor.light}`}>
                  <span className={`font-display uppercase text-sm font-bold ${weaponClassColor.text}`}>
                    {weapon.weaponClass}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Stats */}
          <div className="md:col-span-1">
            <div className="bg-calamity-bg-secondary border-2 border-calamity-border p-8 shadow-mystical space-y-6">
              <h2 className="text-2xl font-bold font-display text-calamity-accent-gold border-b-2 border-calamity-border pb-4">
                Estátísticas
              </h2>

              {/* Dano */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-display text-calamity-text-secondary">Dano</span>
                  <span className="text-2xl font-bold text-calamity-accent-gold">{weapon.baseDamage}</span>
                </div>
                <div className="w-full bg-calamity-bg-tertiary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-calamity-primary to-calamity-accent-gold h-full"
                    style={{ width: `${Math.min((weapon.baseDamage / 200) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Critério */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-display text-calamity-text-secondary">Chance de Crítico</span>
                  <span className="text-2xl font-bold text-calamity-accent-purple">{weapon.criticalChance}%</span>
                </div>
                <div className="w-full bg-calamity-bg-tertiary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-calamity-accent-purple to-calamity-primary h-full"
                    style={{ width: `${weapon.criticalChance}%` }}
                  />
                </div>
              </div>

              {/* Velocidade */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-display text-calamity-text-secondary">Velocidade</span>
                  <span className="text-2xl font-bold text-calamity-accent-green">{weapon.attacksPerTurn}</span>
                </div>
                <div className="w-full bg-calamity-bg-tertiary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-calamity-accent-green to-calamity-accent-gold h-full"
                    style={{ width: `${Math.min((weapon.attacksPerTurn / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Knockback */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-display text-calamity-text-secondary">Knockback</span>
                  <span className="text-2xl font-bold text-calamity-primary">{weapon.range}</span>
                </div>
                <div className="w-full bg-calamity-bg-tertiary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-calamity-primary to-calamity-accent-purple h-full"
                    style={{ width: `${Math.min((weapon.range / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="md:col-span-2">
            <div className="bg-calamity-bg-secondary border-2 border-calamity-border p-8 shadow-mystical mb-8">
              <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-4 border-b-2 border-calamity-border pb-4">
                Descrição
              </h2>
              <p className="text-calamity-text-secondary font-body leading-relaxed text-lg">
                {weapon.description}
              </p>
            </div>

            {/* Informações Adicionais */}
            <div className="bg-calamity-bg-secondary border-2 border-calamity-border p-8 shadow-mystical space-y-6">
              <h2 className="text-2xl font-bold font-display text-calamity-accent-gold border-b-2 border-calamity-border pb-4">
                Informações
              </h2>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-calamity-bg-tertiary p-4 rounded-lg">
                  <p className="text-sm text-calamity-text-tertiary font-display mb-1">Tipo</p>
                  <p className="text-lg font-bold text-calamity-primary">{weapon.weaponClass}</p>
                </div>
                <div className="bg-calamity-bg-tertiary p-4 rounded-lg">
                  <p className="text-sm text-calamity-text-tertiary font-display mb-1">Raridade</p>
                  <p className={`text-lg font-bold ${rarityColor.text}`}>{weapon.rarity}</p>
                </div>
                <div className="bg-calamity-bg-tertiary p-4 rounded-lg">
                  <p className="text-sm text-calamity-text-tertiary font-display mb-1">Elemento</p>
                  <p className={`text-lg font-bold ${elementColor.text}`}>{weapon.element}</p>
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
