import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeaponCard } from './WeaponCard';
import { Weapon, WeaponTypeClass, Element } from '../../types/weapon';

const weapon: Weapon = {
  id: '1',
  name: 'Terra Blade',
  description: 'Uma lâmina lendária forjada na Floresta da Corrupção.',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  rarity: 16,
  baseDamage: 55,
  criticalChance: 10,
  attacksPerTurn: 2,
  range: 3,
  price: 100,
  quality: 8,
  abilities: '',
  imageUrl: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('WeaponCard', () => {
  it('renders the weapon name, damage and badges', () => {
    render(<WeaponCard weapon={weapon} onSelect={() => {}} />);
    expect(screen.getByText('Terra Blade')).toBeInTheDocument();
    expect(screen.getByText('55 DANO')).toBeInTheDocument();
    expect(screen.getByText('LEGENDARY')).toBeInTheDocument();
  });

  it('calls onSelect with the weapon id when clicked', () => {
    const onSelect = vi.fn();
    render(<WeaponCard weapon={weapon} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
