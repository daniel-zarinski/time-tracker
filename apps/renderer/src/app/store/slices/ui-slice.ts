import { StateCreator } from 'zustand';

import type {
  JiraIssueWithParent,
  TimeEntryWithIssue,
} from '@time-tracker/database';

import type { TabValue } from '@time-tracker/schema';

export type SelectedTimeEntryView = 'expanded' | 'edit';

export interface UiSlice {
  activeTab: TabValue;
  setActiveTab: (tab: TabValue) => void;
  selectedIssue: JiraIssueWithParent | null;
  setSelectedIssue: (issue: JiraIssueWithParent | null) => void;
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
  selectedIssue: null,
  setSelectedIssue: (issue) =>
    set({ selectedIssue: issue }, false, 'ui/setSelectedIssue'),
  selectedTimeEntry: null,
  selectedTimeEntryView: 'expanded' as SelectedTimeEntryView,
  setSelectedTimeEntry: (entry, options) =>
    set(
      {
        selectedTimeEntry: entry,
        selectedTimeEntryView:
          entry != null ? (options?.view ?? 'expanded') : 'expanded',
      },
      false,
      'ui/setSelectedTimeEntry'
    ),
});
