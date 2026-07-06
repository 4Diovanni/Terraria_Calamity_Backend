import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';
import * as apiClientModule from '../services/apiClient';
import { authService } from '../services/authService';
import type { AuthResponse } from '../types/auth';

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

const mockAuthResponse: AuthResponse = {
  token: 'mock.jwt.token',
  type: 'Bearer',
  username: 'testuser',
  email: 'test@example.com',
  role: 'USER',
};

function AuthConsumer() {
  const { user, token, isLoading, login, register, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user ? user.username : 'null'}</span>
      <span data-testid="token">{token ?? 'null'}</span>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register('testuser', 'test@example.com', 'password')}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(apiClientModule, 'setAuthToken').mockImplementation(() => {});
    vi.spyOn(apiClientModule, 'removeAuthToken').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with isLoading true then resolves to false with no user', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('login() sets user and token on success', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockAuthResponse);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Login'));
    });

    expect(screen.getByTestId('user').textContent).toBe('testuser');
    expect(screen.getByTestId('token').textContent).toBe('mock.jwt.token');
    expect(apiClientModule.setAuthToken).toHaveBeenCalledWith('mock.jwt.token');
  });

  it('register() sets user and token on success', async () => {
    vi.mocked(authService.register).mockResolvedValue(mockAuthResponse);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Register'));
    });

    expect(screen.getByTestId('user').textContent).toBe('testuser');
    expect(apiClientModule.setAuthToken).toHaveBeenCalledWith('mock.jwt.token');
  });

  it('logout() clears user and token', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockAuthResponse);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Login'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Logout'));
    });

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('token').textContent).toBe('null');
    expect(apiClientModule.removeAuthToken).toHaveBeenCalled();
  });

  it('rehydrates user by validating the stored token against the backend', async () => {
    localStorage.setItem('jwt_token', 'stored.jwt.token');
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      username: 'stored',
      email: 'stored@example.com',
      role: 'USER',
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    expect(screen.getByTestId('user').textContent).toBe('stored');
    expect(screen.getByTestId('token').textContent).toBe('stored.jwt.token');
    expect(apiClientModule.setAuthToken).toHaveBeenCalledWith('stored.jwt.token');
  });

  it('clears an invalid/expired token when the backend rejects it on mount', async () => {
    localStorage.setItem('jwt_token', 'stale.jwt.token');
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('401'));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false')
    );

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(apiClientModule.removeAuthToken).toHaveBeenCalled();
  });
});
