import { type ReactNode } from 'react';

interface EntityHeroProps {
  imageUrl?: string;
  name: string;
  badges?: ReactNode;
  /** Classe de borda de acento (ex.: cor da raridade). Carrega informação, não decora. */
  accentClass?: string;
}

/**
 * Cabeçalho de uma entidade de codex: imagem emoldurada + nome + linha de badges.
 * Reusado por Arma (e, no próximo ciclo, Armadura/Inimigo).
 */
export const EntityHero = ({
  imageUrl,
  name,
  badges,
  accentClass = 'border-calamity-border',
}: EntityHeroProps) => (
  <div className="space-y-4">
    {imageUrl && (
      <div
        className={`flex items-center justify-center bg-calamity-bg-tertiary border-2 ${accentClass} rounded-lg p-6 aspect-square`}
      >
        <img
          src={imageUrl}
          alt={name}
          className="max-w-full max-h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    )}

    <h1 className="text-3xl sm:text-4xl font-bold font-display text-calamity-accent-gold">{name}</h1>

    {badges && <div className="flex gap-2 flex-wrap">{badges}</div>}
  </div>
);
