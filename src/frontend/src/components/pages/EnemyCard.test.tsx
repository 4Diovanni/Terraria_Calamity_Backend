import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnemyCard } from './EnemyCard';
import { Enemy, EnemyType } from '../../types/enemy';

const enemy: Enemy = {
  id: 'trasher',
  name: 'Trasher',
  imageUrl: '',
  biome: 'Praia Sulfúrica',
  enemyType: EnemyType.AQUATIC,
  hp: 250,
  damage: 55,
  defense: 10,
  createdAt: '2024-04-05T00:00:00Z',
};

describe('EnemyCard', () => {
  it('renders the name, hp and chips', () => {
    render(<EnemyCard enemy={enemy} onSelect={() => {}} />);
    expect(screen.getByText('Trasher')).toBeInTheDocument();
    expect(screen.getByText('250 HP')).toBeInTheDocument();
    expect(screen.getByText('Praia Sulfúrica')).toBeInTheDocument();
    expect(screen.getByText('Aquático')).toBeInTheDocument();
  });

  it('calls onSelect with the enemy id when clicked', () => {
    const onSelect = vi.fn();
    render(<EnemyCard enemy={enemy} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('trasher');
  });
});
