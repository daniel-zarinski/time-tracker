import { useEffect, useState } from 'react';
import {
  BorderTrail,
  Card,
  CardContent,
  EASE_CUBIC,
  TransitionPanel,
} from '@time-tracker/ui';
import { cn } from '@time-tracker/utils';
import type { JiraIssueWithParent } from '@time-tracker/database';
import { useTimeEntriesByIssue } from '@time-tracker/hooks';
import { motion } from 'motion/react';
import useMeasure from 'react-use-measure';
import { JiraIssueCardHeader } from './jira-issue-card-header';
import { JiraIssueCardFooter } from './jira-issue-card-footer';
import { JiraIssueTimeEntriesTable } from './jira-issue-time-entries-table';

export interface JiraIssueCardProps {
  issue: JiraIssueWithParent;
  onOpenInJira?: (issueKey: string) => void | Promise<void>;
  onTrackTime?: (issueKey: string) => void | Promise<unknown>;
  isActive?: boolean;
  activeEntryId?: string;
  onStopTime?: (entryId: string) => void | Promise<void>;
  showTrail?: boolean;
  defaultExpanded?: boolean;
  collapsible?: boolean;
  headerAction?: React.ReactNode;
}

const panelTransition = {
  x: { duration: 0.3, ease: EASE_CUBIC },
  opacity: { duration: 0.2, ease: EASE_CUBIC },
};

const panelVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 64 : -64,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 64 : -64,
    opacity: 0,
    position: 'absolute' as const,
    top: 0,
    width: '100%',
  }),
};

export function JiraIssueCard({
  issue,
  defaultExpanded,
  onOpenInJira,
  onTrackTime,
  isActive,
  activeEntryId,
  onStopTime,
  showTrail,
  collapsible = true,
  headerAction,
}: JiraIssueCardProps) {
  const [expanded, setExpanded] = useState(
    defaultExpanded ?? isActive ?? false
  );
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (isActive) setExpanded(true);
  }, [isActive]);
  const [measureRef, bounds] = useMeasure();
  const issueKey = issue.key ?? '';
  const isClickable = collapsible;
  const isExpanded = !collapsible || expanded;
  const { data: timeEntries } = useTimeEntriesByIssue(issueKey, {
    enabled: isExpanded,
  });

  const parentIssueType = issue.parent?.issueType ?? '';
  const parentLabel =
    parentIssueType === 'Epic'
      ? 'Epic'
      : parentIssueType === 'Story'
      ? 'Story'
      : 'Parent';

  function handleToggle() {
    if (!collapsible) return;
    setDirection(expanded ? -1 : 1);
    setExpanded((e) => !e);
  }

  const parentInfo = (
    <div className="flex flex-col gap-1 items-start mb-4 min-w-0 w-full overflow-hidden">
      <div className="flex items-center gap-1.5 min-w-0 w-full">
        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium shrink-0">
          Parent {parentLabel}
        </span>
        <span className="text-xs text-muted-foreground/80 truncate">
          {issue.epicKey ?? issue.parent?.key ?? '—'}
        </span>
      </div>
      {issue.parent?.summary && (
        <span className="text-xs text-muted-foreground/80 truncate w-full min-w-0 block">
          {issue.parent.summary}
        </span>
      )}
    </div>
  );

  const timeEntriesSection =
    timeEntries && timeEntries.length > 0 ? (
      <div className="mb-2" onClick={(e) => e.stopPropagation()}>
        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium block mb-1.5">
          Time entries
        </span>
        <JiraIssueTimeEntriesTable entries={timeEntries} />
      </div>
    ) : timeEntries && timeEntries.length === 0 ? (
      <div
        className="mb-2 text-xs text-muted-foreground/70"
        onClick={(e) => e.stopPropagation()}
      >
        No time entries
      </div>
    ) : null;

  const expandedContent = (
    <div ref={measureRef}>
      <CardContent className="px-3 pt-0 pb-0">
        {parentInfo}
        {timeEntriesSection}
      </CardContent>
      <JiraIssueCardFooter
        issueKey={issueKey}
        onOpenInJira={onOpenInJira}
        onTrackTime={onTrackTime}
        isActive={isActive}
        activeEntryId={activeEntryId}
        onStopTime={onStopTime}
      />
    </div>
  );

  return (
    <Card
      className={cn(
        'relative transition-all duration-200 border rounded-(--radius) shadow-none overflow-hidden',
        'border-border bg-card/30 hover:bg-card/40 hover:border-primary/20',
        'py-0 gap-0',
        isExpanded && 'border-primary/25 bg-card/45',
        isClickable && 'cursor-pointer'
      )}
      onClick={isClickable ? handleToggle : undefined}
    >
      {showTrail && <BorderTrail size={80} variant="red" />}
      <JiraIssueCardHeader
        issue={issue}
        headerAction={isClickable && !expanded ? headerAction : undefined}
      />
      {collapsible ? (
        <motion.div
          initial={false}
          animate={{ height: bounds.height > 0 ? bounds.height : 0 }}
          transition={{
            height: { type: 'spring', stiffness: 300, damping: 30 },
          }}
          className="relative overflow-hidden"
        >
          <TransitionPanel
            activeIndex={expanded ? 1 : 0}
            variants={panelVariants}
            transition={panelTransition}
            custom={direction}
          >
            <div ref={measureRef} />
            {expandedContent}
          </TransitionPanel>
        </motion.div>
      ) : (
        expandedContent
      )}
    </Card>
  );
}
