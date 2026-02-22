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

function toTabValue(status: string) {
  return status.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function JiraIssuesTab() {
  const setActiveTab = useAppStore.use.setActiveTab();

  const issuesQuery = useQuery({
    queryKey: ['jira', 'my-issues'],
    queryFn: () => window.electron.jira.fetchMyIssues(),
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
      if (!acc[status]) acc[status] = [];
      acc[status].push(issue);
      return acc;
    },
    {}
  );
  const statuses = Object.keys(groupedByStatus).sort();

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
            <ScrollArea className="h-[calc(100vh-8rem)]">
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
