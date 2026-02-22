import { type ReactNode } from 'react';
import { useSystemTheme } from '../hooks/use-system-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  useSystemTheme();

  return children;
}
