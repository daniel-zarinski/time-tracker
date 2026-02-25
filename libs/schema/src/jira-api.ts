import { z } from 'zod';

// B1. JiraMyselfResponseSchema
export const JiraMyselfResponseSchema = z.object({
  accountId: z.string(),
  displayName: z.string(),
  emailAddress: z.string(),
});

export type JiraMyselfResponse = z.infer<typeof JiraMyselfResponseSchema>;

// B2. JiraRawProjectSchema
export const JiraRawProjectSchema = z.object({
  key: z.string(),
  name: z.string(),
});

export type JiraRawProject = z.infer<typeof JiraRawProjectSchema>;

// B3. JiraIssueFieldsSchema
export const JiraIssueFieldsSchema = z.object({
  summary: z.string(),
  status: z.object({
    id: z.string().optional(),
    name: z.string(),
    statusCategory: z
      .union([z.string(), z.object({ key: z.string().optional() })])
      .optional(),
  }),
  issuetype: z.object({ name: z.string() }),
  priority: z.object({ name: z.string() }),
  assignee: z
    .object({
      accountId: z.string().optional(),
      displayName: z.string().optional(),
      emailAddress: z.string().optional(),
    })
    .nullable()
    .optional(),
  parent: z
    .object({
      key: z.string(),
      fields: z.object({
        summary: z.string(),
        issuetype: z.object({ name: z.string() }).optional(),
      }),
    })
    .optional(),
  customfield_10014: z.string().nullable().optional(),
});

export type JiraIssueFields = z.infer<typeof JiraIssueFieldsSchema>;

// B4. JiraRawIssueSchema
export const JiraRawIssueSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  key: z.string(),
  fields: JiraIssueFieldsSchema,
});

export type JiraRawIssue = z.infer<typeof JiraRawIssueSchema>;

// B5. JiraSearchResponseSchema
export const JiraSearchResponseSchema = z.object({
  issues: z.array(JiraRawIssueSchema),
  nextPageToken: z.string().optional(),
  isLast: z.boolean().optional(),
});

export type JiraSearchResponse = z.infer<typeof JiraSearchResponseSchema>;

// B6. JiraStatusCategorySchema (internal helper)
const JiraStatusCategorySchema = z.object({
  id: z.number().optional(),
  key: z.string().optional(),
  name: z.string().optional(),
  colorName: z.string().optional(),
});

// B6. JiraStatusRawSchema
export const JiraStatusRawSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  statusCategory: z
    .union([z.string(), JiraStatusCategorySchema])
    .optional(),
});

export type JiraStatusRaw = z.infer<typeof JiraStatusRawSchema>;

// B7. JiraStatusSearchResponseSchema
export const JiraStatusSearchResponseSchema = z.object({
  values: z.array(JiraStatusRawSchema).optional(),
  nextPage: z.string().optional(),
});

export type JiraStatusSearchResponse = z.infer<
  typeof JiraStatusSearchResponseSchema
>;
