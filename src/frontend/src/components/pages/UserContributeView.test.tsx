import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserContributeView } from './UserContributeView';
import { submissionService } from '../../services/submissionService';
import { WeaponSubmission } from '../../types/weaponSubmission';
import { WeaponTypeClass, Element } from '../../types/weapon';

vi.mock('../../services/submissionService', () => ({
  submissionService: { create: vi.fn(), getMine: vi.fn(), cancel: vi.fn() },
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
  description: 'desc',
  imageUrl: '',
  rejectionReason: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const rejectedSubmission: WeaponSubmission = {
  ...pendingSubmission,
  id: '2',
  status: 'REJECTED',
  rejectionReason: 'Dano incompatível com a raridade',
};

describe('UserContributeView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the "Nova Proposta" form by default', () => {
    render(<UserContributeView />);
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
  });

  it('creates a proposal and shows a success message', async () => {
    vi.mocked(submissionService.create).mockResolvedValue(pendingSubmission);
    render(<UserContributeView />);

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Terra Blade' } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'desc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar Proposta' }));

    await waitFor(() => expect(submissionService.create).toHaveBeenCalled());
    expect(await screen.findByText(/Proposta enviada/)).toBeInTheDocument();
  });

  it('lists my submissions with status and cancels a pending one', async () => {
    vi.mocked(submissionService.getMine).mockResolvedValue([pendingSubmission, rejectedSubmission]);
    vi.mocked(submissionService.cancel).mockResolvedValue(undefined);
    render(<UserContributeView />);

    fireEvent.click(screen.getByRole('button', { name: 'Minhas Propostas' }));

    await waitFor(() => expect(screen.getAllByText('Terra Blade')).toHaveLength(2));
    expect(screen.getByText('Pendente')).toBeInTheDocument();
    expect(screen.getByText('Rejeitado')).toBeInTheDocument();
    expect(screen.getByText('Motivo: Dano incompatível com a raridade')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(submissionService.cancel).toHaveBeenCalledWith('1'));
  });

  it('shows an empty state when there are no submissions', async () => {
    vi.mocked(submissionService.getMine).mockResolvedValue([]);
    render(<UserContributeView />);

    fireEvent.click(screen.getByRole('button', { name: 'Minhas Propostas' }));

    expect(await screen.findByText('Nenhuma proposta ainda')).toBeInTheDocument();
  });

  it('expands a submission card to show the diff and keeps Cancelar available', async () => {
    vi.mocked(submissionService.getMine).mockResolvedValue([pendingSubmission]);
    render(<UserContributeView />);

    fireEvent.click(screen.getByRole('button', { name: 'Minhas Propostas' }));
    await waitFor(() => expect(screen.getByText('Terra Blade')).toBeInTheDocument());

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.queryByText('desc')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Terra Blade'));

    expect(await screen.findByText('desc')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('shows a live preview of the new weapon while filling the "Nova Proposta" form', () => {
    render(<UserContributeView />);

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Terra Blade' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pré-visualização' }));

    expect(screen.getByRole('heading', { name: 'Terra Blade', level: 1 })).toBeInTheDocument();
  });
});
