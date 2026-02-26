import {
  Button,
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@time-tracker/ui';
import {
  useActiveTimeEntry,
  useJiraRelevantIssues,
  useTimeEntryMutations,
} from '@time-tracker/hooks';
import { Inbox, PlayIcon } from 'lucide-react';
import { JiraIssueCard } from '../components/cards/jira-issue-card';
import { TimeEntryCardActive } from '../components/cards/time-entry-card-active';

export function HomeTab() {
  const activeEntryQuery = useActiveTimeEntry();
  const jiraIssuesQuery = useJiraRelevantIssues();
  const { startTracking, stopTracking } = useTimeEntryMutations();

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
