import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BiomeCard } from './BiomeCard';
import { Biome } from '../../types/biome';

const biome: Biome = {
  id: 'sulphurous-sea',
  name: 'Praia Sulfúrica',
  summary: 'Litoral ácido e envenenado.',
  imageUrl: '',
  facts: [],
  createdAt: '2024-05-01T00:00:00Z',
};

describe('BiomeCard', () => {
  it('renders the name and summary', () => {
    render(<BiomeCard biome={biome} onSelect={() => {}} />);
    // O nome aparece no placeholder do banner e no título.
    expect(screen.getAllByText('Praia Sulfúrica').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Litoral ácido e envenenado.')).toBeInTheDocument();
  });

  it('calls onSelect with the biome id when clicked', () => {
    const onSelect = vi.fn();
    render(<BiomeCard biome={biome} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('sulphurous-sea');
  });
});
