import { z } from 'zod';

// C1. JiraIssueSchema
export const JiraIssueSchema = z.object({
  key: z.string().nullable(),
  jiraId: z.number().nullable(),
  summary: z.string(),
  status: z.string(),
  statusId: z.number().nullable(),
  categoryKey: z.string().nullable().optional(),
  issueType: z.string(),
  priority: z.string(),
  epicKey: z.string().nullable(),
  epicSummary: z.string().nullable(),
  parentIssueType: z.string().nullable(),
  assigneeEmail: z.string().nullable(),
});

export type JiraIssue = z.infer<typeof JiraIssueSchema>;

// C2. JiraStatusInfoSchema
export const JiraStatusInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  statusCategory: z.string().optional(),
  statusCategoryName: z.string().optional(),
  colorName: z.string().optional(),
});

export type JiraStatusInfo = z.infer<typeof JiraStatusInfoSchema>;
