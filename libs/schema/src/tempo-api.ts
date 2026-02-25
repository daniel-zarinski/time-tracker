import { z } from 'zod';

// F1. TempoWorklogSchema
const TempoWorklogIssueSchema = z.object({
  self: z.string().optional(),
  key: z.string().optional(),
  id: z.number().optional(),
});

const TempoWorklogAuthorSchema = z.object({
  self: z.string().optional(),
  accountId: z.string(),
  displayName: z.string().optional(),
});

export const TempoWorklogSchema = z.object({
  self: z.string().optional(),
  tempoWorklogId: z.number(),
  jiraWorklogId: z.number().optional(),
  issue: TempoWorklogIssueSchema,
  timeSpentSeconds: z.number(),
  billableSeconds: z.number(),
  startDate: z.string(),
  startTime: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  author: TempoWorklogAuthorSchema,
  attributes: z
    .object({
      self: z.string().optional(),
      values: z.array(z.unknown()).optional(),
    })
    .optional(),
});

export type TempoWorklog = z.infer<typeof TempoWorklogSchema>;

// F2. TempoWorklogsResponseSchema
export const TempoWorklogsResponseSchema = z.object({
  self: z.string(),
  metadata: z.object({
    count: z.number(),
    next: z.string().optional(),
  }),
  results: z.array(TempoWorklogSchema),
});

export type TempoWorklogsResponse = z.infer<typeof TempoWorklogsResponseSchema>;

// F3. TempoCreateWorklogInputSchema
export const TempoCreateWorklogInputSchema = z.object({
  originTaskId: z.string(),
  timeSpentSeconds: z.number(),
  billableSeconds: z.number().optional(),
  started: z.string(),
  workerId: z.string().optional(),
  authorAccountId: z.string().optional(),
  comment: z.string().optional(),
  remainingEstimate: z.number().optional(),
  attributes: z.record(z.string(), z.object({ value: z.string() })).optional(),
});

export type TempoCreateWorklogInput = z.infer<
  typeof TempoCreateWorklogInputSchema
>;

// F4. TempoUpdateWorklogInputSchema
export const TempoUpdateWorklogInputSchema = z.object({
  issueKey: z.string(),
  timeSpentSeconds: z.number(),
  billableSeconds: z.number().optional(),
  startDate: z.string(),
  startTime: z.string().optional(),
  authorAccountId: z.string(),
  attributes: z
    .array(z.object({ key: z.string(), value: z.string() }))
    .optional(),
});

export type TempoUpdateWorklogInput = z.infer<
  typeof TempoUpdateWorklogInputSchema
>;
