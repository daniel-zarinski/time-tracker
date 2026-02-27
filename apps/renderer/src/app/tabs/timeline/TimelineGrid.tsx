import * as React from 'react';
import { cn } from '@time-tracker/utils';
import type { TimeEntryUpdates } from '@time-tracker/utils';
import type { TimeEntryWithIssue } from '@time-tracker/database';
import {
  BorderTrail,
  InView,
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  ScrollArea,
  useMorphingDialog,
  type ComboboxSelectItem,
} from '@time-tracker/ui';
import { TimeEntryCardDefault } from '../../components/cards/time-entry-card-default';
import {
  HALF_HOUR_ROWS,
  QUARTER_HOUR_ROWS,
  formatHour,
  formatEntryTime,
  type EntryWithLayout,
  formatSelection,
} from './timeline-utils';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { TimelineCreatePopover } from './TimelineCreatePopover';
import { Selection } from './use-timeline-drag';

interface TimelineGridProps {
  olRef: React.RefObject<HTMLOListElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  entriesWithLayout: EntryWithLayout[];
  selection: Selection | null;
  isDragging: boolean;
  isToday: boolean;
  date: Date;
  issues: ComboboxSelectItem[];
  onPointerDown: (e: React.PointerEvent<HTMLOListElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLOListElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLOListElement>) => void;
  onSaveEntry: (entryId: string, updates: TimeEntryUpdates) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onResumeTimer?: (issueKey: string) => Promise<void>;
  onOpenInJira?: (issueKey: string) => void;
  onCreateEntry: (issueKey: string) => void | Promise<void>;
  onClearSelection: () => void;
}

function TimelineEntryDialogContent({
  entry,
  issues,
  onSave,
  onDelete,
  onResume,
  onOpenInJira,
}: {
  entry: TimeEntryWithIssue;
  issues: ComboboxSelectItem[];
  onSave: (entryId: string, updates: TimeEntryUpdates) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
  onResume?: (issueKey: string) => Promise<void>;
  onOpenInJira?: (issueKey: string) => void;
}) {
  const { setIsOpen } = useMorphingDialog();
  return (
    <TimeEntryCardDefault
      entry={entry}
      issues={issues}
      defaultExpanded
      defaultView="edit"
      onSave={async (id, u) => {
        await onSave(id, u);
        setIsOpen(false);
      }}
      onDelete={async (id) => {
        await onDelete(id);
        setIsOpen(false);
      }}
      onResumeTimer={
        onResume
          ? async (k) => {
              await onResume(k);
              setIsOpen(false);
            }
          : undefined
      }
      onOpenInJira={onOpenInJira}
    />
  );
}

export function TimelineGrid({
  olRef,
  containerRef,
  entriesWithLayout,
  selection,
  isDragging,
  isToday,
  date,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onSaveEntry,
  onDeleteEntry,
  onResumeTimer,
  onOpenInJira,
  onCreateEntry,
  onClearSelection,
  issues,
}: TimelineGridProps) {
  const formattedSelection = React.useMemo(() => {
    if (!selection) return null;

    return formatSelection(selection, date);
  }, [selection, date]);

  return (
    <div ref={containerRef}>
      <div className="flex w-full flex-auto">
        {/* Gutter spacer for time labels */}
        <div className="w-14 flex-none" />

        {/* Grid container */}
        <div className="grid flex-auto grid-cols-1 grid-rows-1">
          {/* Grid A: horizontal lines + time labels */}
          <div
            className="col-start-1 col-end-2 row-start-1 divide-y divide-border/50"
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${HALF_HOUR_ROWS}, minmax(2.8rem, 1fr))`,
            }}
          >
            {Array.from({ length: HALF_HOUR_ROWS }, (_, i) => (
              <div key={i} className="relative">
                {i % 2 === 0 && (
                  <span className="sticky left-0 -ml-14 -mt-2.5 inline-block w-14 pr-2 text-right text-[10px] text-muted-foreground">
                    {formatHour(i / 2)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Grid B: events overlay */}
          <ol
            ref={olRef}
            className="relative col-start-1 col-end-2 row-start-1"
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${QUARTER_HOUR_ROWS}, minmax(0, 1fr))`,
              gridTemplateColumns: '1fr',
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {entriesWithLayout.map(
              ({ entry, gridRowStart, gridRowSpan, column, totalColumns }) => {
                const isActive = entry.timeSpentSeconds == null;
                const entryEnd = entry.timeSpentSeconds
                  ? new Date(
                      new Date(entry.startedAt).getTime() +
                        entry.timeSpentSeconds * 1000
                    )
                  : null;

                const issueKey = entry.issue.key ?? entry.issueKey;

                return (
                  <InView
                    key={entry.id}
                    as="li"
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                    viewOptions={{ margin: '-120px 0px -24px 0px' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="pointer-events-none relative"
                    style={{
                      gridRow: `${gridRowStart} / span ${gridRowSpan}`,
                      gridColumn: '1',
                    }}
                  >
                    <MorphingDialog
                      transition={{
                        type: 'spring',
                        bounce: 0.05,
                        duration: 0.5,
                      }}
                      onOpenChange={(open) => {
                        if (open) onClearSelection();
                      }}
                    >
                      <MorphingDialogTrigger
                        className={cn(
                          'pointer-events-auto absolute inset-y-0.5 inset-x-[22px] px-2 pt-0 pb-2 text-left transition-colors',
                          isActive
                            ? 'border border-primary/30 bg-accent/15 hover:bg-primary/10'
                            : 'border border-primary/20 bg-primary/5 hover:bg-primary/10',
                          totalColumns > 1 && 'inset-y-0.5'
                        )}
                        style={{
                          borderRadius: 'var(--radius)',
                          ...(totalColumns > 1
                            ? {
                                left: `calc(${
                                  (column / totalColumns) * 100
                                }% + ${column === 0 ? '22px' : '0.25rem'})`,
                                right: `calc(${
                                  ((totalColumns - column - 1) /
                                    totalColumns) *
                                  100
                                }% + ${
                                  column === totalColumns - 1
                                    ? '22px'
                                    : '0.25rem'
                                })`,
                              }
                            : undefined),
                        }}
                      >
                        {isActive && <BorderTrail size={100} />}
                        <div className="truncate text-xs text-primary flex items-center">
                          <MorphingDialogTitle className="font-semibold">
                            {issueKey}
                          </MorphingDialogTitle>
                          {entry.issue.summary && (
                            <MorphingDialogSubtitle className="ml-1.5 text-primary/60">
                              {entry.issue.summary}
                            </MorphingDialogSubtitle>
                          )}
                        </div>
                        {gridRowSpan >= 2 && (
                          <p className="mt-0.5 text-[10px] text-primary/60">
                            {formatEntryTime(new Date(entry.startedAt))}
                            {entryEnd ? ` - ${formatEntryTime(entryEnd)}` : ''}
                          </p>
                        )}
                      </MorphingDialogTrigger>
                      <MorphingDialogContainer>
                        <MorphingDialogContent
                          className="relative h-auto w-full max-w-md border border-border bg-background"
                          style={{ borderRadius: 'var(--radius)' }}
                        >
                          <ScrollArea className="max-h-[85vh]" type="scroll">
                            <TimelineEntryDialogContent
                              entry={entry}
                              issues={issues}
                              onSave={onSaveEntry}
                              onDelete={onDeleteEntry}
                              onResume={onResumeTimer}
                              onOpenInJira={onOpenInJira}
                            />
                          </ScrollArea>
                          <MorphingDialogClose className="text-muted-foreground" />
                        </MorphingDialogContent>
                      </MorphingDialogContainer>
                    </MorphingDialog>
                  </InView>
                );
              }
            )}

            {/* Drag-to-select highlight */}
            {formattedSelection && (
              <li
                className="pointer-events-none relative z-10"
                style={{
                  gridRow: `${formattedSelection.minRow} / span ${formattedSelection.span}`,
                  gridColumn: '1',
                }}
              >
                <div className="pointer-events-auto absolute inset-y-1 inset-x-[22px] flex items-center justify-center rounded-lg border border-dashed border-primary/40 bg-primary/10">
                  <span className="text-xs font-medium text-primary/70">
                    {formatEntryTime(formattedSelection.startTime)} –{' '}
                    {formatEntryTime(formattedSelection.endTime)} (
                    {formattedSelection.duration})
                  </span>
                  {!isDragging && (
                    <TimelineCreatePopover
                      issues={issues}
                      onSubmit={onCreateEntry}
                      onCancel={onClearSelection}
                    />
                  )}
                </div>
              </li>
            )}

            {/* Current time indicator */}
            {isToday && <CurrentTimeIndicator />}
          </ol>
        </div>
      </div>
    </div>
  );
}
