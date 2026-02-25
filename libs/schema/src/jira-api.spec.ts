import {
  JiraMyselfResponseSchema,
  JiraRawProjectSchema,
  JiraIssueFieldsSchema,
  JiraRawIssueSchema,
  JiraSearchResponseSchema,
  JiraStatusRawSchema,
  JiraStatusSearchResponseSchema,
} from './jira-api';

describe('JiraMyselfResponseSchema', () => {
  it('accepts valid response', () => {
    const result = JiraMyselfResponseSchema.safeParse({
      accountId: '5f9a3b2c1d',
      displayName: 'John Doe',
      emailAddress: 'john@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing accountId', () => {
    const result = JiraMyselfResponseSchema.safeParse({
      displayName: 'John Doe',
      emailAddress: 'john@example.com',
    });
    expect(result.success).toBe(false);
  });
});

describe('JiraRawProjectSchema', () => {
  it('accepts valid project', () => {
    const result = JiraRawProjectSchema.safeParse({
      key: 'PROJ',
      name: 'My Project',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing key', () => {
    const result = JiraRawProjectSchema.safeParse({ name: 'My Project' });
    expect(result.success).toBe(false);
  });
});

describe('JiraIssueFieldsSchema', () => {
  const validFields = {
    summary: 'Fix login bug',
    status: { name: 'In Progress' },
    issuetype: { name: 'Bug' },
    priority: { name: 'High' },
  };

  it('accepts minimal valid fields', () => {
    const result = JiraIssueFieldsSchema.safeParse(validFields);
    expect(result.success).toBe(true);
  });

  it('accepts fields with all optional properties', () => {
    const result = JiraIssueFieldsSchema.safeParse({
      ...validFields,
      status: { id: '3', name: 'In Progress', statusCategory: 'indeterminate' },
      assignee: {
        accountId: '123',
        displayName: 'John',
        emailAddress: 'john@example.com',
      },
      parent: {
        key: 'PROJ-1',
        fields: { summary: 'Epic', issuetype: { name: 'Epic' } },
      },
      customfield_10014: 'PROJ-1',
    });
    expect(result.success).toBe(true);
  });

  it('accepts statusCategory as object with key', () => {
    const result = JiraIssueFieldsSchema.safeParse({
      ...validFields,
      status: { name: 'Done', statusCategory: { key: 'done' } },
    });
    expect(result.success).toBe(true);
  });

  it('accepts null assignee', () => {
    const result = JiraIssueFieldsSchema.safeParse({
      ...validFields,
      assignee: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts null customfield_10014', () => {
    const result = JiraIssueFieldsSchema.safeParse({
      ...validFields,
      customfield_10014: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing summary', () => {
    const { summary: _, ...withoutSummary } = validFields;
    const result = JiraIssueFieldsSchema.safeParse(withoutSummary);
    expect(result.success).toBe(false);
  });
});

describe('JiraRawIssueSchema', () => {
  const validIssue = {
    key: 'PROJ-123',
    fields: {
      summary: 'Test issue',
      status: { name: 'Open' },
      issuetype: { name: 'Task' },
      priority: { name: 'Medium' },
    },
  };

  it('accepts valid issue without id', () => {
    const result = JiraRawIssueSchema.safeParse(validIssue);
    expect(result.success).toBe(true);
  });

  it('accepts string id', () => {
    const result = JiraRawIssueSchema.safeParse({ ...validIssue, id: '12345' });
    expect(result.success).toBe(true);
  });

  it('accepts numeric id', () => {
    const result = JiraRawIssueSchema.safeParse({ ...validIssue, id: 12345 });
    expect(result.success).toBe(true);
  });

  it('rejects missing key', () => {
    const { key: _, ...withoutKey } = validIssue;
    const result = JiraRawIssueSchema.safeParse(withoutKey);
    expect(result.success).toBe(false);
  });
});

describe('JiraSearchResponseSchema', () => {
  it('accepts valid response', () => {
    const result = JiraSearchResponseSchema.safeParse({
      issues: [
        {
          key: 'PROJ-1',
          fields: {
            summary: 'Issue 1',
            status: { name: 'Open' },
            issuetype: { name: 'Task' },
            priority: { name: 'Medium' },
          },
        },
      ],
      nextPageToken: 'abc',
      isLast: false,
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty issues array', () => {
    const result = JiraSearchResponseSchema.safeParse({ issues: [] });
    expect(result.success).toBe(true);
  });

  it('rejects missing issues', () => {
    const result = JiraSearchResponseSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('JiraStatusRawSchema', () => {
  it('accepts status with string category', () => {
    const result = JiraStatusRawSchema.safeParse({
      id: '3',
      name: 'In Progress',
      statusCategory: 'indeterminate',
    });
    expect(result.success).toBe(true);
  });

  it('accepts status with object category', () => {
    const result = JiraStatusRawSchema.safeParse({
      id: '1',
      name: 'Done',
      statusCategory: { id: 3, key: 'done', name: 'Done', colorName: 'green' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty object (all optional)', () => {
    const result = JiraStatusRawSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('JiraStatusSearchResponseSchema', () => {
  it('accepts valid response', () => {
    const result = JiraStatusSearchResponseSchema.safeParse({
      values: [{ id: '1', name: 'Open' }],
      nextPage: 'http://example.com/next',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty object', () => {
    const result = JiraStatusSearchResponseSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
