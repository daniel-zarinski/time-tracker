import {
  PaginationOptionsSchema,
  FetchIssuesOptionsSchema,
  StatusMappingUpdateSchema,
  DatabaseDeleteResponseSchema,
  SyncResultSchema,
} from './ipc-params';

describe('PaginationOptionsSchema', () => {
  it('accepts valid limit', () => {
    const result = PaginationOptionsSchema.safeParse({ limit: 10 });
    expect(result.success).toBe(true);
  });

  it('accepts empty object', () => {
    const result = PaginationOptionsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects negative limit', () => {
    const result = PaginationOptionsSchema.safeParse({ limit: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects zero limit', () => {
    const result = PaginationOptionsSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects float limit', () => {
    const result = PaginationOptionsSchema.safeParse({ limit: 3.5 });
    expect(result.success).toBe(false);
  });
});

describe('FetchIssuesOptionsSchema', () => {
  it('accepts valid options', () => {
    const result = FetchIssuesOptionsSchema.safeParse({
      project: 'PROJ',
      assigneeCurrentUser: true,
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty object', () => {
    const result = FetchIssuesOptionsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects non-boolean assigneeCurrentUser', () => {
    const result = FetchIssuesOptionsSchema.safeParse({
      assigneeCurrentUser: 'yes',
    });
    expect(result.success).toBe(false);
  });
});

describe('StatusMappingUpdateSchema', () => {
  it('accepts valid update', () => {
    const result = StatusMappingUpdateSchema.safeParse({
      statusId: 3,
      categoryName: 'In Progress',
    });
    expect(result.success).toBe(true);
  });

  it('accepts null categoryName', () => {
    const result = StatusMappingUpdateSchema.safeParse({
      statusId: 3,
      categoryName: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing statusId', () => {
    const result = StatusMappingUpdateSchema.safeParse({
      categoryName: 'Done',
    });
    expect(result.success).toBe(false);
  });
});

describe('DatabaseDeleteResponseSchema', () => {
  it('accepts success response', () => {
    const result = DatabaseDeleteResponseSchema.safeParse({ success: true });
    expect(result.success).toBe(true);
  });

  it('accepts error response', () => {
    const result = DatabaseDeleteResponseSchema.safeParse({
      success: false,
      error: 'Database locked',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing success', () => {
    const result = DatabaseDeleteResponseSchema.safeParse({
      error: 'Something went wrong',
    });
    expect(result.success).toBe(false);
  });
});

describe('SyncResultSchema', () => {
  it('accepts valid result', () => {
    const result = SyncResultSchema.safeParse({ synced: 5, missing: 2 });
    expect(result.success).toBe(true);
  });

  it('rejects missing synced', () => {
    const result = SyncResultSchema.safeParse({ missing: 2 });
    expect(result.success).toBe(false);
  });

  it('rejects non-number values', () => {
    const result = SyncResultSchema.safeParse({
      synced: '5',
      missing: '2',
    });
    expect(result.success).toBe(false);
  });
});
