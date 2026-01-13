/**
 * Weapon Types and Interfaces
 * É para tipar dados relacionados a armas da API
 */

/**
 * Classe de arma
 */
export enum WeaponClass {
  MELEE = 'MELEE',
  RANGED = 'RANGED',
  MAGE = 'MAGE',
  SUMMON = 'SUMMON',
  ROGUE = 'ROGUE',
}

/**
 * Elemento da arma
 */
export enum Element {
  FIRE = 'FIRE',
  ICE = 'ICE',
  LIGHTNING = 'LIGHTNING',
  HOLY = 'HOLY',
  NEUTRAL = 'NEUTRAL',
}

/**
 * Interface para uma arma individual
 */
export interface Weapon {
  id: number;
  name: string;
  weaponClass: WeaponClass;
  element: Element;
  baseDamage: number;
  criticalChance: number;
  attacksPerTurn: number;
  range: number;
  rarity: number;
  price: number;
  quality: number;
  abilities?: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para criar/atualizar arma
 */
export interface CreateWeaponRequest {
  name: string;
  weaponClass: WeaponClass | string;
  element: Element | string;
  baseDamage: number;
  criticalChance: number;
  attacksPerTurn: number;
  range: number;
  rarity: number;
  price: number;
  quality: number;
  abilities?: string;
  description?: string;
  imageUrl?: string;
}

/**
 * Filtros para buscar armas
 */
export interface WeaponFilters {
  element?: Element | string;
  weaponClass?: WeaponClass | string;
  rarity?: number;
  name?: string;
  minDamage?: number;
  maxDamage?: number;
}

/**
 * Resposta da listagem com paginação (futura)
 */
export interface WeaponListResponse {
  content: Weapon[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * Mapeamento de nomes legíveis para enums
 */
export const WEAPON_CLASS_NAMES: Record<WeaponClass, string> = {
  [WeaponClass.MELEE]: 'Melee',
  [WeaponClass.RANGED]: 'À Distância',
  [WeaponClass.MAGE]: 'Magia',
  [WeaponClass.SUMMON]: 'Invocação',
  [WeaponClass.ROGUE]: 'Rogue',
};

export const ELEMENT_NAMES: Record<Element, string> = {
  [Element.FIRE]: 'Fogo',
  [Element.ICE]: 'Gelo',
  [Element.LIGHTNING]: 'Relâmpago',
  [Element.HOLY]: 'Sagrado',
  [Element.NEUTRAL]: 'Neutro',
};

/**
 * Cores para elementos (para UI)
 */
export const ELEMENT_COLORS: Record<Element, string> = {
  [Element.FIRE]: 'bg-calamity-primary',
  [Element.ICE]: 'bg-calamity-accent-cyan',
  [Element.LIGHTNING]: 'bg-yellow-500',
  [Element.HOLY]: 'bg-calamity-accent-gold',
  [Element.NEUTRAL]: 'bg-calamity-border',
};

export const ELEMENT_COLORS_TEXT: Record<Element, string> = {
  [Element.FIRE]: 'text-calamity-primary',
  [Element.ICE]: 'text-calamity-accent-cyan',
  [Element.LIGHTNING]: 'text-yellow-400',
  [Element.HOLY]: 'text-calamity-accent-gold',
  [Element.NEUTRAL]: 'text-calamity-text-secondary',
};
