import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
    user: null,
    token: null,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('RegisterPage', () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockNavigate.mockReset();
  });

  it('renders username, email, password fields and submit button', () => {
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);
    expect(screen.getByLabelText(/nome de usu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('calls register with form values and navigates to / on success', async () => {
    mockRegister.mockResolvedValue(undefined);
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/nome de usu/i), {
      target: { value: 'jogador1' },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'jogador@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'senha123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
    expect(mockRegister).toHaveBeenCalledWith(
      'jogador1',
      'jogador@example.com',
      'senha123'
    );
  });

  it('displays inline error on 409 (duplicate email or username)', async () => {
    mockRegister.mockRejectedValue({ status: 409 });
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/nome de usu/i), {
      target: { value: 'duplicado' },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'dup@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() =>
      expect(screen.getByText(/e-mail ou nome de usu/i)).toBeInTheDocument()
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('displays inline error on network/server error', async () => {
    mockRegister.mockRejectedValue({ status: 500 });
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() =>
      expect(screen.getByText(/erro de conex/i)).toBeInTheDocument()
    );
  });

  it('disables the submit button while the request is in flight', async () => {
    let resolveRegister!: () => void;
    mockRegister.mockReturnValue(new Promise<void>((r) => { resolveRegister = r; }));
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/nome de usu/i), {
      target: { value: 'u' },
    });
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'u@u.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'p' },
    });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(screen.getByRole('button', { name: /criar conta/i })).toBeDisabled();
    resolveRegister();
  });
});
