import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EnemyDetailPage } from './EnemyDetailPage';
import { enemyService } from '../../services/enemyService';
import { Enemy, EnemyType } from '../../types/enemy';

vi.mock('../../services/enemyService', () => ({
  enemyService: { getEnemyById: vi.fn() },
}));

const enemy: Enemy = {
  id: 'anthozoan-crab',
  name: 'Caranguejo Antozoário',
  imageUrl: '',
  biome: 'Praia Sulfúrica',
  enemyType: EnemyType.GROUND,
  hp: 45,
  damage: 30,
  defense: 16,
  markdownContent: '## Comportamento\n\nAnda pela costa.',
  flavorText: 'Suas garras guardam veneno.',
  createdAt: '2024-04-02T00:00:00Z',
};

describe('EnemyDetailPage', () => {
  beforeEach(() => {
    vi.mocked(enemyService.getEnemyById).mockResolvedValue(enemy);
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/enemies/anthozoan-crab']}>
        <Routes>
          <Route path="/enemies/:id" element={<EnemyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

  it('renders the name and biome/type chips', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Caranguejo Antozoário')).toBeInTheDocument());
    // Bioma aparece no chip e no rodapé; Tipo (Terrestre) só no chip.
    expect(screen.getAllByText('Praia Sulfúrica')).toHaveLength(2);
    expect(screen.getByText('Terrestre')).toBeInTheDocument();
  });

  it('renders the HP/damage/defense stats', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('HP')).toBeInTheDocument());
    expect(screen.getByText('Dano')).toBeInTheDocument();
    expect(screen.getByText('Defesa')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('renders the markdown description and links back to the list', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Comportamento')).toBeInTheDocument());
    expect(screen.getByText('Anda pela costa.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voltar para Inimigos/i })).toHaveAttribute(
      'href',
      '/enemies'
    );
  });
});
