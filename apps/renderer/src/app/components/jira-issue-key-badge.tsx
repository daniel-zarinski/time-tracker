import { cn } from '@time-tracker/utils';
import { useAppStore } from '../store';

interface JiraIssueKeyBadgeProps {
  issueKey: string;
  className?: string;
}

const baseStyles =
  'inline-flex items-center justify-center rounded-full border border-border text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70 shrink-0 w-fit whitespace-nowrap';

const interactiveStyles =
  'cursor-pointer hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:border-ring focus-visible:outline-none transition-[color,box-shadow] bg-transparent';

const selectedStyles =
  'bg-accent/50 text-accent-foreground/70';

export function JiraIssueKeyBadge({
  issueKey,
  className,
}: JiraIssueKeyBadgeProps) {
  const selectedIssueKey = useAppStore.use.selectedIssueKey();
  const setSelectedIssueKey = useAppStore.use.setSelectedIssueKey();

  const isSelected = selectedIssueKey === issueKey;

  if (isSelected) {
    return (
      <span className={cn(baseStyles, selectedStyles, className)}>
        {issueKey}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedIssueKey(issueKey);
      }}
      className={cn(baseStyles, interactiveStyles, className)}
    >
      {issueKey}
    </button>
  );
}
