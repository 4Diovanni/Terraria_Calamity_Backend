import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ArmorDetailPage } from './ArmorDetailPage';
import { armorService } from '../../services/armorService';
import { Armor, ArmorClass } from '../../types/armor';
import { RarityLevel } from '../../types/weapon';

vi.mock('../../services/armorService', () => ({
  armorService: { getArmorById: vi.fn() },
}));

const armor: Armor = {
  id: 'daedalus',
  name: 'Armadura de Daedalus',
  armorClass: ArmorClass.MELEE,
  rarity: RarityLevel.RARE,
  totalDefense: 30,
  imageUrl: '',
  pieces: [
    { slot: 'CHEST', name: 'Peitoral de Daedalus', imageUrl: '', defense: 12 },
    { slot: 'HELMET', name: 'Elmo de Daedalus', imageUrl: '', defense: 8 },
    { slot: 'LEGS', name: 'Perneiras de Daedalus', imageUrl: '', defense: 10 },
  ],
  markdownContent: '## Bonus\n\nCristais de neve orbitam o jogador.',
  flavorText: 'O engenho do labirinto.',
  createdAt: '2024-03-01T00:00:00Z',
};

describe('ArmorDetailPage', () => {
  beforeEach(() => {
    vi.mocked(armorService.getArmorById).mockResolvedValue(armor);
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/armor/daedalus']}>
        <Routes>
          <Route path="/armor/:id" element={<ArmorDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

  it('renders the name and class/rarity badges', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Armadura de Daedalus')).toBeInTheDocument());
    // MELEE aparece na badge e no rodapé (Classe); RARE só na badge.
    expect(screen.getAllByText('MELEE')).toHaveLength(2);
    expect(screen.getByText('RARE')).toBeInTheDocument();
  });

  it('renders the three set pieces with PT-BR slot labels', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Peças do Conjunto')).toBeInTheDocument());
    expect(screen.getByText('Elmo')).toBeInTheDocument();
    expect(screen.getByText('Peitoral')).toBeInTheDocument();
    expect(screen.getByText('Calça')).toBeInTheDocument();
    expect(screen.getByText('Elmo de Daedalus')).toBeInTheDocument();
  });

  it('renders the markdown description and links back to the list', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Bonus')).toBeInTheDocument());
    expect(screen.getByText('Cristais de neve orbitam o jogador.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voltar para Armaduras/i })).toHaveAttribute(
      'href',
      '/armor'
    );
  });
});
