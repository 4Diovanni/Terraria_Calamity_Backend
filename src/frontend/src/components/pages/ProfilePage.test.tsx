import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';

const mockLogout = vi.fn();
const mockNavigate = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../services/adminService', () => ({
  adminService: { getDashboard: vi.fn() },
}));

vi.mock('../../services/submissionService', () => ({
  submissionService: { getAll: vi.fn(), getMine: vi.fn() },
}));

import { adminService } from '../../services/adminService';

const userBase = {
  username: 'Arcanjo',
  email: 'arcanjo@calamity.com',
  role: 'USER' as const,
};

const authBase = {
  user: userBase,
  logout: mockLogout,
  token: 'tok',
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(authBase);
    vi.mocked(adminService.getDashboard).mockResolvedValue({
      totalUsers: 0,
      totalAdmins: 0,
      totalWeapons: 0,
      pendingSubmissions: 0,
      approvedSubmissions: 0,
      rejectedSubmissions: 0,
    });
  });

  it('exibe o username do usuário autenticado', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.getByText('Arcanjo')).toBeInTheDocument();
  });

  it('exibe o email do usuário', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.getByText('arcanjo@calamity.com')).toBeInTheDocument();
  });

  it('exibe role USER traduzida como USUÁRIO', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.getByText('USUÁRIO')).toBeInTheDocument();
  });

  it('exibe role ADMIN traduzida como ADMINISTRADOR', () => {
    mockUseAuth.mockReturnValue({
      ...authBase,
      user: { ...userBase, role: 'ADMIN' as const },
    });
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.getByText('ADMINISTRADOR')).toBeInTheDocument();
  });

  it('chama logout ao clicar em "Encerrar sessão"', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /encerrar sessão/i }));
    expect(mockLogout).toHaveBeenCalledOnce();
  });

  it('navega para /login após encerrar sessão', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /encerrar sessão/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('renderiza a aba Contribuições com UserContributeView para usuário comum', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Contribuições' }));
    expect(screen.getByRole('button', { name: 'Nova Proposta' })).toBeInTheDocument();
  });

  it('renderiza a aba Contribuições com AdminContributeView para admin', () => {
    mockUseAuth.mockReturnValue({
      ...authBase,
      user: { ...userBase, role: 'ADMIN' as const },
    });
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Contribuições' }));
    expect(screen.getByRole('button', { name: 'Pendentes' })).toBeInTheDocument();
  });

  it('mantém a aba Perfil como conteúdo inicial', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.getByText('Arcanjo')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nova Proposta' })).not.toBeInTheDocument();
  });

  it('não mostra a aba Dashboard para usuário comum', () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);
    expect(screen.queryByRole('button', { name: 'Dashboard' })).not.toBeInTheDocument();
  });

  it('mostra a aba Dashboard para admin e renderiza AdminDashboardView ao clicar', async () => {
    mockUseAuth.mockReturnValue({
      ...authBase,
      user: { ...userBase, role: 'ADMIN' as const },
    });
    render(<MemoryRouter><ProfilePage /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }));

    await waitFor(() => expect(screen.getByText('Usuários')).toBeInTheDocument());
  });
});
