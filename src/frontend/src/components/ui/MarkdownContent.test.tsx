import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownContent } from './MarkdownContent';

describe('MarkdownContent', () => {
  it('renders markdown headings and paragraphs', () => {
    render(<MarkdownContent content={'# Terra Blade\n\nUma lâmina lendária.'} />);
    expect(screen.getByRole('heading', { name: 'Terra Blade' })).toBeInTheDocument();
    expect(screen.getByText('Uma lâmina lendária.')).toBeInTheDocument();
  });

  it('renders GFM lists', () => {
    render(<MarkdownContent content={'- alfa\n- beta'} />);
    expect(screen.getByText('alfa')).toBeInTheDocument();
    expect(screen.getByText('beta')).toBeInTheDocument();
  });

  it('shows the fallback when content is empty', () => {
    render(<MarkdownContent content="" emptyFallback="Nada aqui." />);
    expect(screen.getByText('Nada aqui.')).toBeInTheDocument();
  });

  it('shows the fallback when content is undefined', () => {
    render(<MarkdownContent />);
    expect(screen.getByText('Sem descrição detalhada ainda.')).toBeInTheDocument();
  });

  it('sanitizes embedded <script> tags', () => {
    const { container } = render(
      <MarkdownContent content={'Texto seguro\n\n<script>window.__pwned = true;</script>'} />
    );
    expect(container.querySelector('script')).toBeNull();
    expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined();
  });

  it('strips javascript: protocol from links', () => {
    const { container } = render(
      // eslint-disable-next-line no-script-url
      <MarkdownContent content={'[clique](javascript:alert(1))'} />
    );
    const anchor = container.querySelector('a');
    // rehype-sanitize remove o href perigoso (não sobra protocolo javascript:)
    expect(anchor?.getAttribute('href') ?? '').not.toContain('javascript:');
  });
});
