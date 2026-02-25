import { JiraIssueSchema, JiraStatusInfoSchema } from './jira-models';

describe('JiraIssueSchema', () => {
  const validIssue = {
    key: 'PROJ-123',
    jiraId: 12345,
    summary: 'Fix login bug',
    status: 'In Progress',
    statusId: 3,
    categoryKey: 'indeterminate',
    issueType: 'Bug',
    priority: 'High',
    epicKey: 'PROJ-1',
    epicSummary: 'Authentication Epic',
    parentIssueType: 'Epic',
    assigneeEmail: 'dev@example.com',
  };

  it('accepts fully populated issue', () => {
    const result = JiraIssueSchema.safeParse(validIssue);
    expect(result.success).toBe(true);
  });

  it('accepts issue with null fields', () => {
    const result = JiraIssueSchema.safeParse({
      key: null,
      jiraId: null,
      summary: 'Test',
      status: 'Open',
      statusId: null,
      categoryKey: null,
      issueType: 'Task',
      priority: 'Medium',
      epicKey: null,
      epicSummary: null,
      parentIssueType: null,
      assigneeEmail: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts issue without optional categoryKey', () => {
    const { categoryKey: _, ...withoutCategory } = validIssue;
    const result = JiraIssueSchema.safeParse(withoutCategory);
    expect(result.success).toBe(true);
  });

  it('rejects missing summary', () => {
    const { summary: _, ...withoutSummary } = validIssue;
    const result = JiraIssueSchema.safeParse(withoutSummary);
    expect(result.success).toBe(false);
  });

  it('rejects non-string status', () => {
    const result = JiraIssueSchema.safeParse({ ...validIssue, status: 123 });
    expect(result.success).toBe(false);
  });
});

describe('JiraStatusInfoSchema', () => {
  it('accepts full status info', () => {
    const result = JiraStatusInfoSchema.safeParse({
      id: 3,
      name: 'In Progress',
      statusCategory: 'indeterminate',
      statusCategoryName: 'In Progress',
      colorName: 'blue-gray',
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal status info', () => {
    const result = JiraStatusInfoSchema.safeParse({
      id: 1,
      name: 'Open',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing id', () => {
    const result = JiraStatusInfoSchema.safeParse({ name: 'Open' });
    expect(result.success).toBe(false);
  });

  it('rejects non-number id', () => {
    const result = JiraStatusInfoSchema.safeParse({ id: '3', name: 'Open' });
    expect(result.success).toBe(false);
  });
});
