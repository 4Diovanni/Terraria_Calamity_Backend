import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeaponDetailContent } from './WeaponDetailContent';
import { Weapon, WeaponTypeClass, Element } from '../../types/weapon';

const weapon: Weapon = {
  id: '42',
  name: 'Terra Blade',
  description: 'desc',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  rarity: 16,
  baseDamage: 55,
  criticalChance: 10,
  attacksPerTurn: 2,
  range: 3,
  price: 100,
  quality: 8,
  abilities: 'Investida em linha reta ao acertar um crítico.',
  imageUrl: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('WeaponDetailContent', () => {
  it('renders name, badges and stats', () => {
    render(<WeaponDetailContent weapon={weapon} />);
    expect(screen.getByRole('heading', { name: 'Terra Blade', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('NEUTRAL')).toBeInTheDocument();
    expect(screen.getByText('LEGENDARY')).toBeInTheDocument();
    expect(screen.getAllByText('MELEE')).toHaveLength(2);
    expect(screen.getByText('Estatísticas')).toBeInTheDocument();
  });

  it('renders description, abilities and footer metadata', () => {
    render(<WeaponDetailContent weapon={weapon} />);
    expect(screen.getByText('desc')).toBeInTheDocument();
    expect(screen.getByText('Habilidades')).toBeInTheDocument();
    expect(
      screen.getByText('Investida em linha reta ao acertar um crítico.')
    ).toBeInTheDocument();
    expect(screen.getByText('100 moedas')).toBeInTheDocument();
    expect(screen.getByText('Adicionado em')).toBeInTheDocument();
  });

  it('omits the abilities section when the weapon has none', () => {
    render(<WeaponDetailContent weapon={{ ...weapon, abilities: '' }} />);
    expect(screen.queryByText('Habilidades')).not.toBeInTheDocument();
  });

  it('renders the actions slot between the hero and the stats block', () => {
    render(<WeaponDetailContent weapon={weapon} actions={<button>Editar</button>} />);
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
  });

  it('renders the flavor quote only when present', () => {
    const { rerender } = render(<WeaponDetailContent weapon={weapon} />);
    expect(screen.queryByText(/Corta tudo/)).not.toBeInTheDocument();

    rerender(<WeaponDetailContent weapon={{ ...weapon, flavorText: 'Corta tudo.' }} />);
    expect(screen.getByText(/Corta tudo\./)).toBeInTheDocument();
  });
});
