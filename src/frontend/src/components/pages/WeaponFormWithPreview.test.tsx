import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeaponFormWithPreview } from './WeaponFormWithPreview';
import { WeaponFormData, WeaponTypeClass, Element } from '../../types/weapon';

const validData: WeaponFormData = {
  name: 'Terra Blade',
  weaponClass: WeaponTypeClass.MELEE,
  element: Element.NEUTRAL,
  baseDamage: 55,
  criticalChance: 10,
  attacksPerTurn: 2,
  range: 3,
  rarity: 16,
  price: 100,
  quality: 8,
  abilities: 'Corta em linha reta',
  description: 'Uma lâmina lendária.',
  imageUrl: '',
};

describe('WeaponFormWithPreview', () => {
  it('shows the form tab by default', () => {
    render(
      <WeaponFormWithPreview
        initialValues={validData}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        submitLabel="Salvar"
      />
    );
    expect(screen.getByLabelText('Nome')).toBeVisible();
  });

  it('switches to the preview tab and shows the current form values', () => {
    render(
      <WeaponFormWithPreview
        initialValues={validData}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        submitLabel="Salvar"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Pré-visualização' }));

    expect(screen.getByRole('heading', { name: 'Terra Blade', level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).not.toBeVisible();
  });

  it('reflects live edits in the preview without losing form state when switching tabs', () => {
    render(
      <WeaponFormWithPreview
        initialValues={validData}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        submitLabel="Salvar"
      />
    );

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Terra Blade+' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pré-visualização' }));

    expect(screen.getByRole('heading', { name: 'Terra Blade+', level: 1 })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Formulário' }));
    expect(screen.getByLabelText('Nome')).toHaveValue('Terra Blade+');
  });

  it('uses placeholder values in the preview when there is no previewBase (creation flow)', () => {
    render(<WeaponFormWithPreview onSubmit={vi.fn()} onCancel={vi.fn()} submitLabel="Enviar Proposta" />);

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Nova Arma' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pré-visualização' }));

    expect(screen.getByRole('heading', { name: 'Nova Arma', level: 1 })).toBeInTheDocument();
  });
});
