import { StateCreator } from 'zustand';

import type { TimeEntryWithIssue } from '@time-tracker/database';
import { TabValue } from '@time-tracker/schema';

export type { TabValue } from '@time-tracker/schema';

export type SelectedTimeEntryView = 'expanded' | 'edit';

export interface UiSlice {
  activeTab: TabValue;
  setActiveTab: (tab: TabValue) => void;
  selectedIssueKey: string | null;
  setSelectedIssueKey: (key: string | null) => void;
  selectedTimeEntry: TimeEntryWithIssue | null;
  selectedTimeEntryView: SelectedTimeEntryView;
  setSelectedTimeEntry: (
    entry: TimeEntryWithIssue | null,
    options?: { view?: SelectedTimeEntryView }
  ) => void;
}

export const createUiSlice: StateCreator<
  UiSlice,
  [['zustand/devtools', never]],
  [],
  UiSlice
> = (set) => ({
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }, false, 'ui/setActiveTab'),
  selectedIssueKey: null,
  setSelectedIssueKey: (key) =>
    set({ selectedIssueKey: key }, false, 'ui/setSelectedIssueKey'),
  selectedTimeEntry: null,
  selectedTimeEntryView: 'expanded' as SelectedTimeEntryView,
  setSelectedTimeEntry: (entry, options) =>
    set(
      {
        selectedTimeEntry: entry,
        selectedTimeEntryView:
          entry != null ? options?.view ?? 'expanded' : 'expanded',
      },
      false,
      'ui/setSelectedTimeEntry'
    ),
});
