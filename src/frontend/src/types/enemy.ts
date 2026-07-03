/**
 * Tipos para Inimigos
 */

export enum EnemyType {
  GROUND = 'GROUND',
  FLYING = 'FLYING',
  AQUATIC = 'AQUATIC',
  BURROWER = 'BURROWER',
  CASTER = 'CASTER',
}

export const ENEMY_TYPE_LABEL: Record<EnemyType, string> = {
  GROUND: 'Terrestre',
  FLYING: 'Voador',
  AQUATIC: 'Aquático',
  BURROWER: 'Escavador',
  CASTER: 'Conjurador',
};

export interface Enemy {
  id: string;
  name: string;
  imageUrl: string;
  biome: string; // rótulo do bioma, ex.: "Praia Sulfúrica" — usado pelo #5 para agrupar
  enemyType: EnemyType;
  hp: number;
  damage: number;
  defense: number;
  /** Documento .md completo (lore / drops / comportamento). Backend preenche depois. */
  markdownContent?: string;
  /** Frase de sabor exibida no rodapé. Backend preenche depois. */
  flavorText?: string;
  createdAt: string;
}
