import { Enemy, EnemyType } from '../types/enemy';

/**
 * Serviço de Inimigos.
 *
 * Serve dados mockados estáticos — o backend ainda não modela inimigos.
 * A assinatura é assíncrona de propósito: quando o endpoint existir, só a
 * implementação interna muda; as páginas não precisam ser tocadas.
 */

const MOCK_ENEMIES: Enemy[] = [
  {
    id: 'anthozoan-crab',
    name: 'Caranguejo Antozoário',
    imageUrl: '',
    biome: 'Praia Sulfúrica',
    enemyType: EnemyType.GROUND,
    hp: 45,
    damage: 30,
    defense: 16,
    markdownContent: [
      '## Comportamento',
      '',
      'Anda pela costa da Praia Sulfúrica. Ao se aproximar, **avança rapidamente**',
      'com as garras, mas recua ao levar dano suficiente.',
      '',
      '### Drops',
      '- Escama Sulfúrica',
      '- Casco Antozoário (raro)',
    ].join('\n'),
    flavorText: 'Suas garras guardam o veneno do mar envenenado.',
    createdAt: '2024-04-02T00:00:00Z',
  },
  {
    id: 'toxic-minnow',
    name: 'Peixinho Tóxico',
    imageUrl: '',
    biome: 'Praia Sulfúrica',
    enemyType: EnemyType.AQUATIC,
    hp: 30,
    damage: 24,
    defense: 4,
    markdownContent: [
      '## Comportamento',
      '',
      'Cardumes pequenos que nadam nas águas ácidas e aplicam **envenenamento** ao tocar.',
    ].join('\n'),
    flavorText: 'Pequeno, mas o veneno não perdoa.',
    createdAt: '2024-04-03T00:00:00Z',
  },
  {
    id: 'trasher',
    name: 'Trasher',
    imageUrl: '',
    biome: 'Praia Sulfúrica',
    enemyType: EnemyType.AQUATIC,
    hp: 250,
    damage: 55,
    defense: 10,
    markdownContent: [
      '## Comportamento',
      '',
      'Um tubarão sulfúrico que **mergulha e emerge** para atacar. Persegue o jogador',
      'com velocidade dentro da água.',
    ].join('\n'),
    flavorText: 'A sombra que corta a maré ácida.',
    createdAt: '2024-04-05T00:00:00Z',
  },
  {
    id: 'sea-serpent',
    name: 'Serpente Marinha',
    imageUrl: '',
    biome: 'Mar Afundado',
    enemyType: EnemyType.AQUATIC,
    hp: 180,
    damage: 70,
    defense: 20,
    markdownContent: [
      '## Comportamento',
      '',
      'Serpeia pelas profundezas do Mar Afundado em movimentos ondulatórios,',
      'atravessando o terreno para alcançar o alvo.',
    ].join('\n'),
    flavorText: 'Enrola-se nas correntes esquecidas do fundo.',
    createdAt: '2024-04-08T00:00:00Z',
  },
  {
    id: 'prism-back',
    name: 'Casco-Prisma',
    imageUrl: '',
    biome: 'Mar Afundado',
    enemyType: EnemyType.GROUND,
    hp: 220,
    damage: 60,
    defense: 40,
    markdownContent: [
      '## Comportamento',
      '',
      'Criatura de casco cristalino e **defesa altíssima**. Reflete luz ao ser atingida',
      'e avança lentamente pelo leito do Mar Afundado.',
    ].join('\n'),
    flavorText: 'Seu casco guarda o arco-íris das profundezas.',
    createdAt: '2024-04-10T00:00:00Z',
  },
];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const enemyService = {
  async getAllEnemies(): Promise<Enemy[]> {
    return clone(MOCK_ENEMIES);
  },

  async getEnemyById(id: string): Promise<Enemy> {
    const enemy = MOCK_ENEMIES.find((e) => e.id === id);
    if (!enemy) {
      throw new Error(`Inimigo não encontrado: ${id}`);
    }
    return clone(enemy);
  },

  async getEnemiesByBiome(biome: string): Promise<Enemy[]> {
    return clone(MOCK_ENEMIES.filter((e) => e.biome === biome));
  },
};
