import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const baseAuth = {
  token: null,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

describe('ProtectedRoute', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renderiza children quando usuário está autenticado', () => {
    mockUseAuth.mockReturnValue({
      ...baseAuth,
      user: { username: 'Arcanjo', email: 'a@b.com', role: 'USER' },
    });
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Conteúdo protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();
  });

  it('redireciona para /login quando usuário não está autenticado', () => {
    mockUseAuth.mockReturnValue({ ...baseAuth, user: null });
    render(
      <MemoryRouter initialEntries={['/perfil']}>
        <Routes>
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <div>Protegido</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Página de Login</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.queryByText('Protegido')).not.toBeInTheDocument();
    expect(screen.getByText('Página de Login')).toBeInTheDocument();
  });

  it('não renderiza children durante carregamento inicial para evitar flash de redirect', () => {
    mockUseAuth.mockReturnValue({ ...baseAuth, user: null, isLoading: true });
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText('Protegido')).not.toBeInTheDocument();
  });
});
