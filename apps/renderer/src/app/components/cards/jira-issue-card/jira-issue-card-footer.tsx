import { Button, CardFooter } from '@time-tracker/ui';
import { ExternalLinkIcon, PlayIcon, SquareIcon } from 'lucide-react';

interface JiraIssueCardFooterProps {
  issueKey: string;
  onOpenInJira?: (issueKey: string) => void | Promise<void>;
  onTrackTime?: (issueKey: string) => void | Promise<unknown>;
  isActive?: boolean;
  activeEntryId?: string;
  onStopTime?: (entryId: string) => void | Promise<void>;
}

export function JiraIssueCardFooter({
  issueKey,
  onOpenInJira,
  onTrackTime,
  isActive,
  activeEntryId,
  onStopTime,
}: JiraIssueCardFooterProps) {
  async function handleOpenInJira() {
    await onOpenInJira?.(issueKey);
  }

  async function handleTrackTime() {
    if (isActive && activeEntryId) {
      await onStopTime?.(activeEntryId);
    } else {
      await onTrackTime?.(issueKey);
    }
  }

  return (
    <CardFooter
      className="flex justify-center px-3 pb-2 gap-6 mt-4"
      onClick={(e) => e.stopPropagation()}
    >
      <Button variant="outline" size="sm" onClick={handleOpenInJira}>
        <ExternalLinkIcon className="h-4 w-4" />
        Open in Jira
      </Button>

      <Button
        variant={isActive ? 'destructive' : 'default'}
        size="sm"
        onClick={handleTrackTime}
        className="flex-1"
      >
        {isActive ? (
          <>
            <SquareIcon className="h-4 w-4" />
            Stop
          </>
        ) : (
          <>
            <PlayIcon className="h-4 w-4" />
            Start
          </>
        )}
      </Button>
    </CardFooter>
  );
}
