import { Card, CardBody, Badge } from '../ui';
import { Armor } from '../../types/armor';

interface ArmorCardProps {
  armor: Armor;
  onSelect: (id: string) => void;
}

export const ArmorCard = ({ armor, onSelect }: ArmorCardProps) => (
  <button
    type="button"
    onClick={() => onSelect(armor.id)}
    className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calamity-primary"
  >
    <Card hoverable className="h-full">
      <CardBody className="flex flex-col gap-3 h-full">
        {armor.imageUrl && (
          <img src={armor.imageUrl} alt="" className="w-12 h-12 object-contain" />
        )}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold font-display text-calamity-accent-gold">{armor.name}</h3>
          <span className="text-lg font-bold text-calamity-accent-gold whitespace-nowrap">
            {armor.totalDefense} DEF
          </span>
        </div>
        {armor.flavorText && (
          <p className="text-calamity-text-secondary text-sm line-clamp-2 italic">{armor.flavorText}</p>
        )}
        <div className="flex gap-2 flex-wrap mt-auto">
          <Badge variant="class" value={armor.armorClass} />
          <Badge variant="rarity" value={armor.rarity} />
        </div>
      </CardBody>
    </Card>
  </button>
);
