import * as Switch from '@radix-ui/react-switch';
import { useEffect, useState } from 'react';
import { applyTheme, getInitialTheme, Theme } from '../../lib/theme';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true">🌙</span>
      <Switch.Root
        checked={theme === 'light'}
        onCheckedChange={(checked) => setTheme(checked ? 'light' : 'dark')}
        aria-label="Alternar entre modo claro e escuro"
        className="w-11 h-6 rounded-full bg-calamity-bg-tertiary border border-calamity-border relative data-[state=checked]:bg-calamity-accent-gold transition-colors"
      >
        <Switch.Thumb className="block w-4 h-4 rounded-full bg-calamity-text-primary translate-x-1 transition-transform data-[state=checked]:translate-x-6" />
      </Switch.Root>
      <span aria-hidden="true">☀️</span>
    </div>
  );
};
