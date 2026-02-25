import { z } from 'zod';

// A1. JiraConfigInputSchema
export const JiraConfigInputSchema = z.object({
  domain: z.string(),
  email: z.string(),
  token: z.string(),
  accountId: z.string().optional(),
});

export type JiraConfigInput = z.infer<typeof JiraConfigInputSchema>;

// A2. TempoConfigSchema
export const TempoConfigSchema = z.object({
  token: z.string(),
});

export type TempoConfig = z.infer<typeof TempoConfigSchema>;
