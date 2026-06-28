import * as Switch from '@radix-ui/react-switch';
import { useEffect, useState } from 'react';
import { applyTheme, getInitialTheme, Theme } from '../../lib/theme';

const SunIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="3" />
    <line x1="8" y1="1" x2="8" y2="3" />
    <line x1="8" y1="13" x2="8" y2="15" />
    <line x1="1" y1="8" x2="3" y2="8" />
    <line x1="13" y1="8" x2="15" y2="8" />
    <line x1="2.9" y1="2.9" x2="4.3" y2="4.3" />
    <line x1="11.7" y1="11.7" x2="13.1" y2="13.1" />
    <line x1="11.7" y1="4.3" x2="13.1" y2="2.9" />
    <line x1="2.9" y1="13.1" x2="4.3" y2="11.7" />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12.3 10.9A6 6 0 0 1 6.1 4.7a6 6 0 0 1 .5-2.3A6.5 6.5 0 1 0 14 10.4a6 6 0 0 1-1.7.5z" />
  </svg>
);

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-calamity-text-tertiary">
        <MoonIcon />
      </span>
      <Switch.Root
        checked={theme === 'light'}
        onCheckedChange={(checked) => setTheme(checked ? 'light' : 'dark')}
        aria-label="Alternar entre modo claro e escuro"
        className="w-11 h-6 rounded-full bg-calamity-bg-tertiary border border-calamity-border relative data-[state=checked]:bg-calamity-accent-gold transition-colors"
      >
        <Switch.Thumb className="block w-4 h-4 rounded-full bg-calamity-text-primary translate-x-1 transition-transform data-[state=checked]:translate-x-6" />
      </Switch.Root>
      <span className="text-calamity-text-tertiary">
        <SunIcon />
      </span>
    </div>
  );
};
