import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BossesPage } from './BossesPage';
import { bossService } from '../../services/bossService';
import { Boss } from '../../types/boss';

vi.mock('../../services/bossService', () => ({
  bossService: { getAllBosses: vi.fn() },
}));

const makeBoss = (over: Partial<Boss>): Boss => ({
  id: 'x',
  name: 'X',
  imageUrl: '',
  biome: 'Bioma',
  themeColor: '#ffffff',
  progression: 1,
  progressionLabel: 'Pré-Hardmode',
  phases: 1,
  hp: 1000,
  damage: 10,
  defense: 1,
  createdAt: '2024-06-01T00:00:00Z',
  ...over,
});

// Fornecido fora de ordem de propósito.
const bosses: Boss[] = [
  makeBoss({ id: 'dog', name: 'Devorador de Deuses', progression: 5 }),
  makeBoss({ id: 'desert', name: 'Flagelo do Deserto', progression: 1 }),
];

describe('BossesPage', () => {
  beforeEach(() => {
    vi.mocked(bossService.getAllBosses).mockResolvedValue(bosses);
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <BossesPage />
      </MemoryRouter>
    );

  it('renders the grid ordered by progression', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Flagelo do Deserto')).toBeInTheDocument());
    const names = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(names).toEqual(['Flagelo do Deserto', 'Devorador de Deuses']);
  });

  it('filters bosses by search term', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Flagelo do Deserto')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Digite o nome do boss...'), {
      target: { value: 'devorador' },
    });

    expect(screen.queryByText('Flagelo do Deserto')).not.toBeInTheDocument();
    expect(screen.getByText('Devorador de Deuses')).toBeInTheDocument();
  });
});
