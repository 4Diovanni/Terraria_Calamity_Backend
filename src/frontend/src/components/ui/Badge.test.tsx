import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders the value as uppercase text', () => {
    render(<Badge variant="rarity" value="LEGENDARY" />);
    expect(screen.getByText('LEGENDARY')).toBeInTheDocument();
  });

  it('applies a known variant color', () => {
    render(<Badge variant="class" value="MELEE" />);
    expect(screen.getByText('MELEE')).toHaveClass('text-red-400');
  });

  it('falls back to a neutral color for an unknown value', () => {
    render(<Badge variant="element" value="UNKNOWN" />);
    expect(screen.getByText('UNKNOWN')).toHaveClass('text-gray-400');
  });
});
