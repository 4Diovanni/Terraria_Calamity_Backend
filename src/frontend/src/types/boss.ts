/**
 * Tipos para Bosses
 */

export interface Boss {
  id: string;
  name: string;
  imageUrl: string;
  biome: string; // onde é invocado / aparece
  themeColor: string; // hex — cor do boss (exceção semântica de lore)
  progression: number; // ordem de progressão (ordena a listagem)
  progressionLabel: string; // ex.: "Pré-Hardmode", "Pós-Providência"
  phases: number;
  hp: number;
  damage: number;
  defense: number;
  /** Estratégia / guia de luta (Markdown). Backend preenche depois. */
  markdownContent?: string;
  /** Frase de sabor exibida no rodapé. Backend preenche depois. */
  flavorText?: string;
  createdAt: string;
}
