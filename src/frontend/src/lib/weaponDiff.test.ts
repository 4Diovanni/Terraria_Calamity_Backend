import { describe, it, expect } from 'vitest';
import { computeWeaponDiff } from './weaponDiff';
import { Weapon, WeaponTypeClass, Element } from '../types/weapon';
import { WeaponSubmission } from '../types/weaponSubmission';

const currentWeapon: Weapon = {
  id: '3',
  name: 'Iron Shortsword',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 9,
  criticalChance: 4,
  attacksPerTurn: 1.6,
  range: 46,
  rarity: 0,
  price: 120,
  quality: 2,
  abilities: 'Melhor que cobre',
  description: 'Arma de ferro para combate básico.',
  imageUrl: 'img.png',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const proposedSubmission: WeaponSubmission = {
  id: '1',
  type: 'UPDATE',
  status: 'PENDING',
  submittedByUsername: 'arcanjo',
  targetWeaponId: '3',
  name: 'Iron Shortsword Reforjada',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 12,
  criticalChance: 4,
  attacksPerTurn: 1.6,
  range: 46,
  rarity: 0,
  price: 120,
  quality: 2,
  abilities: 'Melhor que cobre, agora com fio',
  description: 'Arma de ferro para combate básico.',
  imageUrl: 'img.png',
  rejectionReason: null,
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

describe('computeWeaponDiff', () => {
  it('marks only the fields that actually differ as changed', () => {
    const diff = computeWeaponDiff(currentWeapon, proposedSubmission);

    const byLabel = Object.fromEntries(diff.map((f) => [f.label, f]));

    expect(byLabel['Nome']).toEqual({ label: 'Nome', oldValue: 'Iron Shortsword', newValue: 'Iron Shortsword Reforjada', changed: true });
    expect(byLabel['Dano']).toEqual({ label: 'Dano', oldValue: '9', newValue: '12', changed: true });
    expect(byLabel['Habilidades']).toEqual({ label: 'Habilidades', oldValue: 'Melhor que cobre', newValue: 'Melhor que cobre, agora com fio', changed: true });

    expect(byLabel['Classe'].changed).toBe(false);
    expect(byLabel['Elemento'].changed).toBe(false);
    expect(byLabel['Raridade'].changed).toBe(false);
    expect(byLabel['Qualidade'].changed).toBe(false);
    expect(byLabel['Descrição'].changed).toBe(false);
    expect(byLabel['Imagem'].changed).toBe(false);
  });

  it('treats every field as changed with no oldValue when current is null (CREATE)', () => {
    const diff = computeWeaponDiff(null, proposedSubmission);

    expect(diff).toHaveLength(13);
    diff.forEach((field) => {
      expect(field.changed).toBe(true);
      expect(field.oldValue).toBeNull();
    });
    const byLabel = Object.fromEntries(diff.map((f) => [f.label, f]));
    expect(byLabel['Nome'].newValue).toBe('Iron Shortsword Reforjada');
  });

  it('formats criticalChance with a percent sign and price with "moedas"', () => {
    const diff = computeWeaponDiff(currentWeapon, proposedSubmission);
    const byLabel = Object.fromEntries(diff.map((f) => [f.label, f]));

    expect(byLabel['Crítico']).toEqual({ label: 'Crítico', oldValue: '4%', newValue: '4%', changed: false });
    expect(byLabel['Preço']).toEqual({ label: 'Preço', oldValue: '120 moedas', newValue: '120 moedas', changed: false });
  });
});
