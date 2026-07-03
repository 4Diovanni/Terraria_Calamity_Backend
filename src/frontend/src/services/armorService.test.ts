import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient from './apiClient';
import { armorService } from './armorService';
import { ArmorClass } from '../types/armor';
import { RarityLevel } from '../types/weapon';

const BASE_URL = '/api/v1/armor';

describe('armorService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('returns all armors, each with three pieces', async () => {
    mock.onGet(BASE_URL).reply(200, [
      {
        id: 1,
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
        createdAt: '2024-02-10T00:00:00Z',
      },
    ]);

    const armors = await armorService.getAllArmors();
    expect(armors.length).toBeGreaterThan(0);
    armors.forEach((armor) => {
      expect(armor.pieces).toHaveLength(3);
      const slots = armor.pieces.map((p) => p.slot);
      expect(slots).toEqual(expect.arrayContaining(['HELMET', 'CHEST', 'LEGS']));
    });
  });

  it('finds an armor by id', async () => {
    // O backend real usa @PathVariable Long id (ver ArmorController.getArmorById) — o id que
    // chega aqui vem sempre da própria API (armor.id da listagem ou da URL /armor/:id), nunca de
    // um slug digitado à mão, então o teste usa um id numérico como string, não mais 'victide'.
    mock.onGet(`${BASE_URL}/1`).reply(200, {
      id: 1,
      name: 'Armadura de Victide',
      armorClass: ArmorClass.UNIVERSAL,
      rarity: RarityLevel.COMMON,
      totalDefense: 12,
      imageUrl: '',
      pieces: [],
      createdAt: '2024-02-10T00:00:00Z',
    });

    const armor = await armorService.getArmorById('1');
    expect(armor.name).toBe('Armadura de Victide');
  });

  it('rejects when the id does not exist', async () => {
    mock.onGet(`${BASE_URL}/999`).reply(404);

    await expect(armorService.getArmorById('999')).rejects.toThrow();
  });
});
