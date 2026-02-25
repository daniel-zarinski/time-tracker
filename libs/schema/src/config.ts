import { z } from 'zod';

// A1. JiraConfigInputSchema
export const JiraConfigInputSchema = z.object({
  domain: z.string().trim().min(1),
  email: z.string().trim().min(1),
  token: z.string().trim().min(1),
  accountId: z.string().trim().min(1).optional(),
});

export type JiraConfigInput = z.infer<typeof JiraConfigInputSchema>;

// A2. TempoConfigSchema
export const TempoConfigSchema = z.object({
  token: z.string().trim().min(1),
});

export type TempoConfig = z.infer<typeof TempoConfigSchema>;
