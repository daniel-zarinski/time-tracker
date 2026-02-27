import { useState } from 'react';
import { motion } from 'motion/react';
import {
  AnimatedBackground,
  AnimatedGroup,
  Button,
  DEFAULT_TRANSITION,
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  TransitionPanel,
} from '@time-tracker/ui';
import {
  useActiveTimeEntry,
  useJiraSyncMutations,
  useTimeEntryMutations,
} from '@time-tracker/hooks';
import { Settings, AlertCircle, Inbox } from 'lucide-react';
import { useAppStore } from '../store';
import { JiraIssueCard } from '../components/cards/jira-issue-card';
import { SubHeader } from '../components/sub-header';
import { toTabValue } from './jira-issues-utils';
import { useJiraIssuesData } from './use-jira-issues-data';

export function JiraIssuesTab() {
  const [activeStatus, setActiveStatus] = useState('');
  const [direction, setDirection] = useState(1);
  const setActiveTab = useAppStore.use.setActiveTab();
  const { syncMyIssues } = useJiraSyncMutations();
  const { startTracking, stopTracking } = useTimeEntryMutations();
  const activeEntry = useActiveTimeEntry();

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

  const activeIssueKey = activeEntry.data?.issueKey;

  const validValues = new Set(statuses.map(toTabValue));
  const effectiveTab =
    activeStatus && validValues.has(activeStatus)
      ? activeStatus
      : statuses.length > 0
      ? toTabValue(statuses[0])
      : '';
  const activeIndex = Math.max(
    0,
    statuses.findIndex((s) => toTabValue(s) === effectiveTab)
  );

  return (
    <div className="flex flex-col pb-4">
      <SubHeader>
        {statuses.length > 0 && (
          <div className="w-full max-w-md mx-auto px-4 pb-2 flex justify-center">
            <motion.div
              layoutId="sub-header-pill"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-2 text-muted-foreground"
            >
              <AnimatedBackground
                defaultValue={effectiveTab}
                onValueChange={(id) => {
                  if (id) {
                    const newIndex = statuses.findIndex(
                      (s) => toTabValue(s) === id
                    );
                    if (newIndex >= 0) {
                      setDirection(newIndex > activeIndex ? -1 : 1);
                      setActiveStatus(id);
                    }
                  }
                }}
                className="rounded-md bg-background shadow-sm"
                transition={DEFAULT_TRANSITION}
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
            </motion.div>
          </div>
        )}
      </SubHeader>

      {isConfigError ? (
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
      ) : isError ? (
        <Empty className="w-full max-w-md mx-auto">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle />
            </EmptyMedia>
            <EmptyTitle>Failed to fetch Jira issues</EmptyTitle>
            <EmptyDescription>
              {(error as { message?: string })?.message ??
                'Something went wrong'}
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
      ) : isLoading && issues.length === 0 ? (
        <Empty className="w-full max-w-md mx-auto">
          <EmptyHeader>
            <EmptyTitle>Loading Jira issues…</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : issues.length === 0 ? (
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
      ) : (
        <TransitionPanel
          activeIndex={activeIndex}
          className="overflow-hidden"
          transition={{ duration: 0.2, ease: DEFAULT_TRANSITION.ease }}
          variants={{
            enter: { opacity: 0, x: direction * 80, filter: 'blur(4px)' },
            center: { opacity: 1, x: 0, filter: 'blur(0px)' },
            exit: { opacity: 0, x: direction * -80, filter: 'blur(4px)' },
          }}
        >
          {statuses.map((status) => (
            <div key={status} className="px-4 pt-2">
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
                    showTrail={issue.key === activeIssueKey}
                    onOpenInJira={(key) =>
                      window.electron.openJiraExternal(key)
                    }
                    onTrackTime={async (key) => {
                      await startTracking.mutateAsync(key);
                      setActiveTab('home');
                    }}
                    isActive={issue.key === activeIssueKey}
                    activeEntryId={activeEntry.data?.id}
                    onStopTime={(id) => stopTracking.mutate(id)}
                  />
                ))}
              </AnimatedGroup>
            </div>
          ))}
        </TransitionPanel>
      )}
    </div>
  );
}
