import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';
import { useWeapons } from '../../hooks';

vi.mock('../../hooks', () => ({
  useWeapons: vi.fn(),
}));

beforeEach(() => {
  // PageSidebar uses IntersectionObserver; jsdom does not provide it
  window.IntersectionObserver = vi.fn(function () {
    return { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() };
  }) as unknown as typeof IntersectionObserver;
});

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

    expect(screen.getByRole('heading', { name: /Terraria.*Calamity/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Explorar Armas/ })).toBeInTheDocument();
  });
});
