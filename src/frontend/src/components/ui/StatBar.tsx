interface StatBarProps {
  label: string;
  value: number;
  /** Texto exibido no lugar do número cru (ex.: "10%"). Default: value. */
  displayValue?: string | number;
  /** Valor de referência para normalizar a largura da barra. */
  max: number;
  /** Classe de cor da barra e do valor (token calamity-*). */
  colorClass?: string;
}

/**
 * Uma estatística de codex: label + valor + barra proporcional.
 * A largura da barra é clampada em 100% quando value excede max.
 */
export const StatBar = ({
  label,
  value,
  displayValue,
  max,
  colorClass = 'text-calamity-accent-gold',
}: StatBarProps) => {
  const width = Math.max(0, Math.min((value / max) * 100, 100));
  // Deriva a cor de fundo da barra a partir da classe de texto do valor.
  const barBg = colorClass.replace('text-', 'bg-');

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-display text-calamity-text-secondary">{label}</span>
        <span className={`text-2xl font-bold ${colorClass}`}>{displayValue ?? value}</span>
      </div>
      <div className="w-full bg-calamity-bg-tertiary rounded-full h-2 overflow-hidden">
        <div className={`${barBg} h-full`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
};
