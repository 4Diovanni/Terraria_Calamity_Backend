import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

const mockLogout = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    logout: mockLogout,
    token: null,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
  }),
}));

describe('Header', () => {
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
});
