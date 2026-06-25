import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';
import { useWeapons } from '../../hooks';

vi.mock('../../hooks', () => ({
  useWeapons: vi.fn(),
}));

describe('HomePage', () => {
  it('renders the hero heading and category links', () => {
    vi.mocked(useWeapons).mockReturnValue({
      weapons: [],
      loading: false,
      error: null,
      wakingUp: false,
      retryAttempt: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Terraria Calamity RPG' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Explorar Armas/ })).toBeInTheDocument();
  });
});
