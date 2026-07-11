import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { WeaponDetailPage } from './WeaponDetailPage';
import { weaponService } from '../../services/weaponService';
import { submissionService } from '../../services/submissionService';
import { Weapon, WeaponTypeClass, Element } from '../../types/weapon';

vi.mock('../../services/weaponService', () => ({
  weaponService: { getWeaponById: vi.fn(), updateWeapon: vi.fn(), deleteWeapon: vi.fn() },
}));

vi.mock('../../services/submissionService', () => ({
  submissionService: { create: vi.fn() },
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

  it('does not show admin action buttons for non-admin users', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
  });

  it('opens the edit drawer pre-filled and saves via updateWeapon for admins', async () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Admin', email: 'a@b.com', role: 'ADMIN' } });
    vi.mocked(weaponService.updateWeapon).mockResolvedValue({ ...weapon, name: 'Terra Blade+' });
    renderPage();
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const dialog = screen.getByRole('dialog', { name: 'Editar Arma' });
    expect(within(dialog).getByLabelText('Nome')).toHaveValue('Terra Blade');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvar Alterações' }));

    await waitFor(() =>
      expect(weaponService.updateWeapon).toHaveBeenCalledWith('42', expect.objectContaining({ name: 'Terra Blade' }))
    );
    await waitFor(() => expect(screen.getByText('Terra Blade+')).toBeInTheDocument());
  });

  it('deletes the weapon and navigates back to the list on confirm', async () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Admin', email: 'a@b.com', role: 'ADMIN' } });
    vi.mocked(weaponService.deleteWeapon).mockResolvedValue(undefined);
    renderPage();
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Deletar' }));
    const dialog = screen.getByRole('dialog', { name: 'Deletar Arma' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar Exclusão' }));

    await waitFor(() => expect(weaponService.deleteWeapon).toHaveBeenCalledWith('42'));
  });

  it('shows the backend conflict message when delete fails with 409', async () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Admin', email: 'a@b.com', role: 'ADMIN' } });
    vi.mocked(weaponService.deleteWeapon).mockRejectedValue({
      status: 409,
      message: 'Não é possível deletar: esta arma possui submissões associadas',
    });
    renderPage();
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Deletar' }));
    const dialog = screen.getByRole('dialog', { name: 'Deletar Arma' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar Exclusão' }));

    expect(
      await within(dialog).findByText('Não é possível deletar: esta arma possui submissões associadas')
    ).toBeInTheDocument();
  });

  it('does not show "Sugerir Edição" for non-authenticated users', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Sugerir Edição' })).not.toBeInTheDocument();
  });

  it('shows "Sugerir Edição" for USER (not ADMIN) and submits a targeted proposal', async () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Arcanjo', email: 'a@b.com', role: 'USER' } });
    vi.mocked(submissionService.create).mockResolvedValue({} as never);
    renderPage();
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sugerir Edição' }));
    const dialog = screen.getByRole('dialog', { name: 'Sugerir Edição' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar Proposta' }));

    await waitFor(() =>
      expect(submissionService.create).toHaveBeenCalledWith(
        'WEAPON',
        expect.objectContaining({ name: 'Terra Blade', targetWeaponId: '42' })
      )
    );
    expect(await screen.findByText(/Proposta enviada/)).toBeInTheDocument();
  });

  it('shows a wide preview-capable drawer when editing, with the current weapon prefilled in the preview tab', async () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Admin', email: 'a@b.com', role: 'ADMIN' } });
    renderPage();
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const dialog = screen.getByRole('dialog', { name: 'Editar Arma' });
    expect(dialog).toHaveClass('max-w-3xl');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Pré-visualização' }));
    expect(within(dialog).getByRole('heading', { name: 'Terra Blade', level: 1 })).toBeInTheDocument();
  });
});
