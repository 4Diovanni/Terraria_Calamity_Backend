import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { BossDetailPage } from './BossDetailPage';
import { bossService } from '../../services/bossService';
import { Boss } from '../../types/boss';

vi.mock('../../services/bossService', () => ({
  bossService: { getBossById: vi.fn() },
}));

const boss: Boss = {
  id: 'brimstone-elemental',
  name: 'Elemental de Brimstone',
  imageUrl: '',
  biome: 'Penhasco de Brimstone',
  themeColor: '#c0392b',
  progression: 3,
  progressionLabel: 'Hardmode',
  phases: 2,
  hp: 22000,
  damage: 90,
  defense: 20,
  markdownContent: 'Alterna entre fases.',
  flavorText: 'Vestida em fogo de enxofre.',
  createdAt: '2024-06-04T00:00:00Z',
};

describe('BossDetailPage', () => {
  beforeEach(() => {
    vi.mocked(bossService.getBossById).mockResolvedValue(boss);
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/bosses/brimstone-elemental']}>
        <Routes>
          <Route path="/bosses/:id" element={<BossDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

  it('renders the name and biome/phases/progression chips', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Elemental de Brimstone' })).toBeInTheDocument()
    );
    // Bioma e Progressão aparecem no chip e no rodapé; "2 Fases" só no chip.
    expect(screen.getAllByText('Penhasco de Brimstone')).toHaveLength(2);
    expect(screen.getByText('2 Fases')).toBeInTheDocument();
    expect(screen.getAllByText('Hardmode')).toHaveLength(2);
  });

  it('renders the themed stats and strategy markdown', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('HP')).toBeInTheDocument());
    expect(screen.getByText('Dano')).toBeInTheDocument();
    expect(screen.getByText('Defesa')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Estratégia' })).toBeInTheDocument();
    expect(screen.getByText('Alterna entre fases.')).toBeInTheDocument();
  });

  it('links back to the bosses list', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Elemental de Brimstone' })).toBeInTheDocument()
    );
    expect(screen.getByRole('link', { name: /Voltar para Bosses/i })).toHaveAttribute(
      'href',
      '/bosses'
    );
  });
});
