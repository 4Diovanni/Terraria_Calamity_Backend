import { Card, CardBody } from '../ui';
import { Boss } from '../../types/boss';
import { EnemyChip } from './EnemyChip';

interface BossCardProps {
  boss: Boss;
  onSelect: (id: string) => void;
}

export const BossCard = ({ boss, onSelect }: BossCardProps) => (
  <button
    type="button"
    onClick={() => onSelect(boss.id)}
    className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calamity-primary"
  >
    <Card hoverable className="h-full">
      <CardBody className="flex flex-col gap-3 h-full">
        {/* Acento na cor do boss, sangrando até a borda do card */}
        <div className="h-1.5 -mx-6 -mt-6 mb-2" style={{ backgroundColor: boss.themeColor }} />
        {boss.imageUrl && (
          <img src={boss.imageUrl} alt="" className="w-12 h-12 object-contain" />
        )}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold font-display text-calamity-accent-gold">{boss.name}</h3>
          <span className="text-sm font-bold text-calamity-accent-gold whitespace-nowrap">
            {boss.hp.toLocaleString('pt-BR')} HP
          </span>
        </div>
        <div className="flex gap-2 flex-wrap mt-auto">
          <EnemyChip label={boss.biome} />
          <EnemyChip label={boss.progressionLabel} />
        </div>
      </CardBody>
    </Card>
  </button>
);
