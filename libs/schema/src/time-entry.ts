import { z } from 'zod';

function parseTimeToMinutes(time: string): number {
  const parts = time.split(':').map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  return h * 60 + m;
}

// E1. CreateTimeEntryInputSchema
export const CreateTimeEntryInputSchema = z.object({
  issueKey: z.string(),
  description: z.string().optional(),
});

export type CreateTimeEntryInput = z.infer<typeof CreateTimeEntryInputSchema>;

// E2. UpdateTimeEntryInputSchema
export const UpdateTimeEntryInputSchema = z.object({
  startedAt: z.date().optional(),
  timeSpentSeconds: z.number().optional(),
  description: z.string().optional(),
  issueKey: z.string().optional(),
});

export type UpdateTimeEntryInput = z.infer<typeof UpdateTimeEntryInputSchema>;

// E3. TimeEntryFormSchema (react-hook-form validation — shared by create & edit)
export const TimeEntryFormSchema = z
  .object({
    issueKey: z.string().min(1, 'Issue key is required'),
    date: z.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
    description: z.string().optional(),
  })
  .refine(
    (data) =>
      parseTimeToMinutes(data.endTime) >
      parseTimeToMinutes(data.startTime),
    { message: 'End time must be after start time', path: ['endTime'] }
  );

export type TimeEntryFormValues = z.infer<typeof TimeEntryFormSchema>;

/** @deprecated Use TimeEntryFormSchema */
export const CreateTimeEntryFormSchema = TimeEntryFormSchema;
/** @deprecated Use TimeEntryFormValues */
export type CreateTimeEntryFormValues = TimeEntryFormValues;
