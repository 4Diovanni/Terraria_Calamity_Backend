/**
 * Tipos para Biomas
 */

export interface BiomeFact {
  label: string; // ex.: "Localização", "Momento do jogo"
  value: string;
}

export interface Biome {
  id: string;
  name: string; // DEVE casar exatamente com enemy.biome
  summary: string; // blurb curto exibido no card
  imageUrl: string; // banner (paisagem)
  facts: BiomeFact[];
  /** Descrição estilo wiki (Markdown). Backend preenche depois. */
  markdownContent?: string;
  createdAt: string;
}
