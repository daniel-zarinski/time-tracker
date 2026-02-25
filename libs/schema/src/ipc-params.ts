import { z } from 'zod';

// G1. PaginationOptionsSchema
export const PaginationOptionsSchema = z.object({
  limit: z.int().positive().optional(),
});

export type PaginationOptions = z.infer<typeof PaginationOptionsSchema>;

// G2. FetchIssuesOptionsSchema
export const FetchIssuesOptionsSchema = z.object({
  project: z.string().optional(),
  assigneeCurrentUser: z.boolean().optional(),
});

export type FetchIssuesOptions = z.infer<typeof FetchIssuesOptionsSchema>;

// G3. StatusMappingUpdateSchema
export const StatusMappingUpdateSchema = z.object({
  statusId: z.number(),
  categoryName: z.string().nullable(),
});

export type StatusMappingUpdate = z.infer<typeof StatusMappingUpdateSchema>;

// G4. DatabaseDeleteResponseSchema
export const DatabaseDeleteResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

export type DatabaseDeleteResponse = z.infer<
  typeof DatabaseDeleteResponseSchema
>;

// G5. SyncResultSchema
export const SyncResultSchema = z.object({
  synced: z.number(),
  missing: z.number(),
});

export type SyncResult = z.infer<typeof SyncResultSchema>;
