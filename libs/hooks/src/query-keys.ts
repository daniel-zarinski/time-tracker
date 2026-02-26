export const queryKeys = {
  timeEntries: {
    all: ['time-entries'] as const,
    active: ['active-time-entry'] as const,
  },
  jira: {
    all: ['jira'] as const,
    myIssues: ['jira', 'my-issues'] as const,
    relevantIssues: ['jira', 'relevant-issues'] as const,
    issue: (key: string) => ['jira-issue', key] as const,
    config: ['jira', 'config'] as const,
  },
  tempo: {
    config: ['tempo', 'config'] as const,
  },
  database: {
    path: ['database', 'path'] as const,
  },
} as const;
