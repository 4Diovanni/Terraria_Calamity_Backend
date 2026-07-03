import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ArmorPage } from './ArmorPage';
import { armorService } from '../../services/armorService';
import { Armor, ArmorClass } from '../../types/armor';
import { RarityLevel } from '../../types/weapon';

vi.mock('../../services/armorService', () => ({
  armorService: { getAllArmors: vi.fn() },
}));

const armors: Armor[] = [
  {
    id: 'victide',
    name: 'Armadura de Victide',
    armorClass: ArmorClass.UNIVERSAL,
    rarity: RarityLevel.COMMON,
    totalDefense: 12,
    imageUrl: '',
    pieces: [],
    createdAt: '2024-02-10T00:00:00Z',
  },
  {
    id: 'brimflame',
    name: 'Armadura de Brimchama',
    armorClass: ArmorClass.MAGE,
    rarity: RarityLevel.EPIC,
    totalDefense: 22,
    imageUrl: '',
    pieces: [],
    createdAt: '2024-03-08T00:00:00Z',
  },
];

describe('ArmorPage', () => {
  beforeEach(() => {
    vi.mocked(armorService.getAllArmors).mockResolvedValue(armors);
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <ArmorPage />
      </MemoryRouter>
    );

  it('renders the grid with all armors', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Armadura de Victide')).toBeInTheDocument());
    expect(screen.getByText('Armadura de Brimchama')).toBeInTheDocument();
  });

  it('filters the list by search term', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Armadura de Victide')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Digite o nome da armadura...'), {
      target: { value: 'brim' },
    });

    expect(screen.queryByText('Armadura de Victide')).not.toBeInTheDocument();
    expect(screen.getByText('Armadura de Brimchama')).toBeInTheDocument();
  });
});
