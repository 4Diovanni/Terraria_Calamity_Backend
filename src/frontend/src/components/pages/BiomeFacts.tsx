import { BiomeFact } from '../../types/biome';

interface BiomeFactsProps {
  facts: BiomeFact[];
}

/** Faixa de fatos do bioma (label/valor), com assinatura dourada. */
export const BiomeFacts = ({ facts }: BiomeFactsProps) => {
  if (facts.length === 0) return null;
  return (
    <dl className="border-l-2 border-calamity-accent-gold pl-6 py-2 flex flex-wrap gap-x-10 gap-y-4">
      {facts.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-xs font-display uppercase tracking-widest text-calamity-text-tertiary mb-1">
            {label}
          </dt>
          <dd className="text-lg font-display text-calamity-text-primary">{value}</dd>
        </div>
      ))}
    </dl>
  );
};
