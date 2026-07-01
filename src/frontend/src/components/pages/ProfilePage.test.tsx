import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
});
