import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { AdminContributeView } from './AdminContributeView';
import { submissionService } from '../../services/submissionService';
import { WeaponSubmission } from '../../types/weaponSubmission';
import { WeaponTypeClass, Element } from '../../types/weapon';

vi.mock('../../services/submissionService', () => ({
  submissionService: { getAll: vi.fn(), approve: vi.fn(), reject: vi.fn() },
}));

const pendingSubmission: WeaponSubmission = {
  id: '1',
  type: 'CREATE',
  status: 'PENDING',
  submittedByUsername: 'arcanjo',
  targetWeaponId: null,
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
  abilities: '',
  description: 'Uma lâmina lendária',
  imageUrl: '',
  rejectionReason: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('AdminContributeView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(submissionService.getAll).mockResolvedValue([pendingSubmission]);
  });

  it('lists pending submissions by default and expands to show details', async () => {
    render(<AdminContributeView />);
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());
    expect(submissionService.getAll).toHaveBeenCalledWith('WEAPON', 'PENDING');

    fireEvent.click(screen.getByText('Terra Blade'));
    expect(screen.getByText(/Uma lâmina lendária/)).toBeInTheDocument();
  });

  it('approves a submission', async () => {
    vi.mocked(submissionService.approve).mockResolvedValue({ ...pendingSubmission, status: 'APPROVED' });
    render(<AdminContributeView />);
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Terra Blade'));
    fireEvent.click(screen.getByRole('button', { name: 'Aprovar' }));

    await waitFor(() => expect(submissionService.approve).toHaveBeenCalledWith('1'));
  });

  it('rejects a submission with a reason', async () => {
    vi.mocked(submissionService.reject).mockResolvedValue({ ...pendingSubmission, status: 'REJECTED' });
    render(<AdminContributeView />);
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Terra Blade'));
    fireEvent.click(screen.getByRole('button', { name: 'Rejeitar' }));
    fireEvent.change(screen.getByPlaceholderText('Motivo da rejeição'), {
      target: { value: 'Dano incompatível' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar Rejeição' }));

    await waitFor(() =>
      expect(submissionService.reject).toHaveBeenCalledWith('1', 'Dano incompatível')
    );
  });

  it('switches status filter and refetches', async () => {
    render(<AdminContributeView />);
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Aprovadas' }));

    await waitFor(() => expect(submissionService.getAll).toHaveBeenCalledWith('WEAPON', 'APPROVED'));
  });

  it('opens and closes the full preview drawer for a submission', async () => {
    render(<AdminContributeView />);
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Terra Blade'));
    fireEvent.click(screen.getByRole('button', { name: 'Ver preview completo' }));

    const dialog = await screen.findByRole('dialog', { name: 'Preview: Terra Blade' });
    expect(within(dialog).getByRole('heading', { name: 'Terra Blade', level: 1 })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Fechar' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Preview: Terra Blade' })).not.toBeInTheDocument()
    );
  });
});
