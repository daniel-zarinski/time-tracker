import { useCallback, useEffect, useState } from 'react';

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

type ThemeValue = 'light' | 'dark';

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark);
}

function getSystemIsDark() {
  return window.matchMedia(DARK_MEDIA_QUERY).matches;
}

export interface ThemeConfig {
  theme: ThemeValue;
  setTheme: (value: ThemeValue) => void;
  isLoading: boolean;
}

export function useThemeConfig(): ThemeConfig {
  const [savedTheme, setSavedTheme] = useState<ThemeValue | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    window.store
      .getAppTheme()
      .then((theme) => {
        if (!cancelled) {
          setSavedTheme(theme ?? undefined);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (savedTheme !== undefined) {
      applyTheme(savedTheme === 'dark');
      return;
    }

    if (isLoading) {
      applyTheme(getSystemIsDark());
      return;
    }

    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
    applyTheme(mediaQuery.matches);

    function onChange(e: MediaQueryListEvent) {
      applyTheme(e.matches);
    }

    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, [savedTheme, isLoading]);

  const setTheme = useCallback((value: ThemeValue) => {
    setSavedTheme(value);
    applyTheme(value === 'dark');
    window.store.setAppTheme(value);
  }, []);

  const effectiveTheme: ThemeValue =
    savedTheme ?? (getSystemIsDark() ? 'dark' : 'light');

  return {
    theme: effectiveTheme,
    setTheme,
    isLoading,
  };
}
