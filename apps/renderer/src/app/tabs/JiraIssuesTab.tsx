import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ScrollArea,
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  JiraIssueCard,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@time-tracker/ui';
import type { JiraIssue } from '@time-tracker/jira';
import { Settings, AlertCircle, Inbox } from 'lucide-react';
import { useAppStore } from '../store';

const OTHER_STATUSES = [
  'DEV COMPLETED',
  'Done',
  'Inactive',
  'Cancelled',
] as const;

const OTHER_STATUS_SET = new Set(OTHER_STATUSES);

const STATUS_ORDER = [
  'In Progress',
  'Code Review',
  'New',
  'To Do',
  'Other',
] as const;

function toTabValue(status: string) {
  return status
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function sortStatuses(statuses: string[]): string[] {
  const normalized = (s: string) => s.toLowerCase().trim();
  const orderMap = new Map(STATUS_ORDER.map((s, i) => [normalized(s), i]));
  return [...statuses].sort((a, b) => {
    const aNorm = normalized(a);
    const bNorm = normalized(b);
    const aIdx = orderMap.get(aNorm) ?? STATUS_ORDER.length;
    const bIdx = orderMap.get(bNorm) ?? STATUS_ORDER.length;
    if (aIdx !== bIdx) return aIdx - bIdx;
    return a.localeCompare(b);
  });
}

export function JiraIssuesTab() {
  const setActiveTab = useAppStore.use.setActiveTab();

  const issuesQuery = useQuery({
    queryKey: ['jira', 'my-issues'],
    queryFn: () => window.electron.jira.getJiraIssues(),
    retry: false,
  });

  const isConfigError =
    issuesQuery.isError &&
    (issuesQuery.error as { message?: string })?.message?.includes(
      'not configured'
    );

  if (isConfigError) {
    return (
      <Empty className="w-full max-w-md mx-auto">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Settings />
          </EmptyMedia>
          <EmptyTitle>Jira not configured</EmptyTitle>
          <EmptyDescription>
            Connect your Jira account in Settings to fetch Jira issues.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => setActiveTab('settings')} variant="default">
            Open Settings
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (issuesQuery.isError) {
    return (
      <Empty className="w-full max-w-md mx-auto">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle />
          </EmptyMedia>
          <EmptyTitle>Failed to fetch Jira issues</EmptyTitle>
          <EmptyDescription>
            {(issuesQuery.error as { message?: string })?.message ??
              'Something went wrong'}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            onClick={() => issuesQuery.refetch()}
            disabled={issuesQuery.isRefetching}
          >
            Retry
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (issuesQuery.isLoading || issuesQuery.isFetching) {
    return (
      <Empty className="w-full max-w-md mx-auto">
        <EmptyHeader>
          <EmptyTitle>Loading Jira issues…</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  const issues = issuesQuery.data ?? [];
  const groupedByStatus = issues.reduce<Record<string, JiraIssue[]>>(
    (acc, issue) => {
      const status = issue.status || 'Unknown';
      const displayStatus = OTHER_STATUS_SET.has(
        status as (typeof OTHER_STATUSES)[number]
      )
        ? 'Other'
        : status;
      if (!acc[displayStatus]) acc[displayStatus] = [];
      acc[displayStatus].push(issue);
      return acc;
    },
    {}
  );
  const statuses = sortStatuses(Object.keys(groupedByStatus));

  async function handleOpenInJira(issueKey: string) {
    const config = await window.electron.store.getJiraConfig();
    if (config?.domain) {
      const url = `https://${config.domain}.atlassian.net/browse/${issueKey}`;
      await window.electron.openExternal(url);
    }
  }

  if (issues.length === 0) {
    return (
      <Empty className="w-full max-w-md mx-auto">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox />
          </EmptyMedia>
          <EmptyTitle>No Jira issues</EmptyTitle>
          <EmptyDescription>No Jira issues assigned to you.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col gap-4">
      <Tabs defaultValue={toTabValue(statuses[0])}>
        <ScrollArea className="w-full pb-2" orientation="horizontal">
          <div className="flex min-w-max">
            <TabsList variant="line">
              {statuses.map((status) => (
                <TabsTrigger key={status} value={toTabValue(status)}>
                  {status}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </ScrollArea>
        {statuses.map((status) => (
          <TabsContent key={status} value={toTabValue(status)}>
            <ScrollArea className="h-[calc(100vh-10rem)]">
              <ul className="flex flex-col gap-2 pr-4">
                {groupedByStatus[status].map((issue) => (
                  <li key={issue.key}>
                    <JiraIssueCard
                      issue={issue}
                      onOpenInJira={handleOpenInJira}
                    />
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
