import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BossCard } from './BossCard';
import { Boss } from '../../types/boss';

const boss: Boss = {
  id: 'providence',
  name: 'Providência',
  imageUrl: '',
  biome: 'Templo Profanado',
  themeColor: '#f0c419',
  progression: 4,
  progressionLabel: 'Pós-Providência',
  phases: 2,
  hp: 340000,
  damage: 130,
  defense: 45,
  createdAt: '2024-06-08T00:00:00Z',
};

describe('BossCard', () => {
  it('renders the name and progression chip', () => {
    render(<BossCard boss={boss} onSelect={() => {}} />);
    expect(screen.getByText('Providência')).toBeInTheDocument();
    expect(screen.getByText('Pós-Providência')).toBeInTheDocument();
  });

  it('calls onSelect with the boss id when clicked', () => {
    const onSelect = vi.fn();
    render(<BossCard boss={boss} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('providence');
  });
});
