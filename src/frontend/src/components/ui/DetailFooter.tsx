import { type ReactNode } from 'react';

interface FooterItem {
  label: string;
  value: ReactNode;
}

interface DetailFooterProps {
  items: FooterItem[];
  /** Frase de sabor (flavor text). Só é renderizada quando presente. */
  quote?: string;
}

/**
 * Rodapé de uma entrada de codex: faixa de metadados + citação de flavor.
 * Assinatura visual: borda esquerda dourada (consistente com ProfilePage).
 */
export const DetailFooter = ({ items, quote }: DetailFooterProps) => (
  <footer className="border-l-2 border-calamity-accent-gold pl-6 py-2 space-y-6">
    <dl className="flex flex-wrap gap-x-10 gap-y-4">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-xs font-display uppercase tracking-widest text-calamity-text-tertiary mb-1">
            {label}
          </dt>
          <dd className="text-lg font-display text-calamity-text-primary">{value}</dd>
        </div>
      ))}
    </dl>

    {quote && (
      <blockquote className="text-calamity-text-secondary font-body italic text-lg">
        &ldquo;{quote}&rdquo;
      </blockquote>
    )}
  </footer>
);
