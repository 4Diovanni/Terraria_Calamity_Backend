import { Card, CardBody } from '../ui';
import { Enemy, ENEMY_TYPE_LABEL } from '../../types/enemy';
import { EnemyChip } from './EnemyChip';

interface EnemyCardProps {
  enemy: Enemy;
  onSelect: (id: string) => void;
}

export const EnemyCard = ({ enemy, onSelect }: EnemyCardProps) => (
  <button
    type="button"
    onClick={() => onSelect(enemy.id)}
    className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calamity-primary"
  >
    <Card hoverable className="h-full">
      <CardBody className="flex flex-col gap-3 h-full">
        {enemy.imageUrl && (
          <img src={enemy.imageUrl} alt="" className="w-12 h-12 object-contain" />
        )}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold font-display text-calamity-accent-gold">{enemy.name}</h3>
          <span className="text-lg font-bold text-calamity-accent-gold whitespace-nowrap">
            {enemy.hp} HP
          </span>
        </div>
        <div className="flex gap-2 flex-wrap mt-auto">
          <EnemyChip label={enemy.biome} />
          <EnemyChip label={ENEMY_TYPE_LABEL[enemy.enemyType]} />
        </div>
      </CardBody>
    </Card>
  </button>
);
