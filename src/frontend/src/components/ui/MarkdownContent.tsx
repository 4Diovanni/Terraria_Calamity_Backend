import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownContentProps {
  content?: string;
  emptyFallback?: string;
}

/**
 * Renderiza Markdown como um documento de codex, com estilo tokenizado (calamity-*).
 *
 * Segurança: `rehype-sanitize` remove HTML perigoso (script, handlers on*, etc.).
 * O conteúdo será editável por players no futuro, então a sanitização é obrigatória.
 */

// Mapa de elementos → versões estilizadas com tokens do tema.
const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-display font-bold text-calamity-accent-gold mt-8 mb-4 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-display font-bold text-calamity-accent-gold mt-8 mb-3 first:mt-0 border-b border-calamity-border pb-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-display font-bold text-calamity-text-primary mt-6 mb-2 first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-calamity-text-secondary font-body leading-relaxed text-lg mb-4">{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-calamity-primary hover:text-calamity-accent-gold underline transition-colors duration-300"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-6 mb-4 space-y-1 text-calamity-text-secondary font-body text-lg">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-6 mb-4 space-y-1 text-calamity-text-secondary font-body text-lg">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-calamity-accent-gold pl-4 italic text-calamity-text-secondary my-4">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-calamity-text-primary">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="border-calamity-border my-6" />,
  code: ({ children }) => (
    <code className="bg-calamity-bg-tertiary text-calamity-accent-cyan font-mono text-sm px-1.5 py-0.5 rounded">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-calamity-bg-tertiary border border-calamity-border rounded-lg p-4 overflow-x-auto mb-4 [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-calamity-text-primary">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full border-collapse text-calamity-text-secondary font-body">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-calamity-border px-3 py-2 text-left font-display text-calamity-text-primary">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-calamity-border px-3 py-2">{children}</td>
  ),
};

export const MarkdownContent = ({
  content,
  emptyFallback = 'Sem descrição detalhada ainda.',
}: MarkdownContentProps) => {
  if (!content || content.trim() === '') {
    return <p className="text-calamity-text-tertiary font-body italic">{emptyFallback}</p>;
  }

  return (
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
