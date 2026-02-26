import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateTimeEntryFormSchema,
  type CreateTimeEntryFormValues,
} from '@time-tracker/schema';
import {
  combineDateAndTime,
  formatDurationHHMM,
  minutesToTimeString,
  parseDurationHHMM,
  startOfDay,
  timeStringToMinutes,
  toTimeString,
} from '@time-tracker/utils';
import { cn } from '@time-tracker/utils';
import { CalendarIcon, Clock2Icon, TimerIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../shadcn/button';
import { Calendar } from '../shadcn/calendar';
import { Field, FieldError, FieldLabel } from '../shadcn/field';
import { Input } from '../shadcn/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../shadcn/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '../shadcn/popover';
import { Textarea } from '../shadcn/textarea';

interface CreateTimeEntryFormProps {
  onSubmit: (data: {
    issueKey: string;
    startedAt: Date;
    timeSpentSeconds: number;
    description?: string;
  }) => void | Promise<void>;
  onCancel?: () => void;
  defaultValues?: Partial<CreateTimeEntryFormValues>;
  className?: string;
}

export function CreateTimeEntryForm({
  onSubmit,
  onCancel,
  defaultValues,
  className,
}: CreateTimeEntryFormProps) {
  const now = new Date();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTimeEntryFormValues>({
    resolver: zodResolver(CreateTimeEntryFormSchema),
    defaultValues: {
      issueKey: '',
      date: startOfDay(now),
      startTime: toTimeString(now),
      endTime: toTimeString(new Date(now.getTime() + 30 * 60 * 1000)),
      description: '',
      ...defaultValues,
    },
  });

  const startTime = watch('startTime');
  const endTime = watch('endTime');

  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);
  const durationSeconds = Math.max(0, (endMinutes - startMinutes) * 60);

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

  async function onFormSubmit(data: CreateTimeEntryFormValues) {
    await onSubmit({
      issueKey: data.issueKey,
      startedAt: combineDateAndTime(data.date, data.startTime),
      timeSpentSeconds: Math.max(
        0,
        (timeStringToMinutes(data.endTime) -
          timeStringToMinutes(data.startTime)) *
          60
      ),
      description: data.description || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className={cn('flex flex-col gap-0', className)}
    >
      <div className="px-3 pt-3 pb-2.5">
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          {/* Issue Key — col-span-2 */}
          <Controller
            name="issueKey"
            control={control}
            render={({ field }) => (
              <Field className="col-span-2">
                <FieldLabel htmlFor="issueKey" className="text-xs">
                  Jira Issue Key
                </FieldLabel>
                <Input
                  id="issueKey"
                  placeholder="e.g. PROJ-123"
                  className="h-7 text-xs"
                  {...field}
                />
                <FieldError className="text-xs">
                  {errors.issueKey?.message}
                </FieldError>
              </Field>
            )}
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
                <FieldLabel htmlFor="startTime" className="text-xs">
                  Start Time
                </FieldLabel>
                <InputGroup className="h-7">
                  <InputGroupInput
                    id="startTime"
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
                <FieldLabel htmlFor="endTime" className="text-xs">
                  End Time
                </FieldLabel>
                <InputGroup className="h-7">
                  <InputGroupInput
                    id="endTime"
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

          {/* Description — col-span-2 */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Field className="col-span-2">
                <FieldLabel htmlFor="description" className="text-xs">
                  Description
                </FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Optional"
                  rows={3}
                  className="text-sm px-2 py-1.5"
                  {...field}
                />
              </Field>
            )}
          />
        </div>
      </div>

      <div className="flex px-3 pb-2.5 gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" size="xs" disabled={isSubmitting}>
          {isSubmitting ? 'Creating\u2026' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
