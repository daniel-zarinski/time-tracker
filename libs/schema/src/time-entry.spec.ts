import {
  CreateTimeEntryInputSchema,
  UpdateTimeEntryInputSchema,
} from './time-entry';

describe('CreateTimeEntryInputSchema', () => {
  it('accepts valid input with issueKey only', () => {
    const result = CreateTimeEntryInputSchema.safeParse({
      issueKey: 'PROJ-123',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid input with description', () => {
    const result = CreateTimeEntryInputSchema.safeParse({
      issueKey: 'PROJ-123',
      description: 'Working on bug fix',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing issueKey', () => {
    const result = CreateTimeEntryInputSchema.safeParse({
      description: 'Some work',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-string issueKey', () => {
    const result = CreateTimeEntryInputSchema.safeParse({ issueKey: 123 });
    expect(result.success).toBe(false);
  });
});

describe('UpdateTimeEntryInputSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    const result = UpdateTimeEntryInputSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts startedAt as Date', () => {
    const result = UpdateTimeEntryInputSchema.safeParse({
      startedAt: new Date('2025-01-15T10:00:00Z'),
    });
    expect(result.success).toBe(true);
  });

  it('accepts timeSpentSeconds', () => {
    const result = UpdateTimeEntryInputSchema.safeParse({
      timeSpentSeconds: 3600,
    });
    expect(result.success).toBe(true);
  });

  it('accepts description', () => {
    const result = UpdateTimeEntryInputSchema.safeParse({
      description: 'Updated description',
    });
    expect(result.success).toBe(true);
  });

  it('accepts all fields together', () => {
    const result = UpdateTimeEntryInputSchema.safeParse({
      startedAt: new Date(),
      timeSpentSeconds: 1800,
      description: 'Half hour of work',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-Date startedAt', () => {
    const result = UpdateTimeEntryInputSchema.safeParse({
      startedAt: '2025-01-15',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-number timeSpentSeconds', () => {
    const result = UpdateTimeEntryInputSchema.safeParse({
      timeSpentSeconds: '3600',
    });
    expect(result.success).toBe(false);
  });
});
