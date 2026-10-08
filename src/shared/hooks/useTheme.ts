import { useEffect, useSyncExternalStore } from 'react';
import type { ThemePreference } from '../types';

export type ResolvedTheme = 'light' | 'dark';

const LIGHT_QUERY = '(prefers-color-scheme: light)';

const systemTheme = (): ResolvedTheme =>
  globalThis.matchMedia?.(LIGHT_QUERY).matches ? 'light' : 'dark';

const THEME_CACHE_KEY = 'au-theme';

/**
 * Applies the last resolved theme before React mounts, so extension pages don't flash
 * the other theme while settings load from storage.
 */
export const applyCachedTheme = (): void => {
  let cached: string | null = null;
  try {
    cached = localStorage.getItem(THEME_CACHE_KEY);
  } catch {
    // Storage can be unavailable; fall back to the OS preference.
  }
  document.documentElement.dataset.theme =
    cached === 'light' || cached === 'dark' ? cached : systemTheme();
};

export const cacheTheme = (theme: ResolvedTheme): void => {
  try {
    localStorage.setItem(THEME_CACHE_KEY, theme);
  } catch {
    // Non-essential: only used to avoid a flash on the next open.
  }
};

const subscribeToSystemTheme = (onChange: () => void): (() => void) => {
  const media = globalThis.matchMedia?.(LIGHT_QUERY);
  if (!media) return () => undefined;
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

/**
 * Resolves the theme preference to `light` or `dark`, following OS changes live
 * when the preference is `system`.
 */
export const useResolvedTheme = (preference: ThemePreference | undefined): ResolvedTheme => {
  const system = useSyncExternalStore(subscribeToSystemTheme, systemTheme, () => 'dark' as const);
  return preference === 'light' || preference === 'dark' ? preference : system;
};

/**
 * Mirrors the resolved theme onto `<html data-theme>` for extension pages. While settings
 * are still loading (`undefined`) the theme applied by `applyCachedTheme` is kept.
 */
export const useDocumentTheme = (preference: ThemePreference | undefined): ResolvedTheme => {
  const theme = useResolvedTheme(preference);
  const loaded = preference !== undefined;

  useEffect(() => {
    if (!loaded) return;
    document.documentElement.dataset.theme = theme;
    cacheTheme(theme);
  }, [theme, loaded]);

  return theme;
};
