import { StateCreator } from 'zustand';

export type TabValue = 'home' | 'tasks' | 'settings';

export interface UiSlice {
  activeTab: TabValue;
  setActiveTab: (tab: TabValue) => void;
}

export const createUiSlice: StateCreator<
  UiSlice,
  [['zustand/devtools', never]],
  [],
  UiSlice
> = (set) => ({
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }, false, 'ui/setActiveTab'),
});
