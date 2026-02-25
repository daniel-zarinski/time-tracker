import { z } from 'zod';

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
});

export type UpdateTimeEntryInput = z.infer<typeof UpdateTimeEntryInputSchema>;
