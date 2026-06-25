import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

describe('Header', () => {
  it('opens the mobile nav drawer when the menu button is clicked', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the drawer after a nav link is clicked', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByText('Armas'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
