interface EnemyChipProps {
  label: string;
}

/**
 * Chip neutro tokenizado para Bioma / Tipo do inimigo.
 * Diferente do Badge (que carrega cor semântica de gameplay), este é chrome neutro.
 */
export const EnemyChip = ({ label }: EnemyChipProps) => (
  <span className="inline-block px-3 py-1 rounded text-xs font-display uppercase tracking-wider bg-calamity-bg-tertiary border border-calamity-border text-calamity-text-secondary">
    {label}
  </span>
);
