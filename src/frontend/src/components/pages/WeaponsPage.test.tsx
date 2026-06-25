import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WeaponsPage } from './WeaponsPage';
import { useWeapons } from '../../hooks/useWeapons';
import { Weapon, WeaponTypeClass, Element, RarityLevel } from '../../types/weapon';

vi.mock('../../hooks/useWeapons');

const weapon: Weapon = {
  id: '1',
  name: 'Terra Blade',
  description: 'desc',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  rarity: RarityLevel.LEGENDARY,
  baseDamage: 55,
  criticalChance: 10,
  attacksPerTurn: 2,
  range: 3,
  imageUrl: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('WeaponsPage', () => {
  beforeEach(() => {
    vi.mocked(useWeapons).mockReturnValue({
      weapons: [weapon],
      loading: false,
      error: null,
      wakingUp: false,
      retryAttempt: null,
      refetch: vi.fn(),
    });
  });

  it('renders the weapon list as a card grid', () => {
    render(
      <MemoryRouter>
        <WeaponsPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Terra Blade')).toBeInTheDocument();
  });

  it('opens the filter drawer from the mobile filter button', () => {
    render(
      <MemoryRouter>
        <WeaponsPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Filtrar/ }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Buscar por Nome')).toBeInTheDocument();
  });
});
