import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { WeaponDetailPage } from './WeaponDetailPage';
import { weaponService } from '../../services/weaponService';
import { Weapon, WeaponTypeClass, Element } from '../../types/weapon';

vi.mock('../../services/weaponService', () => ({
  weaponService: { getWeaponById: vi.fn(), updateWeapon: vi.fn(), deleteWeapon: vi.fn() },
}));

const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const weapon: Weapon = {
  id: '42',
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
  abilities: 'Investida em linha reta ao acertar um crítico.',
  imageUrl: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('WeaponDetailPage', () => {
  beforeEach(() => {
    vi.mocked(weaponService.getWeaponById).mockResolvedValue(weapon);
    mockUseAuth.mockReturnValue({ user: null });
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/weapons/42']}>
        <Routes>
          <Route path="/weapons/:id" element={<WeaponDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

  it('renders the weapon name and tipo/raridade/classe badges', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());
    // Badges: Tipo (element) e Raridade uma vez; Classe aparece na badge e no rodapé.
    expect(screen.getByText('NEUTRAL')).toBeInTheDocument();
    expect(screen.getByText('LEGENDARY')).toBeInTheDocument();
    expect(screen.getAllByText('MELEE')).toHaveLength(2);
  });

  it('renders the description as markdown and the codex footer', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('desc')).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Descrição' })).toBeInTheDocument();
    expect(screen.getByText('Estatísticas')).toBeInTheDocument();
    expect(screen.getByText('Classe')).toBeInTheDocument();
    expect(screen.getByText('Adicionado em')).toBeInTheDocument();
  });

  it('renders price, quality and abilities', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());
    expect(screen.getByText('Qualidade')).toBeInTheDocument();
    expect(screen.getByText('Preço')).toBeInTheDocument();
    expect(screen.getByText('100 moedas')).toBeInTheDocument();
    expect(screen.getByText('Habilidades')).toBeInTheDocument();
    expect(
      screen.getByText('Investida em linha reta ao acertar um crítico.')
    ).toBeInTheDocument();
  });

  it('links back to the weapons list', async () => {
    renderPage();

    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /Voltar para Armas/i })).toHaveAttribute(
      'href',
      '/weapons'
    );
  });
});
