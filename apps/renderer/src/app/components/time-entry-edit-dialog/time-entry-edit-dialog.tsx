'use client';

import { useMemo } from 'react';
import type { TimeEntryWithIssue } from '@time-tracker/database';
import { useJiraMyIssues, useTimeEntryMutations } from '@time-tracker/hooks';
import {
  CardDescription,
  CardHeader,
  CardTitle,
  EASE_CUBIC,
  EditTimeEntryForm,
  jiraIssuesToComboboxItems,
  MorphingDialog,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
  ScrollArea,
  useMorphingDialog,
  type ComboboxSelectItem,
} from '@time-tracker/ui';
import { JiraIssueKeyBadge } from '../jira-issue-key-badge';

interface TimeEntryEditDialogFormProps {
  entry: TimeEntryWithIssue;
  issues: ComboboxSelectItem[];
}

function TimeEntryEditDialogForm({
  entry,
  issues,
}: TimeEntryEditDialogFormProps) {
  const { setIsOpen } = useMorphingDialog();
  const { updateTimeEntry, deleteTimeEntry } = useTimeEntryMutations();
  const close = () => setIsOpen(false);

  return (
    <EditTimeEntryForm
      entry={entry}
      issues={issues}
      onSave={async (entryId, updates) => {
        await updateTimeEntry.mutateAsync({ entryId, updates });
        close();
      }}
      onCancel={close}
      onDelete={async (id) => {
        await deleteTimeEntry.mutateAsync(id);
        close();
      }}
    />
  );
}

export interface TimeEntryEditDialogProps {
  entry: TimeEntryWithIssue;
  trigger: React.ReactNode;
  triggerClassName?: string;
  triggerStyle?: React.CSSProperties;
  onOpenChange?: (open: boolean) => void;
}

export function TimeEntryEditDialog({
  entry,
  trigger,
  triggerClassName,
  triggerStyle,
  onOpenChange,
}: TimeEntryEditDialogProps) {
  const issueKey = entry.issue.key ?? entry.issueKey;
  const { data: jiraIssues = [] } = useJiraMyIssues();
  const issues = useMemo(
    () => jiraIssuesToComboboxItems(jiraIssues),
    [jiraIssues]
  );

  return (
    <MorphingDialog
      transition={{ duration: 0.5, ease: EASE_CUBIC }}
      onOpenChange={onOpenChange}
    >
      <MorphingDialogTrigger className={triggerClassName} style={triggerStyle}>
        {trigger}
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent
          className="relative h-auto w-full max-w-md border border-border bg-background"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <ScrollArea className="max-h-[85vh]" type="scroll">
            <CardHeader className="px-3 py-2.5 gap-0.5 cursor-default">
              <MorphingDialogTitle>
                <CardTitle>
                  <JiraIssueKeyBadge issueKey={issueKey} />
                </CardTitle>
              </MorphingDialogTitle>
              <MorphingDialogSubtitle>
                <CardDescription className="text-xs truncate">
                  {entry.issue.summary ?? ''}
                </CardDescription>
              </MorphingDialogSubtitle>
            </CardHeader>
            <TimeEntryEditDialogForm entry={entry} issues={issues} />
          </ScrollArea>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
