import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Drawer } from './Drawer';

describe('Drawer', () => {
  it('renders the title and children when open', () => {
    render(
      <Drawer open onOpenChange={() => {}} title="Menu">
        <p>Conteúdo</p>
      </Drawer>
    );
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    render(
      <Drawer open={false} onOpenChange={() => {}} title="Menu">
        <p>Conteúdo</p>
      </Drawer>
    );
    expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument();
  });

  it('calls onOpenChange(false) when Escape is pressed', () => {
    const onOpenChange = vi.fn();
    render(
      <Drawer open onOpenChange={onOpenChange} title="Menu">
        <p>Conteúdo</p>
      </Drawer>
    );
    fireEvent.keyDown(screen.getByText('Conteúdo'), { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) when the close button is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <Drawer open onOpenChange={onOpenChange} title="Menu">
        <p>Conteúdo</p>
      </Drawer>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('allows the panel to scroll when content overflows, for both side variants', () => {
    const { rerender } = render(
      <Drawer open onOpenChange={() => {}} title="Menu" side="right">
        <p>Conteúdo</p>
      </Drawer>
    );
    expect(screen.getByRole('dialog')).toHaveClass('overflow-y-auto');

    rerender(
      <Drawer open onOpenChange={() => {}} title="Menu" side="bottom">
        <p>Conteúdo</p>
      </Drawer>
    );
    expect(screen.getByRole('dialog')).toHaveClass('overflow-y-auto');
  });
});
