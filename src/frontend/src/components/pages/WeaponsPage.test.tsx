import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WeaponsPage } from './WeaponsPage';
import { useWeapons } from '../../hooks/useWeapons';
import { Weapon, WeaponTypeClass, Element } from '../../types/weapon';

vi.mock('../../hooks/useWeapons');

vi.mock('../../services/weaponService', () => ({
  weaponService: { createWeapon: vi.fn() },
}));

const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const weapon: Weapon = {
  id: '1',
  name: 'Terra Blade',
  description: 'desc',
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
    mockUseAuth.mockReturnValue({ user: null });
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

  it('filters by rarity tier using the numeric rarity underneath', () => {
    render(
      <MemoryRouter>
        <WeaponsPage />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText('Raridade'), { target: { value: 'LEGENDARY' } });
    expect(screen.getByText('Terra Blade')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Raridade'), { target: { value: 'COMMON' } });
    expect(screen.queryByText('Terra Blade')).not.toBeInTheDocument();
  });

  it('does not show the "Nova Arma" button for non-admin users', () => {
    render(
      <MemoryRouter>
        <WeaponsPage />
      </MemoryRouter>
    );
    expect(screen.queryByRole('button', { name: '+ Nova Arma' })).not.toBeInTheDocument();
  });

  it('shows the "Nova Arma" button and opens the create drawer for admins', async () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Admin', email: 'a@b.com', role: 'ADMIN' } });
    render(
      <MemoryRouter>
        <WeaponsPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '+ Nova Arma' }));
    const dialog = screen.getByRole('dialog', { name: 'Nova Arma' });
    expect(within(dialog).getByLabelText('Nome')).toBeInTheDocument();
  });
});
