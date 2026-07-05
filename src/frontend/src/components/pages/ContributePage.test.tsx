import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContributePage } from './ContributePage';
import { adminService } from '../../services/adminService';

const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../../services/adminService', () => ({
  adminService: { getDashboard: vi.fn() },
}));

vi.mock('../../services/weaponSubmissionService', () => ({
  weaponSubmissionService: { getAll: vi.fn(), getMine: vi.fn() },
}));

describe('ContributePage', () => {
  beforeEach(() => {
    vi.mocked(adminService.getDashboard).mockResolvedValue({
      totalUsers: 0,
      totalAdmins: 0,
      totalWeapons: 0,
      pendingSubmissions: 0,
      approvedSubmissions: 0,
      rejectedSubmissions: 0,
    });
  });

  it('renders the USER view for non-admin users', () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Arcanjo', email: 'a@b.com', role: 'USER' } });
    render(<ContributePage />);
    expect(screen.getByRole('button', { name: 'Nova Proposta' })).toBeInTheDocument();
  });

  it('renders the ADMIN view for admin users', () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Admin', email: 'a@b.com', role: 'ADMIN' } });
    render(<ContributePage />);
    expect(screen.getByRole('button', { name: 'Pendentes' })).toBeInTheDocument();
  });
});
