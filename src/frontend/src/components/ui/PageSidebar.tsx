import { useState, useEffect } from 'react';

interface Section {
  id: string;
  label: string;
}

interface PageSidebarProps {
  sections: Section[];
}

export const PageSidebar = ({ sections }: PageSidebarProps) => {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <aside
      aria-label="Navegacao por secoes"
      className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-1.5"
    >
      {sections.map(({ id, label }) => {
        const isActive = id === activeId;
        return (
          <button
            key={id}
            type="button"
            onClick={() => scrollTo(id)}
            className={[
              'group flex items-center justify-end gap-2 py-1',
              'transition-all duration-200',
              isActive
                ? 'text-calamity-accent-gold'
                : 'text-calamity-text-tertiary hover:text-calamity-text-secondary',
            ].join(' ')}
          >
            <span
              className={[
                'text-xs font-display uppercase tracking-widest whitespace-nowrap',
                'transition-opacity duration-200',
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
              ].join(' ')}
            >
              {label}
            </span>
            <span
              className={[
                'block rounded-full flex-shrink-0 transition-all duration-200',
                isActive
                  ? 'w-2 h-2 bg-calamity-accent-gold'
                  : 'w-1.5 h-1.5 bg-current group-hover:w-2 group-hover:h-2',
              ].join(' ')}
            />
          </button>
        );
      })}
    </aside>
  );
};
