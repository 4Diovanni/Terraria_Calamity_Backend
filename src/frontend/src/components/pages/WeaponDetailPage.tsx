import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { weaponService } from '../../services/weaponService';
import { Weapon, RarityLevel } from '../../types/weapon';
import { weaponRarityToTier } from '../../lib/weaponRarity';
import { Loading } from '../ui/Loading';
import { Error as ErrorView } from '../ui/Error';
import {
  Badge,
  DetailLayout,
  EntityHero,
  StatBar,
  MarkdownContent,
  DetailFooter,
} from '../ui';

// Borda de acento por raridade — sinal de gameplay (cor semântica), não chrome de tema.
const RARITY_BORDER: Record<RarityLevel, string> = {
  [RarityLevel.COMMON]: 'border-gray-500',
  [RarityLevel.UNCOMMON]: 'border-green-500',
  [RarityLevel.RARE]: 'border-blue-500',
  [RarityLevel.EPIC]: 'border-purple-500',
  [RarityLevel.LEGENDARY]: 'border-yellow-500',
};

export const WeaponDetailPage = () => {
  const { id } = useParams<{ id: string }>();
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

  const aside = (
    <div className="space-y-8">
      <EntityHero
        imageUrl={weapon.imageUrl}
        name={weapon.name}
        accentClass={RARITY_BORDER[weaponRarityToTier(weapon.rarity)] ?? 'border-calamity-border'}
        badges={
          <>
            <Badge variant="element" value={weapon.element} />
            <Badge variant="rarity" value={weaponRarityToTier(weapon.rarity)} />
            <Badge variant="class" value={weapon.weaponClass} />
          </>
        }
      />

      <div className="bg-calamity-bg-secondary border-2 border-calamity-border p-6 space-y-6">
        <h2 className="text-xl font-bold font-display text-calamity-accent-gold border-b-2 border-calamity-border pb-3">
          Estatísticas
        </h2>
        <StatBar label="Dano" value={weapon.baseDamage} max={200} colorClass="text-calamity-primary" />
        <StatBar
          label="Chance de Crítico"
          value={weapon.criticalChance}
          displayValue={`${weapon.criticalChance}%`}
          max={100}
          colorClass="text-calamity-accent-purple"
        />
        <StatBar
          label="Velocidade"
          value={weapon.attacksPerTurn}
          max={5}
          colorClass="text-calamity-accent-green"
        />
        <StatBar label="Knockback" value={weapon.range} max={10} colorClass="text-calamity-primary" />
        <StatBar
          label="Qualidade"
          value={weapon.quality}
          max={10}
          colorClass="text-calamity-accent-blue"
        />
      </div>
    </div>
  );

  const footer = (
    <DetailFooter
      items={[
        { label: 'Classe', value: weapon.weaponClass },
        { label: 'Preço', value: `${weapon.price} moedas` },
        { label: 'Adicionado em', value: new Date(weapon.createdAt).toLocaleDateString('pt-BR') },
      ]}
      quote={weapon.flavorText}
    />
  );

  return (
    <DetailLayout backTo="/weapons" backLabel="Voltar para Armas" aside={aside} footer={footer}>
      <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-6 border-b-2 border-calamity-border pb-4">
        Descrição
      </h2>
      <MarkdownContent content={weapon.markdownContent ?? weapon.description} />

      {weapon.abilities && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-4 border-b-2 border-calamity-border pb-4">
            Habilidades
          </h2>
          <p className="text-calamity-text-secondary font-body">{weapon.abilities}</p>
        </div>
      )}
    </DetailLayout>
  );
};
