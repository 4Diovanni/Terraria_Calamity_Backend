import { describe, it, expect } from 'vitest';
import { weaponRarityToTier } from './weaponRarity';
import { RarityLevel } from '../types/weapon';

describe('weaponRarityToTier', () => {
  it.each([
    [-1, RarityLevel.COMMON],
    [0, RarityLevel.COMMON],
    [2, RarityLevel.COMMON],
    [3, RarityLevel.UNCOMMON],
    [6, RarityLevel.UNCOMMON],
    [7, RarityLevel.RARE],
    [10, RarityLevel.RARE],
    [11, RarityLevel.EPIC],
    [14, RarityLevel.EPIC],
    [15, RarityLevel.LEGENDARY],
    [17, RarityLevel.LEGENDARY],
  ])('maps rarity %i to tier %s', (rarity, expectedTier) => {
    expect(weaponRarityToTier(rarity)).toBe(expectedTier);
  });
});
