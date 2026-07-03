import { Boss } from '../types/boss';

/**
 * Serviço de Bosses.
 *
 * Serve dados mockados estáticos — o backend ainda não modela bosses.
 * Cada boss carrega sua `themeColor` (hex de lore) usada para tingir a página de detalhe.
 */

const MOCK_BOSSES: Boss[] = [
  {
    id: 'desert-scourge',
    name: 'Flagelo do Deserto',
    imageUrl: '',
    biome: 'Praia Sulfúrica',
    themeColor: '#c9922e',
    progression: 1,
    progressionLabel: 'Pré-Hardmode',
    phases: 1,
    hp: 5000,
    damage: 60,
    defense: 8,
    markdownContent: [
      'Uma serpente colossal que emerge das areias. **Mantenha-se em movimento** para',
      'desviar das investidas e cuidado com as crias que ela invoca.',
      '',
      '- Arena ampla e plana ajuda a manobrar',
      '- Foque no corpo principal, ignore as crias menores',
    ].join('\n'),
    flavorText: 'A fome do deserto, feita de escamas e areia.',
    createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: 'crabulon',
    name: 'Crabulon',
    imageUrl: '',
    biome: 'Floresta de Cogumelos Brilhantes',
    themeColor: '#3b9ec2',
    progression: 2,
    progressionLabel: 'Pré-Hardmode',
    phases: 1,
    hp: 3500,
    damage: 55,
    defense: 14,
    markdownContent: [
      'Um caranguejo fúngico que salta e lança **esporos**. Desvie dos saltos e destrua',
      'os cogumelos que ele planta antes que se acumulem.',
    ].join('\n'),
    flavorText: 'Colosso de quitina e esporos das cavernas luminosas.',
    createdAt: '2024-06-02T00:00:00Z',
  },
  {
    id: 'brimstone-elemental',
    name: 'Elemental de Brimstone',
    imageUrl: '',
    biome: 'Penhasco de Brimstone',
    themeColor: '#c0392b',
    progression: 3,
    progressionLabel: 'Hardmode',
    phases: 2,
    hp: 22000,
    damage: 90,
    defense: 20,
    markdownContent: [
      'A guardiã do Penhasco alterna entre uma fase de **rajadas de fogo** e uma fase',
      'protegida por um anel de chamas.',
      '',
      '- Na fase invulnerável, desvie e espere a abertura',
      '- Movimento vertical constante evita as colunas de Brimstone',
    ].join('\n'),
    flavorText: 'Vestida em fogo de enxofre, guarda o penhasco há eras.',
    createdAt: '2024-06-04T00:00:00Z',
  },
  {
    id: 'providence',
    name: 'Providência',
    imageUrl: '',
    biome: 'Templo Profanado',
    themeColor: '#f0c419',
    progression: 4,
    progressionLabel: 'Pós-Providência',
    phases: 2,
    hp: 340000,
    damage: 130,
    defense: 45,
    markdownContent: [
      'A Deusa Profanada muda de poder conforme a luz do ambiente. **Enfrente de dia**',
      'para reduzir seu dano e cuidado com os cristais orbitais e o laser de guarda.',
    ].join('\n'),
    flavorText: 'A chama sagrada que julga os dignos e incinera o resto.',
    createdAt: '2024-06-08T00:00:00Z',
  },
  {
    id: 'devourer-of-gods',
    name: 'Devorador de Deuses',
    imageUrl: '',
    biome: 'Qualquer lugar',
    themeColor: '#8b5cf6',
    progression: 5,
    progressionLabel: 'Endgame',
    phases: 2,
    hp: 1120000,
    damage: 220,
    defense: 80,
    markdownContent: [
      'A serpente cósmica **teleporta** e cria portais nas bordas da tela na segunda fase.',
      'Exige leitura de padrões e mobilidade máxima.',
      '',
      '- Guarde asas e acessórios de dash de topo',
      '- Aprenda os portais: a saída é sempre oposta à entrada',
    ].join('\n'),
    flavorText: 'Devorou o cosmos e ainda tem fome.',
    createdAt: '2024-06-12T00:00:00Z',
  },
];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const bossService = {
  async getAllBosses(): Promise<Boss[]> {
    return clone(MOCK_BOSSES);
  },

  async getBossById(id: string): Promise<Boss> {
    const boss = MOCK_BOSSES.find((b) => b.id === id);
    if (!boss) {
      throw new Error(`Boss não encontrado: ${id}`);
    }
    return clone(boss);
  },
};
