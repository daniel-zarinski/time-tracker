import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import { createSelectors } from './create-selectors';
import { createTimerSlice, TimerSlice, createUiSlice, UiSlice } from './slices';

export type AppStore = TimerSlice & UiSlice;

type PersistedState = Pick<AppStore, 'elapsed' | 'activeTab'>;

export const useAppStore = createSelectors(
  create<AppStore>()(
    devtools(
      persist(
        (...args) => ({
          ...createTimerSlice(...args),
          ...createUiSlice(...args),
        }),
        {
          name: 'app-store',
          version: 1,
          storage: createJSONStorage(() => localStorage),
          partialize: (state): PersistedState => ({
            elapsed: state.elapsed,
            activeTab: state.activeTab,
          }),
          migrate: (persisted: unknown, version: number): PersistedState => {
            if (version < 1) {
              return { elapsed: 0, activeTab: 'home' };
            }
            return persisted as PersistedState;
          },
        }
      ),
      { enabled: import.meta.env.DEV, name: 'AppStore' }
    )
  )
);
