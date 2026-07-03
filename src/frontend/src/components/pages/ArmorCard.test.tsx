import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArmorCard } from './ArmorCard';
import { Armor, ArmorClass } from '../../types/armor';
import { RarityLevel } from '../../types/weapon';

const armor: Armor = {
  id: 'victide',
  name: 'Armadura de Victide',
  armorClass: ArmorClass.UNIVERSAL,
  rarity: RarityLevel.COMMON,
  totalDefense: 12,
  imageUrl: '',
  pieces: [],
  flavorText: 'Forjada com os restos do mar.',
  createdAt: '2024-02-10T00:00:00Z',
};

describe('ArmorCard', () => {
  it('renders the name, defense and badges', () => {
    render(<ArmorCard armor={armor} onSelect={() => {}} />);
    expect(screen.getByText('Armadura de Victide')).toBeInTheDocument();
    expect(screen.getByText('12 DEF')).toBeInTheDocument();
    expect(screen.getByText('UNIVERSAL')).toBeInTheDocument();
    expect(screen.getByText('COMMON')).toBeInTheDocument();
  });

  it('calls onSelect with the armor id when clicked', () => {
    const onSelect = vi.fn();
    render(<ArmorCard armor={armor} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('victide');
  });
});
