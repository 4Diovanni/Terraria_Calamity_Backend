import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { WeaponDetailPage } from './WeaponDetailPage';
import { weaponService } from '../../services/weaponService';
import { Weapon, WeaponTypeClass, Element, RarityLevel } from '../../types/weapon';

vi.mock('../../services/weaponService', () => ({
  weaponService: { getWeaponById: vi.fn() },
}));

const weapon: Weapon = {
  id: '42',
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

describe('WeaponDetailPage', () => {
  beforeEach(() => {
    vi.mocked(weaponService.getWeaponById).mockResolvedValue(weapon);
  });

  it('renders the weapon name and rarity/element/class badges', async () => {
    render(
      <MemoryRouter initialEntries={['/weapons/42']}>
        <Routes>
          <Route path="/weapons/:id" element={<WeaponDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());
    // Badges appear in header + info boxes: Rarity once, Element once, Class twice (badge + Tipo box)
    expect(screen.getAllByText('LEGENDARY')).toHaveLength(1);
    expect(screen.getAllByText('NEUTRAL')).toHaveLength(1);
    expect(screen.getAllByText('MELEE')).toHaveLength(2);
  });
});
