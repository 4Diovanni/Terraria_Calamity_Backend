import { Card, CardBody, Badge } from '../ui';
import { Weapon } from '../../types/weapon';
import { weaponRarityToTier } from '../../lib/weaponRarity';

interface WeaponCardProps {
  weapon: Weapon;
  onSelect: (id: string) => void;
}

export const WeaponCard = ({ weapon, onSelect }: WeaponCardProps) => (
  <button
    type="button"
    onClick={() => onSelect(weapon.id)}
    className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calamity-primary"
  >
    <Card hoverable className="h-full">
      <CardBody className="flex flex-col gap-3 h-full">
        {weapon.imageUrl && (
          <img src={weapon.imageUrl} alt="" className="w-12 h-12 object-contain" />
        )}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold font-display text-calamity-accent-gold">{weapon.name}</h3>
          <span className="text-lg font-bold text-calamity-accent-gold whitespace-nowrap">
            {weapon.baseDamage} DANO
          </span>
        </div>
        <p className="text-calamity-text-secondary text-sm line-clamp-2">{weapon.description}</p>
        <div className="flex gap-2 flex-wrap mt-auto">
          <Badge variant="rarity" value={weaponRarityToTier(weapon.rarity)} />
          <Badge variant="element" value={weapon.element} />
          <Badge variant="class" value={weapon.weaponClass} />
        </div>
      </CardBody>
    </Card>
  </button>
);
