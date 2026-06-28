import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

export interface CarouselItem {
  id: string | number;
  title: string;
  subtitle?: string;
  description: string;
  accentColor?: string;
  meta?: React.ReactNode;
  href?: string;
  imageUrl?: string;
}

interface PortraitCardProps {
  item: CarouselItem;
  onClick?: () => void;
}

const PortraitCard = ({ item, onClick }: PortraitCardProps) => {
  const accent = item.accentColor ?? 'var(--color-primary)';
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      {...(onClick
        ? { type: 'button' as const, onClick }
        : {})}
      className={[
        'relative flex-shrink-0 w-40 h-60',
        'border border-calamity-border bg-calamity-bg-secondary overflow-hidden',
        'transition-all duration-300',
        onClick
          ? 'cursor-pointer hover:border-calamity-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calamity-primary'
          : '',
      ].join(' ')}
    >
      {/* Image or gradient fill */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${accent}28 0%, transparent 68%)`,
          }}
        />
      )}

      {/* Bottom vignette for text legibility */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24"
        style={{
          background: `linear-gradient(to top, ${accent}38 0%, transparent 100%)`,
        }}
      />

      {/* Left accent bar */}
      <div
        className="absolute top-0 left-0 bottom-0 w-0.5"
        style={{ background: accent }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-3">
        <div
          className="w-5 h-5 border"
          style={{
            borderColor: `${accent}55`,
            background: `${accent}18`,
          }}
        />
        <div className="space-y-0.5">
          {item.subtitle && (
            <p
              className="text-xs font-display uppercase tracking-widest leading-none"
              style={{ color: `${accent}90` }}
            >
              {item.subtitle}
            </p>
          )}
          <p
            className="text-sm font-bold font-display leading-tight"
            style={{ color: accent }}
          >
            {item.title}
          </p>
        </div>
      </div>
    </Tag>
  );
};

interface CarouselProps {
  items: CarouselItem[];
  onSelect?: (item: CarouselItem) => void;
}

export const Carousel = ({ items, onSelect }: CarouselProps) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent(i => (i + 1) % items.length), [items.length]);
  const prev = useCallback(() => setCurrent(i => (i - 1 + items.length) % items.length), [items.length]);

  useEffect(() => { setCurrent(0); }, [items]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [paused, next, items.length]);

  if (!items.length) return null;

  const item = items[current];
  const accent = item.accentColor ?? 'var(--color-primary)';

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <PortraitCard item={item} onClick={onSelect ? () => onSelect(item) : undefined} />

        {/* Description panel */}
        <div className="flex-1 flex flex-col justify-between py-1 min-h-[240px]">
          <div className="space-y-3">
            {item.subtitle && (
              <p className="text-xs font-display uppercase tracking-widest text-calamity-text-tertiary">
                {item.subtitle}
              </p>
            )}
            <h3
              className="text-2xl md:text-3xl font-bold font-display leading-tight"
              style={{ color: accent }}
            >
              {item.title}
            </h3>
            <p className="text-calamity-text-secondary font-body leading-relaxed text-base md:text-lg">
              {item.description}
            </p>
            {item.meta && (
              <div className="flex flex-wrap gap-2 pt-1">{item.meta}</div>
            )}
          </div>

          {item.href && (
            <Link
              to={item.href}
              className="self-start mt-4 text-xs font-display uppercase tracking-widest border-b pb-px transition-colors duration-300"
              style={{ color: accent, borderColor: `${accent}55` }}
            >
              Ver detalhes
            </Link>
          )}
        </div>
      </div>

      {/* Navigation bar */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-calamity-border">
        <button
          type="button"
          onClick={prev}
          aria-label="Item anterior"
          className="text-xs font-display uppercase tracking-widest text-calamity-text-secondary hover:text-calamity-text-primary border border-calamity-border px-4 py-2 transition-colors duration-300 hover:border-calamity-primary"
        >
          Anterior
        </button>
        <span className="text-xs font-display tracking-widest text-calamity-text-tertiary select-none">
          {current + 1} / {items.length}
        </span>
        <button
          type="button"
          onClick={next}
          aria-label="Proximo item"
          className="text-xs font-display uppercase tracking-widest text-calamity-text-secondary hover:text-calamity-text-primary border border-calamity-border px-4 py-2 transition-colors duration-300 hover:border-calamity-primary"
        >
          Proximo
        </button>
      </div>
    </div>
  );
};
