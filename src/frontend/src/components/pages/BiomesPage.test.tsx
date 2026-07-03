import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BiomesPage } from './BiomesPage';
import { biomeService } from '../../services/biomeService';
import { Biome } from '../../types/biome';

vi.mock('../../services/biomeService', () => ({
  biomeService: { getAllBiomes: vi.fn() },
}));

const biomes: Biome[] = [
  {
    id: 'sulphurous-sea',
    name: 'Praia Sulfúrica',
    summary: 'Litoral ácido.',
    imageUrl: '',
    facts: [],
    createdAt: '2024-05-01T00:00:00Z',
  },
  {
    id: 'abyss',
    name: 'Abismo',
    summary: 'Fossa oceânica profunda.',
    imageUrl: '',
    facts: [],
    createdAt: '2024-05-06T00:00:00Z',
  },
];

describe('BiomesPage', () => {
  beforeEach(() => {
    vi.mocked(biomeService.getAllBiomes).mockResolvedValue(biomes);
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <BiomesPage />
      </MemoryRouter>
    );

  it('renders the grid with all biomes', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Litoral ácido.')).toBeInTheDocument());
    expect(screen.getByText('Fossa oceânica profunda.')).toBeInTheDocument();
  });

  it('filters biomes by search term', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Litoral ácido.')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Digite o nome do bioma...'), {
      target: { value: 'abismo' },
    });

    expect(screen.queryByText('Litoral ácido.')).not.toBeInTheDocument();
    expect(screen.getByText('Fossa oceânica profunda.')).toBeInTheDocument();
  });
});
