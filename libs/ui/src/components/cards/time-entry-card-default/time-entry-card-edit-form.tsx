import type { TimeEntryWithIssue } from '@time-tracker/database';
import type { TimeEntryUpdates } from './types';
import { useState } from 'react';
import { Button } from '../../ui/button';
import { CardContent, CardFooter } from '../../ui/card';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '../../ui/field';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';

function toDatetimeLocal(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

interface TimeEntryCardEditFormProps {
  entry: TimeEntryWithIssue;
  onSave: (entryId: string, updates: TimeEntryUpdates) => void | Promise<void>;
  onCancel: () => void;
}

export function TimeEntryCardEditForm({
  entry,
  onSave,
  onCancel,
}: TimeEntryCardEditFormProps) {
  const startDate = new Date(entry.startedAt);
  const duration = entry.timeSpentSeconds ?? 0;
  const endDate = new Date(startDate.getTime() + duration * 1000);

  const [formStartedAt, setFormStartedAt] = useState(
    toDatetimeLocal(startDate)
  );
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

  function handleCancel() {
    setFormStartedAt(toDatetimeLocal(startDate));
    setFormEndedAt(toDatetimeLocal(endDate));
    setFormDescription(entry.description ?? '');
    onCancel();
  }

  async function handleSave() {
    if (!isValidRange) return;
    setIsSaving(true);
    try {
      await onSave(entry.id, {
        startedAt: formStartDate,
        timeSpentSeconds: formDurationSeconds,
        description: formDescription || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <CardContent className="px-3 pt-0 pb-2.5">
        <FieldSet className="gap-2">
          <FieldLegend variant="label" className="text-xs mb-1">Time</FieldLegend>
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel htmlFor="startedAt">Started</FieldLabel>
              <Input
                id="startedAt"
                type="datetime-local"
                value={formStartedAt}
                onChange={(e) => setFormStartedAt(e.target.value)}
                className="h-7 text-xs px-2 py-0.5"
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
                className="h-7 text-xs px-2 py-0.5"
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
                className="min-h-8 text-xs px-2 py-1.5"
              />
            </Field>
          </FieldGroup>
        </FieldSet>
      </CardContent>
      <CardFooter className="px-3 pb-2.5 gap-2">
        <Button
          variant="outline"
          size="xs"
          onClick={handleCancel}
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
  );
}
