import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminContributeView } from './AdminContributeView';
import { adminService } from '../../services/adminService';
import { submissionService } from '../../services/submissionService';
import { WeaponSubmission, AdminDashboard } from '../../types/weaponSubmission';
import { WeaponTypeClass, Element } from '../../types/weapon';

vi.mock('../../services/adminService', () => ({
  adminService: { getDashboard: vi.fn() },
}));

vi.mock('../../services/submissionService', () => ({
  submissionService: { getAll: vi.fn(), approve: vi.fn(), reject: vi.fn() },
}));

const dashboard: AdminDashboard = {
  totalUsers: 10,
  totalAdmins: 2,
  totalWeapons: 50,
  pendingSubmissions: 1,
  approvedSubmissions: 3,
  rejectedSubmissions: 1,
};

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
    vi.mocked(adminService.getDashboard).mockResolvedValue(dashboard);
    vi.mocked(submissionService.getAll).mockResolvedValue([pendingSubmission]);
  });

  it('renders the dashboard counts', async () => {
    render(<AdminContributeView />);
    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument());
    expect(screen.getByText('Usuários')).toBeInTheDocument();
    // "Pendentes" aparece duas vezes: o card do dashboard e o botão de filtro de status.
    expect(screen.getAllByText('Pendentes')).toHaveLength(2);
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
});
