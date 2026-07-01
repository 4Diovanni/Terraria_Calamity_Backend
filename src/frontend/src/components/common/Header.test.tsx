import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

const mockLogout = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const noUser = {
  user: null,
  logout: mockLogout,
  token: null,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
};

const withUser = {
  ...noUser,
  user: { username: 'Arcanjo', email: 'a@b.com', role: 'USER' as const },
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(noUser);
  });

  it('opens the mobile nav drawer when the menu button is clicked', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the drawer after a nav link is clicked', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByText('Armas'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows "Entrar" link when user is not logged in', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /entrar/i })).toBeInTheDocument();
  });

  it('shows username as link to /perfil when user is logged in', () => {
    mockUseAuth.mockReturnValue(withUser);
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    const links = screen.getAllByRole('link', { name: 'Arcanjo' });
    expect(links.length).toBeGreaterThanOrEqual(1);
    links.forEach((link) => expect(link).toHaveAttribute('href', '/perfil'));
  });

  it('username link in mobile drawer closes drawer on click', () => {
    mockUseAuth.mockReturnValue(withUser);
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('link', { name: 'Arcanjo' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not show "Sair" button when user is logged in', () => {
    mockUseAuth.mockReturnValue(withUser);
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.queryByRole('button', { name: /sair/i })).not.toBeInTheDocument();
  });
});
