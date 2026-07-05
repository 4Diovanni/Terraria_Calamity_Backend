import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContributePage } from './ContributePage';

const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('ContributePage', () => {
  it('renders the USER view for non-admin users', () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Arcanjo', email: 'a@b.com', role: 'USER' } });
    render(<ContributePage />);
    expect(screen.getByText(/proponha uma arma/i)).toBeInTheDocument();
  });

  it('renders the ADMIN view for admin users', () => {
    mockUseAuth.mockReturnValue({ user: { username: 'Admin', email: 'a@b.com', role: 'ADMIN' } });
    render(<ContributePage />);
    expect(screen.getByText(/dashboard e fila/i)).toBeInTheDocument();
  });
});
