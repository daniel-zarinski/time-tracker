import {
  CalendarDays,
  Home,
  ListTodo,
  RefreshCw,
  Settings,
} from 'lucide-react';

import type { CommandPaletteGroup } from '@time-tracker/ui';
import { useJiraMyIssues } from '@time-tracker/hooks';

import { useAppStore } from './store';

const JIRA_ISSUES_LIMIT = 5;

export function useAppCommands(): {
  commands: CommandPaletteGroup[];
  isLoading: boolean;
} {
  const setActiveTab = useAppStore.use.setActiveTab();
  const setSelectedIssueKey = useAppStore.use.setSelectedIssueKey();

  const getIssuesQuery = useJiraMyIssues();

  const issues = (getIssuesQuery.data ?? []).filter(
    (i): i is typeof i & { key: string } => i.key != null
  );
  const isLoading = getIssuesQuery.isLoading || getIssuesQuery.isFetching;

  const commands: CommandPaletteGroup[] = [
    {
      heading: 'Navigation',
      items: [
        {
          id: 'home',
          label: 'Home',
          icon: Home,
          shortcutKey: '1',
          onSelect: () => setActiveTab('home'),
        },
        {
          id: 'tasks',
          label: 'Tasks',
          icon: ListTodo,
          shortcutKey: '2',
          onSelect: () => setActiveTab('tasks'),
        },
        {
          id: 'timeline',
          label: 'Timeline',
          icon: CalendarDays,
          shortcutKey: '3',
          onSelect: () => setActiveTab('timeline'),
        },
        {
          id: 'jira',
          label: 'Jira Issues',
          icon: ListTodo,
          shortcutKey: '4',
          onSelect: () => setActiveTab('jira-issues'),
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          shortcutKey: '5',
          onSelect: () => setActiveTab('settings'),
        },
      ],
    },
    {
      heading: 'Sync Shortcuts',
      items: [
        {
          id: 'sync-my-issues',
          label: 'Sync my issues',
          icon: RefreshCw,
          onSelect: () => window.jira.syncMyIssues(),
        },
        {
          id: 'sync-statuses',
          label: 'Sync statuses',
          icon: RefreshCw,
          onSelect: () => window.jira.fetchStatuses(),
        },
      ],
    },
    {
      heading: 'Jira Issues',
      maxItems: JIRA_ISSUES_LIMIT,
      items: issues.map((issue) => ({
        id: issue.key,
        label: `${issue.key} ${issue.summary}`,
        keywords: [issue.key],
        onSelect: () => setSelectedIssueKey(issue.key),
      })),
    },
  ];

  return { commands, isLoading };
}
