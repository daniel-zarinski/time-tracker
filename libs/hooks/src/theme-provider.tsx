import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';
import { useThemeConfig } from './use-theme-config';

export type ThemeValue = 'light' | 'dark';

export interface ThemeConfigContextValue {
  theme: ThemeValue;
  setTheme: (value: ThemeValue) => void;
  isLoading: boolean;
}

const ThemeConfigContext = createContext<ThemeConfigContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const config = useThemeConfig();

  const value = useMemo(
    () => ({
      theme: config.theme,
      setTheme: config.setTheme,
      isLoading: config.isLoading,
    }),
    [config.theme, config.setTheme, config.isLoading]
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
