import {
  JiraIssueUpsertInputSchema,
  JiraStatusInputSchema,
  JiraStatusWithCategorySchema,
} from './database-inputs';

describe('JiraIssueUpsertInputSchema', () => {
  const base = {
    summary: 'Fix bug',
    status: 'In Progress',
    issueType: 'Bug',
    priority: 'High',
  };

  it('accepts input with key', () => {
    const result = JiraIssueUpsertInputSchema.safeParse({
      ...base,
      key: 'PROJ-1',
    });
    expect(result.success).toBe(true);
  });

  it('accepts input with jiraId', () => {
    const result = JiraIssueUpsertInputSchema.safeParse({
      ...base,
      jiraId: 12345,
    });
    expect(result.success).toBe(true);
  });

  it('accepts input with both key and jiraId', () => {
    const result = JiraIssueUpsertInputSchema.safeParse({
      ...base,
      key: 'PROJ-1',
      jiraId: 12345,
    });
    expect(result.success).toBe(true);
  });

  it('rejects input with neither key nor jiraId', () => {
    const result = JiraIssueUpsertInputSchema.safeParse(base);
    expect(result.success).toBe(false);
  });

  it('rejects when key is null and jiraId is null', () => {
    const result = JiraIssueUpsertInputSchema.safeParse({
      ...base,
      key: null,
      jiraId: null,
    });
    expect(result.success).toBe(false);
  });

  it('accepts when key is null but jiraId is present', () => {
    const result = JiraIssueUpsertInputSchema.safeParse({
      ...base,
      key: null,
      jiraId: 123,
    });
    expect(result.success).toBe(true);
  });

  it('accepts all optional nullable fields', () => {
    const result = JiraIssueUpsertInputSchema.safeParse({
      ...base,
      key: 'PROJ-1',
      statusId: 3,
      categoryKey: 'indeterminate',
      epicKey: 'PROJ-0',
      assigneeEmail: 'dev@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required summary', () => {
    const result = JiraIssueUpsertInputSchema.safeParse({
      key: 'PROJ-1',
      status: 'Open',
      issueType: 'Task',
      priority: 'Medium',
    });
    expect(result.success).toBe(false);
  });
});

describe('JiraStatusInputSchema', () => {
  it('accepts valid status', () => {
    const result = JiraStatusInputSchema.safeParse({
      id: 1,
      name: 'Open',
      categoryName: 'To Do',
      categoryKey: 'new',
      colorName: 'blue-gray',
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal status', () => {
    const result = JiraStatusInputSchema.safeParse({
      id: 1,
      name: 'Open',
    });
    expect(result.success).toBe(true);
  });

  it('accepts null optional fields', () => {
    const result = JiraStatusInputSchema.safeParse({
      id: 1,
      name: 'Open',
      categoryName: null,
      categoryKey: null,
      colorName: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing id', () => {
    const result = JiraStatusInputSchema.safeParse({ name: 'Open' });
    expect(result.success).toBe(false);
  });
});

describe('JiraStatusWithCategorySchema', () => {
  it('accepts valid status with category', () => {
    const result = JiraStatusWithCategorySchema.safeParse({
      id: 1,
      name: 'Open',
      categoryName: 'To Do',
      categoryKey: 'new',
      colorName: 'blue-gray',
    });
    expect(result.success).toBe(true);
  });

  it('accepts null category fields (required but nullable)', () => {
    const result = JiraStatusWithCategorySchema.safeParse({
      id: 1,
      name: 'Open',
      categoryName: null,
      categoryKey: null,
      colorName: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing categoryName (required field)', () => {
    const result = JiraStatusWithCategorySchema.safeParse({
      id: 1,
      name: 'Open',
      categoryKey: null,
      colorName: null,
    });
    expect(result.success).toBe(false);
  });
});
