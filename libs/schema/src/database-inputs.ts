import { z } from 'zod';

// D1. JiraIssueUpsertInputSchema
export const JiraIssueUpsertInputSchema = z
  .object({
    key: z.string().nullable().optional(),
    jiraId: z.number().nullable().optional(),
    summary: z.string(),
    status: z.string(),
    statusId: z.number().nullable().optional(),
    categoryKey: z.string().nullable().optional(),
    issueType: z.string(),
    priority: z.string(),
    epicKey: z.string().nullable().optional(),
    assigneeEmail: z.string().nullable().optional(),
  })
  .refine((data) => data.key || data.jiraId != null, {
    message: 'At least key or jiraId is required',
  });

export type JiraIssueUpsertInput = z.infer<typeof JiraIssueUpsertInputSchema>;

// D2. JiraStatusInputSchema
export const JiraStatusInputSchema = z.object({
  id: z.number(),
  name: z.string(),
  categoryName: z.string().nullable().optional(),
  categoryKey: z.string().nullable().optional(),
  colorName: z.string().nullable().optional(),
});

export type JiraStatusInput = z.infer<typeof JiraStatusInputSchema>;

// D3. JiraStatusWithCategorySchema
export const JiraStatusWithCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  categoryName: z.string().nullable(),
  categoryKey: z.string().nullable(),
  colorName: z.string().nullable(),
});

export type JiraStatusWithCategory = z.infer<
  typeof JiraStatusWithCategorySchema
>;
