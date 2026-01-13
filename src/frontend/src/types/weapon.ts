/**
 * Tipos para Armas
 */

export enum ElementType {
  MELEE = 'MELEE',
  RANGED = 'RANGED',
  MAGIC = 'MAGIC',
  SUMMONER = 'SUMMONER',
  ROGUE = 'ROGUE',
}

export enum RarityLevel {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

export interface Weapon {
  id: string;
  name: string;
  description: string;
  element: ElementType;
  rarity: RarityLevel;
  damage: number;
  critChance: number;
  speed: number;
  knockback: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeaponFilters {
  element?: ElementType;
  rarity?: RarityLevel;
  minDamage?: number;
  maxDamage?: number;
  search?: string;
}
