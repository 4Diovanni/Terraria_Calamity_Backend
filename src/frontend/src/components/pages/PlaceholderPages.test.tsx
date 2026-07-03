import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ItemsPage } from './ItemsPage';
import { NPCsPage } from './NPCsPage';

describe('placeholder pages', () => {
  it.each([
    ['ItemsPage', ItemsPage, 'Itens'],
    ['NPCsPage', NPCsPage, 'NPCs'],
  ])('%s renders its heading inside a padded, responsive container', (_name, Page, heading) => {
    render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    );
    const headingEl = screen.getByRole('heading', { name: heading });
    expect(headingEl).toBeInTheDocument();
    expect(headingEl.closest('div')?.className).toMatch(/px-4/);
  });
});
