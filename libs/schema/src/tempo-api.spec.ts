import {
  TempoWorklogSchema,
  TempoWorklogsResponseSchema,
  TempoCreateWorklogInputSchema,
  TempoUpdateWorklogInputSchema,
} from './tempo-api';

describe('TempoWorklogSchema', () => {
  const validWorklog = {
    tempoWorklogId: 1001,
    issue: { id: 12345 },
    timeSpentSeconds: 3600,
    billableSeconds: 3600,
    startDate: '2025-01-15',
    author: { accountId: '5f9a3b2c1d' },
  };

  it('accepts minimal valid worklog', () => {
    const result = TempoWorklogSchema.safeParse(validWorklog);
    expect(result.success).toBe(true);
  });

  it('accepts fully populated worklog', () => {
    const result = TempoWorklogSchema.safeParse({
      self: 'https://api.tempo.io/4/worklogs/1001',
      tempoWorklogId: 1001,
      jiraWorklogId: 5001,
      issue: {
        self: 'https://jira.example.com/rest/api/2/issue/12345',
        key: 'PROJ-123',
        id: 12345,
      },
      timeSpentSeconds: 3600,
      billableSeconds: 1800,
      startDate: '2025-01-15',
      startTime: '09:00:00',
      description: 'Worked on feature',
      createdAt: '2025-01-15T09:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
      author: {
        self: 'https://example.com/user',
        accountId: '5f9a3b2c1d',
        displayName: 'John Doe',
      },
      attributes: { self: 'https://example.com/attrs', values: [] },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing tempoWorklogId', () => {
    const { tempoWorklogId: _, ...withoutId } = validWorklog;
    const result = TempoWorklogSchema.safeParse(withoutId);
    expect(result.success).toBe(false);
  });

  it('rejects missing author', () => {
    const { author: _, ...withoutAuthor } = validWorklog;
    const result = TempoWorklogSchema.safeParse(withoutAuthor);
    expect(result.success).toBe(false);
  });

  it('rejects missing author.accountId', () => {
    const result = TempoWorklogSchema.safeParse({
      ...validWorklog,
      author: { displayName: 'John' },
    });
    expect(result.success).toBe(false);
  });
});

describe('TempoWorklogsResponseSchema', () => {
  it('accepts valid response', () => {
    const result = TempoWorklogsResponseSchema.safeParse({
      self: 'https://api.tempo.io/4/worklogs',
      metadata: { count: 1, next: 'https://api.tempo.io/4/worklogs?offset=1' },
      results: [
        {
          tempoWorklogId: 1,
          issue: {},
          timeSpentSeconds: 3600,
          billableSeconds: 0,
          startDate: '2025-01-15',
          author: { accountId: 'abc' },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty results', () => {
    const result = TempoWorklogsResponseSchema.safeParse({
      self: 'https://api.tempo.io/4/worklogs',
      metadata: { count: 0 },
      results: [],
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing self', () => {
    const result = TempoWorklogsResponseSchema.safeParse({
      metadata: { count: 0 },
      results: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('TempoCreateWorklogInputSchema', () => {
  it('accepts valid input', () => {
    const result = TempoCreateWorklogInputSchema.safeParse({
      originTaskId: 'PROJ-123',
      timeSpentSeconds: 3600,
      started: '2025-01-15',
    });
    expect(result.success).toBe(true);
  });

  it('accepts all optional fields', () => {
    const result = TempoCreateWorklogInputSchema.safeParse({
      originTaskId: 'PROJ-123',
      timeSpentSeconds: 3600,
      billableSeconds: 1800,
      started: '2025-01-15',
      workerId: 'worker-1',
      authorAccountId: '5f9a3b2c1d',
      comment: 'Working on feature',
      remainingEstimate: 7200,
      attributes: { _Category_: { value: 'development' } },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing originTaskId', () => {
    const result = TempoCreateWorklogInputSchema.safeParse({
      timeSpentSeconds: 3600,
      started: '2025-01-15',
    });
    expect(result.success).toBe(false);
  });
});

describe('TempoUpdateWorklogInputSchema', () => {
  it('accepts valid input', () => {
    const result = TempoUpdateWorklogInputSchema.safeParse({
      issueKey: 'PROJ-123',
      timeSpentSeconds: 3600,
      startDate: '2025-01-15',
      authorAccountId: '5f9a3b2c1d',
    });
    expect(result.success).toBe(true);
  });

  it('accepts with attributes array', () => {
    const result = TempoUpdateWorklogInputSchema.safeParse({
      issueKey: 'PROJ-123',
      timeSpentSeconds: 3600,
      startDate: '2025-01-15',
      authorAccountId: '5f9a3b2c1d',
      attributes: [{ key: '_Category_', value: 'development' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing authorAccountId', () => {
    const result = TempoUpdateWorklogInputSchema.safeParse({
      issueKey: 'PROJ-123',
      timeSpentSeconds: 3600,
      startDate: '2025-01-15',
    });
    expect(result.success).toBe(false);
  });
});
