import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PageSidebar } from './PageSidebar';

const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  // jsdom does not have IntersectionObserver; use a regular function so it can be called with `new`
  window.IntersectionObserver = vi.fn(function () {
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: vi.fn(),
    };
  }) as unknown as typeof IntersectionObserver;
});

const SECTIONS = [
  { id: 'hero',     label: 'Inicio' },
  { id: 'armas',    label: 'Armas' },
  { id: 'inimigos', label: 'Inimigos' },
];

describe('PageSidebar', () => {
  it('renders a button for each section', () => {
    render(<PageSidebar sections={SECTIONS} />);

    expect(screen.getByRole('button', { name: /inicio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /armas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /inimigos/i })).toBeInTheDocument();
  });

  it('calls scrollIntoView on the target element when a button is clicked', () => {
    const mockScrollIntoView = vi.fn();
    const mockEl = { scrollIntoView: mockScrollIntoView } as unknown as HTMLElement;

    vi.spyOn(document, 'getElementById').mockImplementation((id) =>
      id === 'armas' ? mockEl : null
    );

    render(<PageSidebar sections={SECTIONS} />);
    fireEvent.click(screen.getByRole('button', { name: /armas/i }));

    expect(mockScrollIntoView).toHaveBeenCalledOnce();
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
});
