import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getInitialTheme, applyTheme } from './theme';

describe('theme persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark', 'light');
  });

  it('returns the stored theme when one exists', () => {
    localStorage.setItem('calamity-theme', 'light');
    expect(getInitialTheme()).toBe('light');
  });

  it('falls back to the system preference when nothing is stored', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
    } as MediaQueryList);
    expect(getInitialTheme()).toBe('light');
  });

  it('defaults to dark when there is no stored value and no light preference', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
    } as MediaQueryList);
    expect(getInitialTheme()).toBe('dark');
  });

  it('applyTheme persists the choice and toggles the html classes', () => {
    applyTheme('light');
    expect(localStorage.getItem('calamity-theme')).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    applyTheme('dark');
    expect(localStorage.getItem('calamity-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });
});
