import { describe, it, expect } from 'vitest';
import { armorService } from './armorService';

describe('armorService', () => {
  it('returns all armors, each with three pieces', async () => {
    const armors = await armorService.getAllArmors();
    expect(armors.length).toBeGreaterThan(0);
    armors.forEach((armor) => {
      expect(armor.pieces).toHaveLength(3);
      const slots = armor.pieces.map((p) => p.slot);
      expect(slots).toEqual(expect.arrayContaining(['HELMET', 'CHEST', 'LEGS']));
    });
  });

  it('finds an armor by id', async () => {
    const armor = await armorService.getArmorById('victide');
    expect(armor.name).toBe('Armadura de Victide');
  });

  it('rejects when the id does not exist', async () => {
    await expect(armorService.getArmorById('inexistente')).rejects.toThrow();
  });
});
