import { z } from 'zod';

export const ATLASSIAN_DOMAIN_SUFFIX = '.atlassian.net';

export function jiraDomain(company: string): string {
  return `${company}${ATLASSIAN_DOMAIN_SUFFIX}`;
}

// A1. JiraConfigInputSchema
export const JiraConfigInputSchema = z.object({
  company: z
    .string()
    .trim()
    .toLowerCase()
    .transform((s) => s.replace(/\.atlassian\.net$/i, ''))
    .pipe(z.string().min(1)),
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
