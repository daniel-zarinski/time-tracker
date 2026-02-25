import { z } from 'zod';

// H1. PersistedStateSchema
export const TabValueSchema = z.enum([
  'home',
  'tasks',
  'timeline',
  'jira-issues',
  'settings',
]);

export type TabValue = z.infer<typeof TabValueSchema>;

export const PersistedStateSchema = z.object({
  elapsed: z.number(),
  activeTab: TabValueSchema,
});

export type PersistedState = z.infer<typeof PersistedStateSchema>;
