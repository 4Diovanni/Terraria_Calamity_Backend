import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface DetailLayoutProps {
  backTo: string;
  backLabel: string;
  /** Coluna lateral (imagem + identidade + stats). Sticky no desktop. */
  aside: ReactNode;
  /** Conteúdo principal (documento Markdown). */
  children: ReactNode;
  /** Rodapé de largura total, abaixo das colunas. */
  footer?: ReactNode;
  /** Lado do aside no desktop. 'right' é o espelho usado por Armadura. */
  asideSide?: 'left' | 'right';
}

/**
 * Scaffold de página de detalhe de codex.
 *
 * Mobile: empilha aside → main → footer.
 * Desktop (md+): aside (~1/3, sticky) e main (~2/3) lado a lado; `asideSide='right'`
 * inverte a ordem sem mexer no DOM (a imagem permanece no topo no mobile).
 */
export const DetailLayout = ({
  backTo,
  backLabel,
  aside,
  children,
  footer,
  asideSide = 'left',
}: DetailLayoutProps) => (
  <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
    <div className="container mx-auto px-4 py-8">
      <Link
        to={backTo}
        className="inline-flex items-center gap-2 text-calamity-primary hover:text-calamity-accent-gold transition-colors duration-300 font-display uppercase"
      >
        &larr; {backLabel}
      </Link>

      <div
        className={[
          'flex flex-col gap-8 mt-8 md:flex-row md:items-start',
          asideSide === 'right' ? 'md:flex-row-reverse' : '',
        ].join(' ')}
      >
        <aside className="md:w-1/3 md:flex-shrink-0 md:sticky md:top-8 md:self-start">
          {aside}
        </aside>
        <main className="md:flex-1 min-w-0">{children}</main>
      </div>

      {footer && <div className="mt-12 pt-8 border-t border-calamity-border">{footer}</div>}
    </div>
  </div>
);
