import { useQuery } from '@tanstack/react-query';
import { Home, ListTodo, Settings } from 'lucide-react';

import type { CommandPaletteGroup } from '@time-tracker/ui';

import { useAppStore } from './store';

const JIRA_ISSUES_LIMIT = 5;

export function useAppCommands(): {
  commands: CommandPaletteGroup[];
  isLoading: boolean;
} {
  const setActiveTab = useAppStore.use.setActiveTab();

  const getIssuesQuery = useQuery({
    queryKey: ['jira', 'my-issues'],
    queryFn: () => window.jira.getJiraIssues(),
    retry: false,
  });

  const issues = getIssuesQuery.data ?? [];
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
          id: 'jira',
          label: 'Jira Issues',
          icon: ListTodo,
          shortcutKey: '2',
          onSelect: () => setActiveTab('jira-issues'),
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          shortcutKey: '3',
          onSelect: () => setActiveTab('settings'),
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
        onSelect: () => {
          setActiveTab('jira-issues');
          window.electron.openJiraExternal(issue.key);
        },
      })),
    },
  ];

  return { commands, isLoading };
}
