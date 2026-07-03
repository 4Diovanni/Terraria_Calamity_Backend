import { Card, CardBody } from '../ui';
import { Biome } from '../../types/biome';

interface BiomeCardProps {
  biome: Biome;
  onSelect: (id: string) => void;
}

export const BiomeCard = ({ biome, onSelect }: BiomeCardProps) => (
  <button
    type="button"
    onClick={() => onSelect(biome.id)}
    className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calamity-primary"
  >
    <Card hoverable className="h-full">
      <CardBody className="flex flex-col gap-3 h-full">
        <div className="h-28 flex items-center justify-center bg-calamity-bg-tertiary border border-calamity-border rounded overflow-hidden">
          {biome.imageUrl ? (
            <img src={biome.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display uppercase tracking-widest text-calamity-text-tertiary text-sm px-2 text-center">
              {biome.name}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold font-display text-calamity-accent-gold">{biome.name}</h3>
        <p className="text-calamity-text-secondary text-sm line-clamp-2">{biome.summary}</p>
      </CardBody>
    </Card>
  </button>
);
