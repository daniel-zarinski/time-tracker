import { useCallback, useEffect, useState } from 'react';
import type { AccentColor } from '@time-tracker/utils';

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

type ThemeValue = 'light' | 'dark';

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark);
}

function applyAccent(color: AccentColor | undefined) {
  if (color) {
    document.documentElement.setAttribute('data-accent', color);
  } else {
    document.documentElement.removeAttribute('data-accent');
  }
}

function getSystemIsDark() {
  return window.matchMedia(DARK_MEDIA_QUERY).matches;
}

export interface ThemeConfig {
  theme: ThemeValue;
  setTheme: (value: ThemeValue) => void;
  accentColor: AccentColor | undefined;
  setAccentColor: (color: AccentColor | undefined) => void;
  isLoading: boolean;
}

export function useThemeConfig(): ThemeConfig {
  const [savedTheme, setSavedTheme] = useState<ThemeValue | undefined>(
    undefined
  );
  const [accentColor, setAccentColorState] = useState<AccentColor | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      window.store.getAppTheme(),
      window.store.getAccentColor(),
    ])
      .then(([theme, accent]) => {
        if (!cancelled) {
          setSavedTheme(theme ?? undefined);
          setAccentColorState(accent ?? undefined);
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

  useEffect(() => {
    applyAccent(accentColor);
  }, [accentColor]);

  const setTheme = useCallback((value: ThemeValue) => {
    setSavedTheme(value);
    applyTheme(value === 'dark');
    window.store.setAppTheme(value);
  }, []);

  const setAccentColor = useCallback((color: AccentColor | undefined) => {
    setAccentColorState(color);
    applyAccent(color);
    window.store.setAccentColor(color);
  }, []);

  const effectiveTheme: ThemeValue =
    savedTheme ?? (getSystemIsDark() ? 'dark' : 'light');

  return {
    theme: effectiveTheme,
    setTheme,
    accentColor,
    setAccentColor,
    isLoading,
  };
}
