import { Biome } from '../types/biome';

/**
 * Serviço de Biomas.
 *
 * Serve dados mockados estáticos — o backend ainda não modela biomas.
 * Os nomes (`name`) casam exatamente com o campo `biome` dos inimigos, para
 * que a página do bioma consiga listar suas criaturas.
 */

const MOCK_BIOMES: Biome[] = [
  {
    id: 'sulphurous-sea',
    name: 'Praia Sulfúrica',
    summary: 'Litoral ácido e envenenado que substitui parte do oceano ao lado do Deserto.',
    imageUrl: '',
    facts: [
      { label: 'Localização', value: 'Litoral do Deserto' },
      { label: 'Momento do jogo', value: 'Pré-Hardmode' },
      { label: 'Perigo', value: 'Água sulfúrica (envenenamento)' },
    ],
    markdownContent: [
      '## Praia Sulfúrica',
      '',
      'Uma extensão costeira corroída pelo enxofre, onde a água ácida causa **envenenamento**',
      'ao contato. Substitui a porção do oceano adjacente ao Deserto.',
      '',
      '- Novos minérios e materiais de pesca',
      '- Serve de porta de entrada para o **Abismo**',
    ].join('\n'),
    createdAt: '2024-05-01T00:00:00Z',
  },
  {
    id: 'sunken-sea',
    name: 'Mar Afundado',
    summary: 'Caverna aquática cristalina escondida sob o Deserto, sem dano de afogamento.',
    imageUrl: '',
    facts: [
      { label: 'Localização', value: 'Sob o Deserto' },
      { label: 'Momento do jogo', value: 'Pré-Hardmode' },
      { label: 'Peculiaridade', value: 'Sem dano de afogamento' },
    ],
    markdownContent: [
      '## Mar Afundado',
      '',
      'Um bioma subterrâneo de água parada e prismas de luz, repleto de criaturas antigas.',
      'Aqui **não há dano de afogamento**, permitindo explorar livremente.',
    ].join('\n'),
    createdAt: '2024-05-03T00:00:00Z',
  },
  {
    id: 'abyss',
    name: 'Abismo',
    summary: 'Fossa oceânica profunda dividida em camadas de escuridão e pressão crescentes.',
    imageUrl: '',
    facts: [
      { label: 'Localização', value: 'Extremo lateral do oceano' },
      { label: 'Momento do jogo', value: 'Pré-Hardmode → endgame' },
      { label: 'Camadas', value: '4 níveis de profundidade' },
    ],
    markdownContent: [
      '## Abismo',
      '',
      'Uma fenda oceânica que afunda em quatro camadas cada vez mais escuras e mortais.',
      'A luz e o oxigênio tornam-se recursos preciosos conforme se desce.',
    ].join('\n'),
    createdAt: '2024-05-06T00:00:00Z',
  },
  {
    id: 'brimstone-crag',
    name: 'Penhasco de Brimstone',
    summary: 'Rochedo infernal banhado em fogo de enxofre, lar da Bruxa de Brimstone.',
    imageUrl: '',
    facts: [
      { label: 'Localização', value: 'Submundo (lateral)' },
      { label: 'Momento do jogo', value: 'Pós-Providência' },
      { label: 'Perigo', value: 'Chamas de Brimstone' },
    ],
    markdownContent: [
      '## Penhasco de Brimstone',
      '',
      'Um paredão vulcânico coberto por chamas de enxofre eternas. Guarda segredos e',
      'inimigos que só despertam após **Providência**.',
    ].join('\n'),
    createdAt: '2024-05-09T00:00:00Z',
  },
];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const biomeService = {
  async getAllBiomes(): Promise<Biome[]> {
    return clone(MOCK_BIOMES);
  },

  async getBiomeById(id: string): Promise<Biome> {
    const biome = MOCK_BIOMES.find((b) => b.id === id);
    if (!biome) {
      throw new Error(`Bioma não encontrado: ${id}`);
    }
    return clone(biome);
  },
};
