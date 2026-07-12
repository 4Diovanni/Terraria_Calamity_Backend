import { describe, it, expect } from 'vitest';
import { buildPreviewWeapon } from './weaponPreview';
import { Weapon, WeaponFormData, WeaponTypeClass, Element } from '../types/weapon';

const formData: WeaponFormData = {
  name: 'Terra Blade',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 55,
  criticalChance: 10,
  attacksPerTurn: 2,
  range: 3,
  rarity: 16,
  price: 100,
  quality: 8,
  abilities: 'Corta em linha reta',
  description: 'Uma lâmina lendária.',
  imageUrl: '',
};

const base: Weapon = {
  ...formData,
  name: 'Terra Blade Antiga',
  id: '42',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  markdownContent: '# Lore',
  flavorText: 'Uma lâmina lendária forjada nos confins do tempo.',
};

describe('buildPreviewWeapon', () => {
  it('uses the base weapon id, createdAt, markdownContent and flavorText when provided', () => {
    const result = buildPreviewWeapon(formData, base);
    expect(result.id).toBe('42');
    expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
    expect(result.markdownContent).toBe('# Lore');
    expect(result.flavorText).toBe('Uma lâmina lendária forjada nos confins do tempo.');
  });

  it('always uses the form data values for editable fields, never the base', () => {
    const result = buildPreviewWeapon(formData, base);
    expect(result.name).toBe('Terra Blade');
    expect(result.baseDamage).toBe(55);
    expect(result.description).toBe('Uma lâmina lendária.');
  });

  it('falls back to a preview placeholder id and current timestamp when there is no base', () => {
    const result = buildPreviewWeapon(formData, null);
    expect(result.id).toBe('preview');
    expect(result.markdownContent).toBeUndefined();
    expect(result.flavorText).toBeUndefined();
    expect(Number.isNaN(new Date(result.createdAt).getTime())).toBe(false);
  });

  it('falls back to a preview placeholder id when base is omitted entirely', () => {
    const result = buildPreviewWeapon(formData);
    expect(result.id).toBe('preview');
  });
});
