/**
 * Tipos para Armaduras (conjuntos)
 */

import { RarityLevel } from './weapon'; // reusa o enum de raridade existente

export enum ArmorClass {
  MELEE = 'MELEE',
  RANGED = 'RANGED',
  MAGE = 'MAGE',
  SUMMON = 'SUMMON',
  ROGUE = 'ROGUE',
  UNIVERSAL = 'UNIVERSAL',
}

export type ArmorSlot = 'HELMET' | 'CHEST' | 'LEGS';

/** Rótulos PT-BR dos slots, na ordem de exibição. */
export const ARMOR_SLOT_LABEL: Record<ArmorSlot, string> = {
  HELMET: 'Elmo',
  CHEST: 'Peitoral',
  LEGS: 'Calça',
};

export const ARMOR_SLOT_ORDER: ArmorSlot[] = ['HELMET', 'CHEST', 'LEGS'];

export interface ArmorPiece {
  slot: ArmorSlot;
  name: string;
  imageUrl: string;
  defense: number;
}

export interface Armor {
  id: string;
  name: string;
  armorClass: ArmorClass;
  rarity: RarityLevel;
  totalDefense: number;
  pieces: ArmorPiece[];
  imageUrl: string;
  /** Documento .md completo (bônus de set / lore). Backend preenche depois. */
  markdownContent?: string;
  /** Frase de sabor exibida no rodapé. Backend preenche depois. */
  flavorText?: string;
  createdAt: string;
}
