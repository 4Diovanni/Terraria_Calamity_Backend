import { useState, useEffect } from 'react';

const ArrowUp = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <line x1="8" y1="13" x2="8" y2="3" />
    <polyline points="3,8 8,3 13,8" />
  </svg>
);

export const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Voltar ao topo"
      className={[
        'fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40',
        'w-10 h-10 flex items-center justify-center',
        'bg-calamity-bg-secondary border border-calamity-border',
        'text-calamity-text-secondary hover:text-calamity-primary hover:border-calamity-primary',
        'transition-all duration-300',
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      ].join(' ')}
    >
      <ArrowUp />
    </button>
  );
};
