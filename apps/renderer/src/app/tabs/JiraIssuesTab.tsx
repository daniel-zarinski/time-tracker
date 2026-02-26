import {
  Button,
  ScrollArea,
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@time-tracker/ui';
import {
  useJiraMyIssues,
  useJiraSyncMutations,
  useTimeEntryMutations,
} from '@time-tracker/hooks';
import type { JiraIssueWithParent } from '@time-tracker/database';
import { Settings, AlertCircle, Inbox } from 'lucide-react';
import { useAppStore } from '../store';
import { JiraIssueCard } from '../components/cards/jira-issue-card';

const OTHER_STATUSES = [
  'DEV COMPLETED',
  'Done',
  'Inactive',
  'Cancelled',
] as const;

const OTHER_STATUS_SET = new Set(OTHER_STATUSES);

const STATUS_ORDER = [
  'In Progress',
  'New',
  'Code Review',
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
  const getIssuesQuery = useJiraMyIssues();
  const { syncMyIssues } = useJiraSyncMutations();
  const { startTracking } = useTimeEntryMutations();

  const isConfigError =
    getIssuesQuery.isError &&
    (getIssuesQuery.error as { message?: string })?.message?.includes(
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

  if (getIssuesQuery.isError) {
    return (
      <Empty className="w-full max-w-md mx-auto">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle />
          </EmptyMedia>
          <EmptyTitle>Failed to fetch Jira issues</EmptyTitle>
          <EmptyDescription>
            {(getIssuesQuery.error as { message?: string })?.message ??
              'Something went wrong'}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            onClick={() => getIssuesQuery.refetch()}
            disabled={getIssuesQuery.isRefetching}
          >
            Retry
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (getIssuesQuery.isLoading || getIssuesQuery.isFetching) {
    return (
      <Empty className="w-full max-w-md mx-auto">
        <EmptyHeader>
          <EmptyTitle>Loading Jira issues…</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  const issues = getIssuesQuery.data ?? [];
  const groupedByStatus = issues.reduce<Record<string, JiraIssueWithParent[]>>(
    (acc, issue) => {
      const status = issue.status ?? 'Unknown';
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

        <EmptyContent>
          <Button
            variant="outline"
            onClick={() => syncMyIssues.mutate()}
            disabled={syncMyIssues.isPending}
          >
            Fetch issues
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Tabs defaultValue={toTabValue(statuses[0])} className="flex flex-col">
      <div className="sticky top-0 z-30 bg-background">
        <ScrollArea
          className="w-full max-w-2xl mx-auto px-4 pb-2"
          orientation="horizontal"
        >
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
      </div>
      {statuses.map((status) => (
        <TabsContent key={status} value={toTabValue(status)} className="px-4">
          <ul className="flex flex-col gap-2 w-full max-w-2xl mx-auto">
            {groupedByStatus[status].map((issue) => (
              <li key={issue.id}>
                <JiraIssueCard
                  issue={issue}
                  onOpenInJira={(key) => window.electron.openJiraExternal(key)}
                  onTrackTime={async (key) => {
                    await startTracking.mutateAsync(key);
                    setActiveTab('tasks');
                  }}
                />
              </li>
            ))}
          </ul>
        </TabsContent>
      ))}
    </Tabs>
  );
}
