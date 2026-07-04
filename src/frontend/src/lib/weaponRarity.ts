import { RarityLevel } from '../types/weapon';

/**
 * Converte a raridade numérica do backend (-1 a 17) no tier visual usado
 * pela UI (Badge, borda de acento). Só usado nas telas de Arma — Armadura
 * tem seu próprio esquema, fora de escopo aqui.
 */
export const weaponRarityToTier = (rarity: number): RarityLevel => {
  if (rarity <= 2) return RarityLevel.COMMON;
  if (rarity <= 6) return RarityLevel.UNCOMMON;
  if (rarity <= 10) return RarityLevel.RARE;
  if (rarity <= 14) return RarityLevel.EPIC;
  return RarityLevel.LEGENDARY;
};
