import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';
import type { AccentColor } from '@time-tracker/utils';
import { useThemeConfig } from './use-theme-config';

export type ThemeValue = 'light' | 'dark';

export interface ThemeConfigContextValue {
  theme: ThemeValue;
  setTheme: (value: ThemeValue) => void;
  accentColor: AccentColor | undefined;
  setAccentColor: (color: AccentColor | undefined) => void;
  isLoading: boolean;
}

const ThemeConfigContext = createContext<ThemeConfigContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const config = useThemeConfig();

  const value = useMemo(
    () => ({
      theme: config.theme,
      setTheme: config.setTheme,
      accentColor: config.accentColor,
      setAccentColor: config.setAccentColor,
      isLoading: config.isLoading,
    }),
    [config.theme, config.setTheme, config.accentColor, config.setAccentColor, config.isLoading]
  );

  return (
    <ThemeConfigContext.Provider value={value}>
      {children}
    </ThemeConfigContext.Provider>
  );
}

export function useThemeConfigContext(): ThemeConfigContextValue {
  const ctx = useContext(ThemeConfigContext);
  if (!ctx) {
    throw new Error('useThemeConfigContext must be used within ThemeProvider');
  }
  return ctx;
}
