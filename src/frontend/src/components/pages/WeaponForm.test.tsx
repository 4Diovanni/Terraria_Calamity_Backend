import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WeaponForm } from './WeaponForm';
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

describe('WeaponForm', () => {
  it('renders pre-filled fields when initialValues is provided', () => {
    render(
      <WeaponForm initialValues={validData} onSubmit={vi.fn()} onCancel={vi.fn()} submitLabel="Salvar" />
    );
    expect(screen.getByLabelText('Nome')).toHaveValue('Terra Blade');
    expect(screen.getByLabelText('Descrição')).toHaveValue('Uma lâmina lendária.');
  });

  it('shows validation errors and does not submit when required fields are empty', async () => {
    const onSubmit = vi.fn();
    render(<WeaponForm onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Salvar" />);

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe o nome da arma')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with the form data when valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <WeaponForm initialValues={validData} onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Salvar" />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(validData));
  });

  it('displays the error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue({ message: 'Ja existe uma submissao pendente' });
    render(
      <WeaponForm initialValues={validData} onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Salvar" />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Ja existe uma submissao pendente')).toBeInTheDocument();
  });

  it('calls onCancel when the cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(
      <WeaponForm initialValues={validData} onSubmit={vi.fn()} onCancel={onCancel} submitLabel="Salvar" />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onDataChange with the updated data whenever a field changes', () => {
    const onDataChange = vi.fn();
    render(
      <WeaponForm
        initialValues={validData}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        submitLabel="Salvar"
        onDataChange={onDataChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Terra Blade+' } });

    expect(onDataChange).toHaveBeenCalledWith({ ...validData, name: 'Terra Blade+' });
  });
});
