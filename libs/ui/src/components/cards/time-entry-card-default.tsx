import type { TimeEntryWithIssue } from '@time-tracker/database';
import {
  cn,
  formatDuration,
  formatRelativeDate,
  formatTime,
} from '@time-tracker/utils';
import {
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlayIcon,
  Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '../ui/field';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';

export interface TimeEntryUpdates {
  startedAt?: Date;
  endedAt?: Date;
  timeSpentSeconds?: number;
  description?: string;
}

type CardState = 'default' | 'expanded' | 'edit';

interface TimeEntryCardDefaultProps {
  entry: TimeEntryWithIssue;
  /** Hours per day for progress calculation (default: 7) */
  hoursPerDay?: number;
  /** Start with actions expanded (default: false) */
  defaultExpanded?: boolean;
  onResumeTimer?: (issueKey: string) => unknown | Promise<unknown>;
  onSave?: (entryId: string, updates: TimeEntryUpdates) => void | Promise<void>;
  onDelete?: (entryId: string) => void | Promise<void>;
  onOpenInJira?: (issueKey: string) => void | Promise<void>;
  className?: string;
}

function syncStatusStyles(status: string) {
  switch (status) {
    case 'SYNCED':
      return 'border-green-500/20 bg-green-500/5';
    case 'ERROR':
      return 'border-destructive/20 bg-destructive/5';
    default:
      return 'border-border bg-card/30';
  }
}

function toDatetimeLocal(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export function TimeEntryCardDefault({
  entry,
  hoursPerDay = 7,
  defaultExpanded = false,
  onResumeTimer,
  onSave,
  onDelete,
  onOpenInJira,
  className,
}: TimeEntryCardDefaultProps) {
  const [state, setState] = useState<CardState>(
    defaultExpanded ? 'expanded' : 'default'
  );
  const expanded = state === 'expanded' || state === 'edit';

  const startDate = new Date(entry.startedAt);
  const duration = entry.timeSpentSeconds ?? 0;
  const endDate = new Date(startDate.getTime() + duration * 1000);

  const secondsPerDay = hoursPerDay * 3600;
  const progressValue = Math.min(100, (duration / secondsPerDay) * 100);

  const [formStartedAt, setFormStartedAt] = useState(toDatetimeLocal(startDate));
  const [formEndedAt, setFormEndedAt] = useState(toDatetimeLocal(endDate));
  const [formDescription, setFormDescription] = useState(
    entry.description ?? ''
  );
  const [isSaving, setIsSaving] = useState(false);

  const formStartDate = new Date(formStartedAt);
  const formEndDate = new Date(formEndedAt);
  const formDurationSeconds = Math.max(
    0,
    Math.floor((formEndDate.getTime() - formStartDate.getTime()) / 1000)
  );
  const isValidRange = formEndDate >= formStartDate;

  function handleCancelEdit() {
    setFormStartedAt(toDatetimeLocal(startDate));
    setFormEndedAt(toDatetimeLocal(endDate));
    setFormDescription(entry.description ?? '');
    setState('expanded');
  }

  async function handleSave() {
    if (!isValidRange || !onSave) return;
    setIsSaving(true);
    try {
      await onSave(entry.id, {
        startedAt: formStartDate,
        timeSpentSeconds: formDurationSeconds,
        description: formDescription || undefined,
      });
      setState('default');
    } finally {
      setIsSaving(false);
    }
  }

  const issueKey = entry.issue.key ?? entry.issueKey;

  return (
    <Card
      className={cn(
        'transition-all duration-200 border rounded-(--radius) shadow-none overflow-hidden',
        syncStatusStyles(entry.syncStatus),
        'hover:bg-card/40 hover:border-primary/20',
        'py-0 gap-0',
        expanded && 'border-primary/25 bg-card/45',
        className
      )}
    >
      <Progress
        value={progressValue}
        className="h-1 rounded-none bg-primary/15"
      />
      {state === 'edit' ? (
        <>
          <CardHeader className="px-3 py-2.5 gap-0.5 cursor-default">
            <CardTitle className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="shrink-0 text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70"
              >
                {issueKey}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs truncate">
              {entry.issue.summary ?? ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pt-0 pb-2.5">
            <FieldSet>
              <FieldLegend variant="label">Time</FieldLegend>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="startedAt">Started</FieldLabel>
                  <Input
                    id="startedAt"
                    type="datetime-local"
                    value={formStartedAt}
                    onChange={(e) => setFormStartedAt(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="endedAt">Ended</FieldLabel>
                  <Input
                    id="endedAt"
                    type="datetime-local"
                    value={formEndedAt}
                    onChange={(e) => setFormEndedAt(e.target.value)}
                    aria-invalid={!isValidRange}
                  />
                  {!isValidRange && (
                    <p className="text-destructive text-xs mt-1">
                      End must be after start
                    </p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Optional"
                    rows={2}
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>
          <CardFooter className="px-3 pb-2.5 gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="xs"
              onClick={handleSave}
              disabled={!isValidRange || isSaving}
            >
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          </CardFooter>
        </>
      ) : (
        <Collapsible
          open={state === 'expanded'}
          onOpenChange={(open) => setState(open ? 'expanded' : 'default')}
        >
          <CollapsibleTrigger asChild>
            <div className="cursor-pointer select-none">
              <CardHeader className="px-3 py-2.5 gap-0.5">
                <CardTitle className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="shrink-0 text-[9px] font-bold tracking-wide px-1.5 py-0 h-4 text-muted-foreground/70"
                  >
                    {issueKey}
                  </Badge>
                </CardTitle>
                <CardDescription
                  className={cn('text-xs', state !== 'expanded' && 'truncate')}
                >
                  {entry.issue.summary ?? ''}
                </CardDescription>
                {state === 'default' && (
                  <CardAction>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontalIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenInJira?.(issueKey);
                          }}
                        >
                          <EyeIcon className="size-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setState('edit');
                          }}
                        >
                          <PencilIcon className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(entry.id);
                          }}
                        >
                          <Trash2Icon className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardAction>
                )}
              </CardHeader>
            </div>
          </CollapsibleTrigger>

          <CardContent className="px-3 pt-0 pb-2.5 max-w-sm mx-auto">
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{formatRelativeDate(startDate)}</span>
              <span className="mx-auto">
                {formatTime(startDate)} → {formatTime(endDate)}
              </span>
              <span className="font-bold text-foreground">
                {formatDuration(duration)}
              </span>
            </div>
          </CardContent>

          <CollapsibleContent>
            <div className="px-3 py-2 text-xs text-muted-foreground/50 italic">
              {/* placeholder — future content TBD */}
            </div>
            <CardFooter className="px-3 pb-2.5 gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={() => onResumeTimer?.(issueKey)}
              >
                <PlayIcon className="size-3" />
                Resume
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => onOpenInJira?.(issueKey)}
              >
                <EyeIcon className="size-3" />
                View
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setState('edit')}
              >
                <PencilIcon className="size-3" />
                Edit
              </Button>
              <div className="flex-1" />
              <Button
                variant="destructive"
                size="xs"
                onClick={() => onDelete?.(entry.id)}
              >
                <Trash2Icon className="size-3" />
                Delete
              </Button>
            </CardFooter>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
}
