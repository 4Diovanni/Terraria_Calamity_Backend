/**
 * Tipos para Armas
 */



export enum WeaponTypeClass {
  MELEE = 'MELEE',
  RANGED = 'RANGED',
  MAGE = 'MAGE',
  SUMMON = 'SUMMON',
  ROGUE = 'ROGUE',
}

export enum Element {
  NEUTRAL = 'NEUTRAL',
  FIRE = 'FIRE',
  ICE = 'ICE',
  LIGHTNING = 'LIGHTNING',
  EARTH = 'EARTH',
  WATER = 'WATER',
  WIND = 'WIND',
  NATURE = 'NATURE',
  HOLY = 'HOLY',
  BRIMSTONE = 'BRIMSTONE',
  HOLY_FLAMES = 'HOLY_FLAMES',
  SHADOWFLAME = 'SHADOWFLAME',
  ASTRAL = 'ASTRAL',
  PLAGUE = 'PLAGUE',
  GOD_SLAYER = 'GOD_SLAYER',
  SULPHURIC = 'SULPHURIC',
  SHADOW = 'SHADOW',
  BLOOD = 'BLOOD',
  CRYSTAL = 'CRYSTAL',
  ARCANE = 'ARCANE',
  ELEMENTAL = 'ELEMENTAL',
  COSMIC = 'COSMIC',
  TEMPORAL = 'TEMPORAL',
  ABYSSAL = 'ABYSSAL',
  TOXIC = 'TOXIC',
  OMNI = 'OMNI',
  MAGIC = 'MAGIC',
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
  weaponClass: WeaponTypeClass;
  element: Element;
  rarity: RarityLevel;
  baseDamage: number;
  criticalChance: number;
  attacksPerTurn: number;
  range: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeaponFilters {
  weaponClass?: WeaponTypeClass;
  rarity?: RarityLevel;
  minBaseDamage?: number;
  maxBaseDamage?: number;
  search?: string;
}
