import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BiomeDetailPage } from './BiomeDetailPage';
import { biomeService } from '../../services/biomeService';
import { enemyService } from '../../services/enemyService';
import { Biome } from '../../types/biome';
import { Enemy, EnemyType } from '../../types/enemy';

vi.mock('../../services/biomeService', () => ({
  biomeService: { getBiomeById: vi.fn() },
}));
vi.mock('../../services/enemyService', () => ({
  enemyService: { getEnemiesByBiome: vi.fn() },
}));

const biome: Biome = {
  id: 'sulphurous-sea',
  name: 'Praia Sulfúrica',
  summary: 'Litoral ácido.',
  imageUrl: '',
  facts: [{ label: 'Localização', value: 'Litoral do Deserto' }],
  markdownContent: '## Praia Sulfúrica\n\nUma costa corroída.',
  createdAt: '2024-05-01T00:00:00Z',
};

const crab: Enemy = {
  id: 'anthozoan-crab',
  name: 'Caranguejo Antozoário',
  imageUrl: '',
  biome: 'Praia Sulfúrica',
  enemyType: EnemyType.GROUND,
  hp: 45,
  damage: 30,
  defense: 16,
  createdAt: '2024-04-02T00:00:00Z',
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/biomes/sulphurous-sea']}>
      <Routes>
        <Route path="/biomes/:id" element={<BiomeDetailPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('BiomeDetailPage', () => {
  beforeEach(() => {
    vi.mocked(biomeService.getBiomeById).mockResolvedValue(biome);
    vi.mocked(enemyService.getEnemiesByBiome).mockResolvedValue([crab]);
  });

  it('renders the name, facts and markdown description', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Localização')).toBeInTheDocument());
    // Nome aparece no banner placeholder, no h1 e no heading do markdown.
    expect(screen.getAllByText('Praia Sulfúrica').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Litoral do Deserto')).toBeInTheDocument();
    expect(screen.getByText('Uma costa corroída.')).toBeInTheDocument();
  });

  it('lists the enemies scoped to the biome and links back', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Caranguejo Antozoário')).toBeInTheDocument()
    );
    expect(enemyService.getEnemiesByBiome).toHaveBeenCalledWith('Praia Sulfúrica');
    expect(screen.getByRole('link', { name: /Voltar para Biomas/i })).toHaveAttribute(
      'href',
      '/biomes'
    );
  });

  it('shows an empty state when the biome has no enemies', async () => {
    vi.mocked(enemyService.getEnemiesByBiome).mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Nenhum inimigo catalogado neste bioma ainda.')).toBeInTheDocument()
    );
  });
});
