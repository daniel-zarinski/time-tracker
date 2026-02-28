import { useEffect } from 'react';

export function useWindowFocus() {
  useEffect(() => {
    const update = () => {
      if (document.hasFocus()) {
        delete document.documentElement.dataset.windowBlurred;
      } else {
        document.documentElement.dataset.windowBlurred = 'true';
      }
    };

    update();
    window.addEventListener('focus', update);
    window.addEventListener('blur', update);

    return () => {
      window.removeEventListener('focus', update);
      window.removeEventListener('blur', update);
      delete document.documentElement.dataset.windowBlurred;
    };
  }, []);
}
