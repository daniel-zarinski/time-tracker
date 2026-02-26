import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  JiraIssueCard,
  TimeEntryCardActive,
  toast,
} from '@time-tracker/ui';
import { Inbox, PlayIcon } from 'lucide-react';
import { JiraIssueKeyBadge } from '../components/jira-issue-key-badge';

const renderIssueKey = (key: string) => <JiraIssueKeyBadge issueKey={key} />;

export function HomeTab() {
  const activeEntryQuery = useQuery({
    queryKey: ['active-time-entry'],
    queryFn: () => window.database.getActiveTimeEntry(),
    retry: false,
  });

  const jiraIssuesQuery = useQuery({
    queryKey: ['jira', 'relevant-issues'],
    queryFn: () => window.database.getRelevantJiraIssues({ limit: 5 }),
    retry: false,
  });

  const startTracking = useMutation({
    mutationFn: (issueKey: string) =>
      window.timeTracking.startTracking(issueKey),
    onSuccess: () => {
      activeEntryQuery.refetch();
      toast.success('Time entry started');
    },
    onError: () => {
      toast.error('Failed to start time entry');
    },
  });

  const stopTracking = useMutation({
    mutationFn: (id: string) => window.timeTracking.stopTracking(id),
    onSuccess: () => {
      activeEntryQuery.refetch();
      toast.success('Time entry stopped');
    },
    onError: () => {
      toast.error('Failed to stop time entry');
    },
  });

  const activeEntry = activeEntryQuery.data ?? null;
  const issues = jiraIssuesQuery.data ?? [];

  if (activeEntryQuery.isLoading || jiraIssuesQuery.isLoading) {
    return (
      <Empty className="w-full max-w-md mx-auto">
        <EmptyHeader>
          <EmptyTitle>Loading…</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col">
      {activeEntry && (
        <div className="sticky top-0 z-30 border-b border-border bg-background px-4 py-2">
          <TimeEntryCardActive
            entry={activeEntry}
            onStopTimer={stopTracking.mutateAsync}
            renderIssueKey={renderIssueKey}
          />
        </div>
      )}

      <div className="p-4 flex flex-col gap-3">
        {issues.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {issues.map((issue) => (
              <li key={issue.id}>
                <JiraIssueCard
                  issue={issue}
                  onOpenInJira={window.electron.openJiraExternal}
                  onTrackTime={startTracking.mutateAsync}
                  renderIssueKey={renderIssueKey}
                  headerAction={
                    <Button
                      size="icon-sm"
                      variant="default"
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        startTracking.mutate(issue.key ?? '');
                      }}
                    >
                      <PlayIcon className="size-4" />
                    </Button>
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <Empty className="w-full max-w-md mx-auto">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyTitle>No Jira issues</EmptyTitle>
              <EmptyDescription>
                Fetch issues from the Jira Issues tab to get started.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  );
}
