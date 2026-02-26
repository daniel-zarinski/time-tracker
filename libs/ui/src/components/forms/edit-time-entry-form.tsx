import { zodResolver } from '@hookform/resolvers/zod';
import type { TimeEntryWithIssue } from '@time-tracker/database';
import {
  TimeEntryFormSchema,
  type TimeEntryFormValues,
} from '@time-tracker/schema';
import type { TimeEntryUpdates } from '@time-tracker/utils';
import {
  combineDateAndTime,
  cn,
  formatDurationHHMM,
  minutesToTimeString,
  parseDurationHHMM,
  startOfDay,
  timeStringToMinutes,
  toTimeString,
} from '@time-tracker/utils';
import {
  CalendarIcon,
  Clock2Icon,
  TimerIcon,
  Trash2Icon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { ComboboxSelectItem } from '../combobox-select';
import { ComboboxSelect } from '../combobox-select';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { CardContent, CardFooter } from '../ui/card';
import { Field, FieldError, FieldLabel } from '../ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Textarea } from '../ui/textarea';

interface EditTimeEntryFormProps {
  entry: TimeEntryWithIssue;
  issues?: ComboboxSelectItem[];
  onSave: (entryId: string, updates: TimeEntryUpdates) => void | Promise<void>;
  onCancel: () => void;
  onDelete?: (entryId: string) => void | Promise<void>;
  className?: string;
}

export function EditTimeEntryForm({
  entry,
  issues = [],
  onSave,
  onCancel,
  onDelete,
  className,
}: EditTimeEntryFormProps) {
  const startDate = new Date(entry.startedAt);
  const duration = entry.timeSpentSeconds ?? 0;
  const endDate = new Date(startDate.getTime() + duration * 1000);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TimeEntryFormValues>({
    resolver: zodResolver(TimeEntryFormSchema),
    defaultValues: {
      issueKey: entry.issueKey,
      date: startOfDay(startDate),
      startTime: toTimeString(startDate),
      endTime: toTimeString(endDate),
      description: entry.description ?? '',
    },
  });

  const startTime = watch('startTime');
  const endTime = watch('endTime');

  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);
  const durationSeconds = Math.max(0, (endMinutes - startMinutes) * 60);

  const formRef = useRef<HTMLFormElement>(null);
  const [durationInput, setDurationInput] = useState('');
  const [isDurationFocused, setIsDurationFocused] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (!isDurationFocused) {
      setDurationInput(formatDurationHHMM(durationSeconds));
    }
  }, [durationSeconds, isDurationFocused]);

  function handleDurationBlur() {
    const parsed = parseDurationHHMM(durationInput);
    if (parsed !== null && parsed > 0) {
      const newEndMinutes = startMinutes + parsed / 60;
      if (newEndMinutes <= 1439) {
        setValue('endTime', minutesToTimeString(newEndMinutes));
      }
    }
    setIsDurationFocused(false);
  }

  async function onFormSubmit(data: TimeEntryFormValues) {
    const newStartedAt = combineDateAndTime(data.date, data.startTime);
    const newTimeSpent =
      Math.max(
        0,
        (timeStringToMinutes(data.endTime) -
          timeStringToMinutes(data.startTime)) *
          60
      );

    await onSave(entry.id, {
      issueKey: data.issueKey !== entry.issueKey ? data.issueKey : undefined,
      startedAt: newStartedAt,
      timeSpentSeconds: newTimeSpent,
      description: data.description || undefined,
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onFormSubmit)}
      className={cn('flex flex-col gap-0', className)}
    >
      <CardContent className="px-3 pt-3 pb-2.5">
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          {/* Issue Key — col-span-2 */}
          <Controller
            name="issueKey"
            control={control}
            render={({ field }) => {
              const defaultItem =
                issues.find((i) => i.value === entry.issueKey) ?? null;
              return (
                <Field className="col-span-2">
                  <FieldLabel className="text-xs">Jira Issue Key</FieldLabel>
                  <ComboboxSelect
                    items={issues}
                    defaultValue={defaultItem}
                    onValueChange={(item) => {
                      field.onChange(item?.value ?? '');
                    }}
                    placeholder="Search issues..."
                    className="h-7 text-xs"
                    container={formRef.current}
                  />
                  <FieldError className="text-xs">
                    {errors.issueKey?.message}
                  </FieldError>
                </Field>
              );
            }}
          />

          {/* Date */}
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
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
                        {field.value.toLocaleDateString(undefined, {
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
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(startOfDay(date));
                          setCalendarOpen(false);
                        }
                      }}
                      className="p-2 [--cell-size:--spacing(7)]"
                    />
                  </PopoverContent>
                </Popover>
                <FieldError className="text-xs">
                  {errors.date?.message}
                </FieldError>
              </Field>
            )}
          />

          {/* Start Time */}
          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="edit-startTime" className="text-xs">
                  Start Time
                </FieldLabel>
                <InputGroup className="h-7">
                  <InputGroupInput
                    id="edit-startTime"
                    type="time"
                    className="h-7 text-xs appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    {...field}
                  />
                  <InputGroupAddon align="inline-end">
                    <Clock2Icon className="size-3" />
                  </InputGroupAddon>
                </InputGroup>
                <FieldError className="text-xs">
                  {errors.startTime?.message}
                </FieldError>
              </Field>
            )}
          />

          {/* End Time */}
          <Controller
            name="endTime"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="edit-endTime" className="text-xs">
                  End Time
                </FieldLabel>
                <InputGroup className="h-7">
                  <InputGroupInput
                    id="edit-endTime"
                    type="time"
                    className="h-7 text-xs appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    {...field}
                  />
                  <InputGroupAddon align="inline-end">
                    <Clock2Icon className="size-3" />
                  </InputGroupAddon>
                </InputGroup>
                <FieldError className="text-xs">
                  {errors.endTime?.message}
                </FieldError>
              </Field>
            )}
          />

          {/* Duration (computed, not a form field) */}
          <Field>
            <FieldLabel htmlFor="edit-duration" className="text-xs">
              Duration
            </FieldLabel>
            <InputGroup className="h-7">
              <InputGroupInput
                id="edit-duration"
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

          {/* Description — col-span-2 */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Field className="col-span-2">
                <FieldLabel htmlFor="edit-description" className="text-xs">
                  Description
                </FieldLabel>
                <Textarea
                  id="edit-description"
                  placeholder="Optional"
                  rows={3}
                  className="text-sm px-2 py-1.5"
                  {...field}
                />
              </Field>
            )}
          />
        </div>
      </CardContent>

      <CardFooter className="px-3 pb-2.5 gap-2">
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" size="xs" disabled={isSubmitting}>
          {isSubmitting ? 'Saving\u2026' : 'Save'}
        </Button>
        <div className="flex-1" />
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            size="xs"
            onClick={() => onDelete(entry.id)}
            disabled={isSubmitting}
          >
            <Trash2Icon className="size-3" />
            Delete
          </Button>
        )}
      </CardFooter>
    </form>
  );
}
