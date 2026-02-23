import { StateCreator } from 'zustand';

import type { JiraIssueWithParent } from '@time-tracker/database';

export type TabValue = 'home' | 'jira-issues' | 'settings';

export interface UiSlice {
  activeTab: TabValue;
  setActiveTab: (tab: TabValue) => void;
  selectedIssue: JiraIssueWithParent | null;
  setSelectedIssue: (issue: JiraIssueWithParent | null) => void;
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
});
