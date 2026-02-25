import type { TimeEntryWithIssue } from '@time-tracker/database';
import type { TimeEntryUpdates } from '@time-tracker/utils';
import { CalendarIcon, Clock2Icon, TimerIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { Calendar } from '../../ui/calendar';
import { CardContent, CardFooter } from '../../ui/card';
import { Field, FieldLabel } from '../../ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../../ui/input-group';
import { Textarea } from '../../ui/textarea';

function toTimeString(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function timeStringToMinutes(time: string): number {
  const parts = time.split(':').map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  return h * 60 + m;
}

function minutesToTimeString(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(1439, Math.floor(totalMinutes)));
  const h = String(Math.floor(clamped / 60)).padStart(2, '0');
  const m = String(clamped % 60).padStart(2, '0');
  return `${h}:${m}`;
}

function combineDateAndTime(date: Date, time: string): Date {
  const result = new Date(date);
  const minutes = timeStringToMinutes(time);
  result.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return result;
}

function formatDurationHHMM(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  return `${h}:${m}`;
}

function parseDurationHHMM(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (m >= 60) return null;
  return h * 3600 + m * 60;
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

  const [formDate, setFormDate] = useState<Date>(startOfDay(startDate));
  const [formStartTime, setFormStartTime] = useState(toTimeString(startDate));
  const [formEndTime, setFormEndTime] = useState(toTimeString(endDate));
  const [formDescription, setFormDescription] = useState(
    entry.description ?? ''
  );
  const [isSaving, setIsSaving] = useState(false);

  const [durationInput, setDurationInput] = useState('');
  const [isDurationFocused, setIsDurationFocused] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const startMinutes = timeStringToMinutes(formStartTime);
  const endMinutes = timeStringToMinutes(formEndTime);
  const formDurationSeconds = Math.max(0, (endMinutes - startMinutes) * 60);
  const isValidRange = endMinutes > startMinutes;

  useEffect(() => {
    if (!isDurationFocused) {
      setDurationInput(formatDurationHHMM(formDurationSeconds));
    }
  }, [formDurationSeconds, isDurationFocused]);

  function handleDurationBlur() {
    const parsed = parseDurationHHMM(durationInput);
    if (parsed !== null && parsed > 0) {
      const newEndMinutes = startMinutes + parsed / 60;
      if (newEndMinutes <= 1439) {
        setFormEndTime(minutesToTimeString(newEndMinutes));
      }
    }
    setIsDurationFocused(false);
  }

  function handleCancel() {
    setFormDate(startOfDay(startDate));
    setFormStartTime(toTimeString(startDate));
    setFormEndTime(toTimeString(endDate));
    setFormDescription(entry.description ?? '');
    onCancel();
  }

  async function handleSave() {
    if (!isValidRange) return;
    setIsSaving(true);
    try {
      await onSave(entry.id, {
        startedAt: combineDateAndTime(formDate, formStartTime),
        timeSpentSeconds: formDurationSeconds,
        description: formDescription || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <CardContent className="px-3 pt-3 pb-2.5">
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          <Field>
            <FieldLabel className="text-xs">Date</FieldLabel>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-7 w-full items-center gap-2 rounded-md border border-input px-2.5 text-xs shadow-xs hover:bg-accent transition-colors"
                >
                  <CalendarIcon className="size-3 text-muted-foreground shrink-0" />
                  <span className="truncate">
                    {formDate.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formDate}
                  onSelect={(date) => {
                    if (date) {
                      setFormDate(startOfDay(date));
                      setCalendarOpen(false);
                    }
                  }}
                  className="p-2 [--cell-size:--spacing(7)]"
                />
              </PopoverContent>
            </Popover>
          </Field>

          <Field>
            <FieldLabel htmlFor="startTime" className="text-xs">
              Start Time
            </FieldLabel>
            <InputGroup className="h-7">
              <InputGroupInput
                id="startTime"
                type="time"

                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="h-7 text-xs appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
              <InputGroupAddon align="inline-end">
                <Clock2Icon className="size-3" />
              </InputGroupAddon>
            </InputGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor="endTime" className="text-xs">
              End Time
            </FieldLabel>
            <InputGroup className="h-7">
              <InputGroupInput
                id="endTime"
                type="time"

                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                aria-invalid={!isValidRange}
                className="h-7 text-xs appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
              <InputGroupAddon align="inline-end">
                <Clock2Icon className="size-3" />
              </InputGroupAddon>
            </InputGroup>
            {!isValidRange && (
              <p className="text-destructive text-xs mt-1">
                End must be after start
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="duration" className="text-xs">
              Duration
            </FieldLabel>
            <InputGroup className="h-7">
              <InputGroupInput
                id="duration"
                type="text"
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                onFocus={() => setIsDurationFocused(true)}
                onBlur={handleDurationBlur}
                placeholder="HH:MM"
                className="h-7 text-xs"
              />
              <InputGroupAddon align="inline-end">
                <TimerIcon className="size-3" />
              </InputGroupAddon>
            </InputGroup>
          </Field>

          <Field className="col-span-2">
            <FieldLabel htmlFor="description" className="text-xs">
              Description
            </FieldLabel>
            <Textarea
              id="description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Optional"
              rows={3}
              className="text-sm px-2 py-1.5"
            />
          </Field>
        </div>
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
          {isSaving ? 'Saving\u2026' : 'Save'}
        </Button>
      </CardFooter>
    </>
  );
}
