import { type ReactNode } from 'react';
import { useSystemTheme } from './use-system-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  useSystemTheme();

  return children;
}
