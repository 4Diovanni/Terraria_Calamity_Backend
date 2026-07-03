import { ArmorPiece, ARMOR_SLOT_LABEL } from '../../types/armor';

interface ArmorPieceCardProps {
  piece: ArmorPiece;
}

/** Card compacto de uma peça do conjunto (Elmo / Peitoral / Calça). */
export const ArmorPieceCard = ({ piece }: ArmorPieceCardProps) => (
  <div className="bg-calamity-bg-secondary border border-calamity-border p-4 flex flex-col items-center text-center gap-2">
    <div className="w-14 h-14 flex items-center justify-center bg-calamity-bg-tertiary border border-calamity-border rounded">
      {piece.imageUrl ? (
        <img
          src={piece.imageUrl}
          alt={piece.name}
          className="max-w-full max-h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        <span className="text-xs font-display text-calamity-text-tertiary uppercase">
          {ARMOR_SLOT_LABEL[piece.slot].charAt(0)}
        </span>
      )}
    </div>
    <span className="text-xs font-display uppercase tracking-widest text-calamity-text-tertiary">
      {ARMOR_SLOT_LABEL[piece.slot]}
    </span>
    <span className="font-display text-calamity-text-primary leading-tight">{piece.name}</span>
    <span className="text-calamity-accent-gold font-bold">{piece.defense} DEF</span>
  </div>
);
