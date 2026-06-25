export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'calamity-theme';

const getStoredTheme = (): Theme | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'dark' || stored === 'light' ? stored : null;
};

const getPreferredTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

export const getInitialTheme = (): Theme => getStoredTheme() ?? getPreferredTheme();

export const applyTheme = (theme: Theme): void => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.toggle('light', theme === 'light');
  localStorage.setItem(STORAGE_KEY, theme);
};
