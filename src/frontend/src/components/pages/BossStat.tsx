interface BossStatProps {
  label: string;
  value: number;
  /** Cor do boss (hex) aplicada ao número. */
  color: string;
}

/** Bloco de estatística do boss: número grande formatado, tingido na cor do boss. */
export const BossStat = ({ label, value, color }: BossStatProps) => (
  <div className="bg-calamity-bg-secondary border-2 border-calamity-border p-4 text-center">
    <p className="text-xs font-display uppercase tracking-widest text-calamity-text-tertiary mb-2">
      {label}
    </p>
    <p className="text-2xl sm:text-3xl font-bold font-display" style={{ color }}>
      {value.toLocaleString('pt-BR')}
    </p>
  </div>
);
