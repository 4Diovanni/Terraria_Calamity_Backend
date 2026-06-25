type BadgeVariant = 'class' | 'element' | 'rarity';

// Deliberately uses fixed Tailwind palette colors rather than calamity-* theme
// tokens: these are semantic gameplay cues (rarity/element/class), not theme
// chrome, and must stay visually distinct from each other in both themes.
const VARIANT_COLORS: Record<BadgeVariant, Record<string, string>> = {
  class: {
    MELEE: 'bg-red-600/20 text-red-400',
    RANGED: 'bg-cyan-600/20 text-cyan-400',
    MAGE: 'bg-blue-600/20 text-blue-400',
    SUMMON: 'bg-yellow-600/20 text-yellow-400',
    ROGUE: 'bg-green-600/20 text-green-400',
  },
  rarity: {
    COMMON: 'bg-gray-400/20 text-gray-400',
    UNCOMMON: 'bg-green-400/20 text-green-400',
    RARE: 'bg-blue-400/20 text-blue-400',
    EPIC: 'bg-purple-400/20 text-purple-400',
    LEGENDARY: 'bg-yellow-400/20 text-yellow-400',
  },
  element: {
    NEUTRAL: 'bg-gray-600/20 text-gray-400',
    FIRE: 'bg-red-600/20 text-red-400',
    ICE: 'bg-blue-400/20 text-blue-400',
    LIGHTNING: 'bg-yellow-500/20 text-yellow-400',
    EARTH: 'bg-amber-700/20 text-amber-400',
    WATER: 'bg-blue-600/20 text-blue-400',
    WIND: 'bg-sky-400/20 text-sky-400',
    NATURE: 'bg-green-600/20 text-green-400',
    HOLY: 'bg-yellow-400/20 text-yellow-400',
    BRIMSTONE: 'bg-red-700/20 text-red-400',
    HOLY_FLAMES: 'bg-yellow-400/20 text-yellow-400',
    SHADOWFLAME: 'bg-slate-700/20 text-slate-400',
    ASTRAL: 'bg-purple-600/20 text-purple-400',
    PLAGUE: 'bg-lime-500/20 text-lime-400',
    GOD_SLAYER: 'bg-red-800/20 text-red-400',
    SULPHURIC: 'bg-green-400/20 text-green-400',
    SHADOW: 'bg-gray-800/20 text-gray-400',
    BLOOD: 'bg-red-900/20 text-red-400',
    CRYSTAL: 'bg-cyan-500/20 text-cyan-400',
    ARCANE: 'bg-purple-500/20 text-purple-400',
    ELEMENTAL: 'bg-pink-500/20 text-pink-400',
    COSMIC: 'bg-blue-700/20 text-blue-400',
    TEMPORAL: 'bg-sky-500/20 text-sky-400',
    ABYSSAL: 'bg-indigo-900/20 text-indigo-400',
    TOXIC: 'bg-lime-400/20 text-lime-400',
    OMNI: 'bg-pink-600/20 text-pink-400',
    MAGIC: 'bg-purple-600/20 text-purple-400',
  },
};

const FALLBACK_COLOR = 'bg-gray-600/20 text-gray-400';

interface BadgeProps {
  variant: BadgeVariant;
  value: string;
}

export const Badge = ({ variant, value }: BadgeProps) => {
  const colorClasses = VARIANT_COLORS[variant][value] ?? FALLBACK_COLOR;
  return (
    <span className={`inline-block px-3 py-1 rounded text-xs font-display uppercase ${colorClasses}`}>
      {value}
    </span>
  );
};
