import { Armor, ArmorClass } from '../types/armor';
import { RarityLevel } from '../types/weapon';

/**
 * Serviço de Armaduras.
 *
 * Por ora serve dados mockados estáticos — o backend ainda não modela armaduras.
 * A assinatura é assíncrona (Promise) de propósito: quando o endpoint existir,
 * só a implementação interna muda; as páginas não precisam ser tocadas.
 */

const MOCK_ARMORS: Armor[] = [
  {
    id: 'victide',
    name: 'Armadura de Victide',
    armorClass: ArmorClass.UNIVERSAL,
    rarity: RarityLevel.COMMON,
    totalDefense: 12,
    imageUrl: '',
    pieces: [
      { slot: 'HELMET', name: 'Elmo de Victide', imageUrl: '', defense: 3 },
      { slot: 'CHEST', name: 'Peitoral de Victide', imageUrl: '', defense: 5 },
      { slot: 'LEGS', name: 'Perneiras de Victide', imageUrl: '', defense: 4 },
    ],
    markdownContent: [
      '## Bônus de Conjunto',
      '',
      'Quando o conjunto completo é usado, uma **aura curativa** libera partículas que',
      'restauram vida ao redor do jogador ao coletar corações.',
      '',
      '- +8% de dano para todas as classes',
      '- Regeneração de vida aprimorada perto da água',
    ].join('\n'),
    flavorText: 'Forjada com os restos do mar, guarda a maré em cada placa.',
    createdAt: '2024-02-10T00:00:00Z',
  },
  {
    id: 'aerospec',
    name: 'Armadura Aerospec',
    armorClass: ArmorClass.UNIVERSAL,
    rarity: RarityLevel.UNCOMMON,
    totalDefense: 15,
    imageUrl: '',
    pieces: [
      { slot: 'HELMET', name: 'Elmo Aerospec', imageUrl: '', defense: 4 },
      { slot: 'CHEST', name: 'Peitoral Aerospec', imageUrl: '', defense: 6 },
      { slot: 'LEGS', name: 'Perneiras Aerospec', imageUrl: '', defense: 5 },
    ],
    markdownContent: [
      '## Bônus de Conjunto',
      '',
      'Aumenta a **mobilidade aérea** e concede um impulso de velocidade ao voar.',
      '',
      '- +10% de velocidade de movimento',
      '- +15% de dano de projétil ao estar no ar',
    ].join('\n'),
    flavorText: 'Leve como o vento das ilhas flutuantes.',
    createdAt: '2024-02-14T00:00:00Z',
  },
  {
    id: 'daedalus-empyrean',
    name: 'Armadura Daedalus (Empíreo)',
    armorClass: ArmorClass.MELEE,
    rarity: RarityLevel.RARE,
    totalDefense: 30,
    imageUrl: '',
    pieces: [
      { slot: 'HELMET', name: 'Elmo Empíreo de Daedalus', imageUrl: '', defense: 8 },
      { slot: 'CHEST', name: 'Peitoral de Daedalus', imageUrl: '', defense: 12 },
      { slot: 'LEGS', name: 'Perneiras de Daedalus', imageUrl: '', defense: 10 },
    ],
    markdownContent: [
      '## Bônus de Conjunto',
      '',
      'Cristais de neve orbitam o jogador e disparam contra inimigos próximos.',
      '',
      '- +2 defesa adicional',
      '- Invocação de estilhaços de gelo ao atacar',
    ].join('\n'),
    flavorText: 'O engenho do labirinto, cristalizado em gelo eterno.',
    createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'brimflame',
    name: 'Armadura de Brimchama',
    armorClass: ArmorClass.MAGE,
    rarity: RarityLevel.EPIC,
    totalDefense: 22,
    imageUrl: '',
    pieces: [
      { slot: 'HELMET', name: 'Capuz de Brimchama', imageUrl: '', defense: 6 },
      { slot: 'CHEST', name: 'Túnica de Brimchama', imageUrl: '', defense: 9 },
      { slot: 'LEGS', name: 'Calças de Brimchama', imageUrl: '', defense: 7 },
    ],
    markdownContent: [
      '## Bônus de Conjunto',
      '',
      'Ao receber dano, envolve o jogador em uma **explosão de enxofre** que incendeia',
      'inimigos e concede fúria mágica temporária.',
      '',
      '- +12% de dano mágico',
      '- Explosão de Brimstone ao ser atingido (cooldown de 20s)',
    ].join('\n'),
    flavorText: 'Vestir chamas é aceitar que elas também te consomem.',
    createdAt: '2024-03-08T00:00:00Z',
  },
];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const armorService = {
  async getAllArmors(): Promise<Armor[]> {
    return clone(MOCK_ARMORS);
  },

  async getArmorById(id: string): Promise<Armor> {
    const armor = MOCK_ARMORS.find((a) => a.id === id);
    if (!armor) {
      throw new Error(`Armadura não encontrada: ${id}`);
    }
    return clone(armor);
  },
};
