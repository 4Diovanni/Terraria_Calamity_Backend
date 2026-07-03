import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { armorService } from '../../services/armorService';
import { Armor, ArmorSlot, ARMOR_SLOT_ORDER } from '../../types/armor';
import { RarityLevel } from '../../types/weapon';
import { Loading } from '../ui/Loading';
import { Error as ErrorView } from '../ui/Error';
import { Badge, DetailLayout, EntityHero, StatBar, MarkdownContent, DetailFooter } from '../ui';
import { ArmorPieceCard } from './ArmorPieceCard';

// Borda de acento por raridade — sinal de gameplay (cor semântica), não chrome de tema.
const RARITY_BORDER: Record<RarityLevel, string> = {
  [RarityLevel.COMMON]: 'border-gray-500',
  [RarityLevel.UNCOMMON]: 'border-green-500',
  [RarityLevel.RARE]: 'border-blue-500',
  [RarityLevel.EPIC]: 'border-purple-500',
  [RarityLevel.LEGENDARY]: 'border-yellow-500',
};

const sortPieces = (armor: Armor) =>
  [...armor.pieces].sort(
    (a, b) => ARMOR_SLOT_ORDER.indexOf(a.slot as ArmorSlot) - ARMOR_SLOT_ORDER.indexOf(b.slot as ArmorSlot)
  );

export const ArmorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [armor, setArmor] = useState<Armor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArmor = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) throw new Error('ID da armadura não fornecido');
        const data = await armorService.getArmorById(id);
        setArmor(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar armadura';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchArmor();
  }, [id]);

  if (loading) {
    return <Loading message="Carregando detalhes da armadura..." />;
  }

  if (error || !armor) {
    return <ErrorView message={error || 'Armadura não encontrada'} onRetry={() => window.location.reload()} />;
  }

  const aside = (
    <div className="space-y-8">
      <EntityHero
        imageUrl={armor.imageUrl}
        name={armor.name}
        accentClass={RARITY_BORDER[armor.rarity] ?? 'border-calamity-border'}
        badges={
          <>
            <Badge variant="class" value={armor.armorClass} />
            <Badge variant="rarity" value={armor.rarity} />
          </>
        }
      />

      <div className="bg-calamity-bg-secondary border-2 border-calamity-border p-6 space-y-6">
        <h2 className="text-xl font-bold font-display text-calamity-accent-gold border-b-2 border-calamity-border pb-3">
          Defesa
        </h2>
        <StatBar
          label="Defesa Total"
          value={armor.totalDefense}
          max={100}
          colorClass="text-calamity-primary"
        />
      </div>
    </div>
  );

  const footer = (
    <DetailFooter
      items={[
        { label: 'Classe', value: armor.armorClass },
        { label: 'Adicionado em', value: new Date(armor.createdAt).toLocaleDateString('pt-BR') },
      ]}
      quote={armor.flavorText}
    />
  );

  return (
    <DetailLayout
      backTo="/armor"
      backLabel="Voltar para Armaduras"
      aside={aside}
      asideSide="right"
      footer={footer}
    >
      <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-6 border-b-2 border-calamity-border pb-4">
        Peças do Conjunto
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {sortPieces(armor).map((piece) => (
          <ArmorPieceCard key={piece.slot} piece={piece} />
        ))}
      </div>

      <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-6 border-b-2 border-calamity-border pb-4">
        Descrição
      </h2>
      <MarkdownContent content={armor.markdownContent} />
    </DetailLayout>
  );
};
