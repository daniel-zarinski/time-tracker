import { useState } from 'react';
import {
  AnimatedBackground,
  AnimatedGroup,
  Button,
  ScrollArea,
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  Tabs,
  TabsContent,
} from '@time-tracker/ui';
import {
  useActiveTimeEntry,
  useJiraSyncMutations,
  useTimeEntryMutations,
} from '@time-tracker/hooks';
import { Settings, AlertCircle, Inbox } from 'lucide-react';
import { useAppStore } from '../store';
import { JiraIssueCard } from '../components/cards/jira-issue-card';
import { TimeEntryCardActive } from '../components/cards/time-entry-card-active';
import { toTabValue } from './jira-issues-utils';
import { useJiraIssuesData } from './use-jira-issues-data';

export function JiraIssuesTab() {
  const [activeStatus, setActiveStatus] = useState('');
  const setActiveTab = useAppStore.use.setActiveTab();
  const activeEntryQuery = useActiveTimeEntry();
  const { syncMyIssues } = useJiraSyncMutations();
  const { startTracking, stopTracking } = useTimeEntryMutations();

  const activeEntry = activeEntryQuery.data ?? null;

  const {
    issues,
    groupedByStatus,
    statuses,
    isLoading,
    isError,
    isConfigError,
    error,
    isRefetching,
    refetch,
  } = useJiraIssuesData();

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

  if (isError) {
    return (
      <Empty className="w-full max-w-md mx-auto">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle />
          </EmptyMedia>
          <EmptyTitle>Failed to fetch Jira issues</EmptyTitle>
          <EmptyDescription>
            {(error as { message?: string })?.message ?? 'Something went wrong'}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            Retry
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (isLoading) {
    return (
      <Empty className="w-full max-w-md mx-auto">
        <EmptyHeader>
          <EmptyTitle>Loading Jira issues…</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  const validValues = new Set(statuses.map(toTabValue));
  const effectiveTab =
    activeStatus && validValues.has(activeStatus)
      ? activeStatus
      : toTabValue(statuses[0]);

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
    <Tabs
      value={effectiveTab}
      onValueChange={setActiveStatus}
      className="flex flex-col"
    >
      <div className="sticky top-0 z-30 bg-background">
        {activeEntry && (
          <div className="px-4 py-2 max-w-2xl mx-auto w-full">
            <TimeEntryCardActive
              entry={activeEntry}
              onStopTimer={stopTracking.mutateAsync}
            />
          </div>
        )}
        <ScrollArea
          className="w-full max-w-2xl mx-auto px-4 pb-2"
          orientation="horizontal"
        >
          <div className="flex min-w-max">
            <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-2 text-muted-foreground">
              <AnimatedBackground
                defaultValue={effectiveTab}
                onValueChange={(id) => {
                  if (id) setActiveStatus(id);
                }}
                className="rounded-md bg-background shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
              >
                {statuses.map((status) => (
                  <button
                    key={status}
                    data-id={toTabValue(status)}
                    type="button"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[checked=true]:text-foreground"
                  >
                    {status}
                  </button>
                ))}
              </AnimatedBackground>
            </div>
          </div>
        </ScrollArea>
      </div>
      {statuses.map((status) => (
        <TabsContent key={status} value={toTabValue(status)} className="px-4">
          <AnimatedGroup
            as="ul"
            asChild="li"
            preset="slide"
            className="flex flex-col gap-2 w-full max-w-2xl mx-auto"
          >
            {groupedByStatus[status].map((issue) => (
              <JiraIssueCard
                key={issue.id}
                issue={issue}
                onOpenInJira={(key) => window.electron.openJiraExternal(key)}
                onTrackTime={async (key) => {
                  await startTracking.mutateAsync(key);
                  setActiveTab('home');
                }}
              />
            ))}
          </AnimatedGroup>
        </TabsContent>
      ))}
    </Tabs>
  );
}
