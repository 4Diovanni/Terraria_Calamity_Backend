import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EnemiesPage } from './EnemiesPage';
import { enemyService } from '../../services/enemyService';
import { Enemy, EnemyType } from '../../types/enemy';

vi.mock('../../services/enemyService', () => ({
  enemyService: { getAllEnemies: vi.fn() },
}));

const enemies: Enemy[] = [
  {
    id: 'anthozoan-crab',
    name: 'Caranguejo Antozoário',
    imageUrl: '',
    biome: 'Praia Sulfúrica',
    enemyType: EnemyType.GROUND,
    hp: 45,
    damage: 30,
    defense: 16,
    createdAt: '2024-04-02T00:00:00Z',
  },
  {
    id: 'sea-serpent',
    name: 'Serpente Marinha',
    imageUrl: '',
    biome: 'Mar Afundado',
    enemyType: EnemyType.AQUATIC,
    hp: 180,
    damage: 70,
    defense: 20,
    createdAt: '2024-04-08T00:00:00Z',
  },
];

describe('EnemiesPage', () => {
  beforeEach(() => {
    vi.mocked(enemyService.getAllEnemies).mockResolvedValue(enemies);
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <EnemiesPage />
      </MemoryRouter>
    );

  it('renders the grid with all enemies', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Caranguejo Antozoário')).toBeInTheDocument());
    expect(screen.getByText('Serpente Marinha')).toBeInTheDocument();
  });

  it('filters the list by biome', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Caranguejo Antozoário')).toBeInTheDocument());

    // O primeiro combobox é o filtro de Bioma.
    const biomeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(biomeSelect, { target: { value: 'Mar Afundado' } });

    expect(screen.queryByText('Caranguejo Antozoário')).not.toBeInTheDocument();
    expect(screen.getByText('Serpente Marinha')).toBeInTheDocument();
  });
});
