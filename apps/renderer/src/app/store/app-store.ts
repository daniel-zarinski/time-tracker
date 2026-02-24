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
          version: 2,
          storage: createJSONStorage(() => localStorage),
          partialize: (state): PersistedState => ({
            elapsed: state.elapsed,
            activeTab: state.activeTab,
          }),
          migrate: (persisted: unknown, version: number): PersistedState => {
            if (version < 1) {
              return { elapsed: 0, activeTab: 'tasks' };
            }
            const state = persisted as PersistedState;
            // @ts-expect-error - TODO: Migrations...
            if (version < 2 && state.activeTab === 'home') {
              return { ...state, activeTab: 'tasks' };
            }
            return state;
          },
        }
      ),
      { enabled: import.meta.env.DEV, name: 'AppStore' }
    )
  )
);
