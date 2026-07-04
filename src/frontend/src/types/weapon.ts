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

/**
 * Campos editáveis de uma arma — mesmo shape usado pelo CRUD direto do
 * ADMIN e, na próxima entrega, pela proposta do USER via fila de aprovação.
 */
export interface WeaponFormData {
  name: string;
  weaponClass: WeaponTypeClass;
  element: Element;
  baseDamage: number;
  criticalChance: number;
  attacksPerTurn: number;
  range: number;
  /** Escala numérica do backend, -1 a 17. Para exibição, ver weaponRarityToTier. */
  rarity: number;
  price: number;
  quality: number;
  abilities: string;
  description: string;
  imageUrl: string;
}

export interface Weapon extends WeaponFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
  /** Documento .md completo (lore/história/notas). Backend preenche depois. */
  markdownContent?: string;
  /** Frase de sabor exibida no rodapé. Backend preenche depois. */
  flavorText?: string;
}

export interface WeaponFilters {
  weaponClass?: WeaponTypeClass;
  /** Tier de exibição (ver weaponRarityToTier) — não a raridade numérica crua. */
  rarity?: RarityLevel;
  minBaseDamage?: number;
  maxBaseDamage?: number;
  search?: string;
}
