import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { AdminDashboardView } from './AdminDashboardView';
import { adminService } from '../../services/adminService';
import { AdminDashboard } from '../../types/weaponSubmission';

vi.mock('../../services/adminService', () => ({
  adminService: { getDashboard: vi.fn() },
}));

const dashboard: AdminDashboard = {
  totalUsers: 10,
  totalAdmins: 2,
  totalWeapons: 50,
  pendingSubmissions: 1,
  approvedSubmissions: 3,
  rejectedSubmissions: 1,
};

describe('AdminDashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard counts', async () => {
    vi.mocked(adminService.getDashboard).mockResolvedValue(dashboard);
    render(<AdminDashboardView />);

    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument());
    expect(screen.getByText('Usuários')).toBeInTheDocument();
    const pendentesElement = screen.getByText('Pendentes');
    expect(pendentesElement).toBeInTheDocument();
    const pendentesCard = pendentesElement.closest('div');
    expect(within(pendentesCard!).getByText('1')).toBeInTheDocument();
  });

  it('shows a loading state while fetching', () => {
    vi.mocked(adminService.getDashboard).mockReturnValue(new Promise(() => {}));
    render(<AdminDashboardView />);
    expect(screen.getByText('Carregando painel administrativo...')).toBeInTheDocument();
  });

  it('shows an error with retry when the fetch fails', async () => {
    vi.mocked(adminService.getDashboard).mockRejectedValueOnce(new Error('boom'));
    render(<AdminDashboardView />);

    expect(await screen.findByText('boom')).toBeInTheDocument();

    vi.mocked(adminService.getDashboard).mockResolvedValueOnce(dashboard);
    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));

    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument());
  });
});
