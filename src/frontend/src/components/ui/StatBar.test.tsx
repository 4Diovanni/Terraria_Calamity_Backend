import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatBar } from './StatBar';

describe('StatBar', () => {
  it('renders the label and the display value', () => {
    render(<StatBar label="Dano" value={55} max={200} />);
    expect(screen.getByText('Dano')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();
  });

  it('uses displayValue when provided', () => {
    render(<StatBar label="Crítico" value={10} displayValue="10%" max={100} />);
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('clamps the bar width to 100% when value exceeds max', () => {
    const { container } = render(<StatBar label="Dano" value={500} max={200} />);
    const bar = container.querySelector('.h-full') as HTMLElement;
    expect(bar.style.width).toBe('100%');
  });

  it('scales the bar width proportionally within range', () => {
    const { container } = render(<StatBar label="Dano" value={50} max={200} />);
    const bar = container.querySelector('.h-full') as HTMLElement;
    expect(bar.style.width).toBe('25%');
  });
});
