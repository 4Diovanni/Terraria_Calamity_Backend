import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DetailLayout } from './DetailLayout';

const renderLayout = (props: Partial<Parameters<typeof DetailLayout>[0]> = {}) =>
  render(
    <MemoryRouter>
      <DetailLayout
        backTo="/weapons"
        backLabel="Voltar para Armas"
        aside={<div>ASIDE</div>}
        footer={<div>FOOTER</div>}
        {...props}
      >
        <div>MAIN</div>
      </DetailLayout>
    </MemoryRouter>
  );

describe('DetailLayout', () => {
  it('renders the back link, aside, main and footer', () => {
    renderLayout();
    const back = screen.getByRole('link', { name: /Voltar para Armas/i });
    expect(back).toHaveAttribute('href', '/weapons');
    expect(screen.getByText('ASIDE')).toBeInTheDocument();
    expect(screen.getByText('MAIN')).toBeInTheDocument();
    expect(screen.getByText('FOOTER')).toBeInTheDocument();
  });

  it('lays the aside on the left by default', () => {
    const { container } = renderLayout();
    const row = container.querySelector('.md\\:flex-row') as HTMLElement;
    expect(row.className).not.toContain('md:flex-row-reverse');
  });

  it('mirrors the aside to the right when asideSide="right"', () => {
    const { container } = renderLayout({ asideSide: 'right' });
    const row = container.querySelector('.md\\:flex-row-reverse');
    expect(row).not.toBeNull();
  });

  it('omits the footer wrapper when no footer is given', () => {
    renderLayout({ footer: undefined });
    expect(screen.queryByText('FOOTER')).toBeNull();
  });
});
