import { useEffect } from 'react';

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

export function useSystemTheme() {
  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);

    function apply(isDark: boolean) {
      document.documentElement.classList.toggle('dark', isDark);
    }

    apply(mediaQuery.matches);

    function onChange(e: MediaQueryListEvent) {
      apply(e.matches);
    }

    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);
}
