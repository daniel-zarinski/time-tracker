import { JiraConfigInputSchema, TempoConfigSchema } from './config';

describe('JiraConfigInputSchema', () => {
  it('accepts valid config with all fields', () => {
    const result = JiraConfigInputSchema.safeParse({
      domain: 'mycompany.atlassian.net',
      email: 'user@example.com',
      token: 'abc123',
      accountId: '5f9a3b2c1d',
    });
    expect(result.success).toBe(true);
  });

  it('accepts config without optional accountId', () => {
    const result = JiraConfigInputSchema.safeParse({
      domain: 'mycompany.atlassian.net',
      email: 'user@example.com',
      token: 'abc123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing domain', () => {
    const result = JiraConfigInputSchema.safeParse({
      email: 'user@example.com',
      token: 'abc123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = JiraConfigInputSchema.safeParse({
      domain: 'x.atlassian.net',
      token: 'abc123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing token', () => {
    const result = JiraConfigInputSchema.safeParse({
      domain: 'x.atlassian.net',
      email: 'a@b.com',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-string values', () => {
    const result = JiraConfigInputSchema.safeParse({
      domain: 123,
      email: 'a@b.com',
      token: 'tok',
    });
    expect(result.success).toBe(false);
  });
});

describe('TempoConfigSchema', () => {
  it('accepts valid config', () => {
    const result = TempoConfigSchema.safeParse({ token: 'tempo-token-123' });
    expect(result.success).toBe(true);
  });

  it('rejects missing token', () => {
    const result = TempoConfigSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects non-string token', () => {
    const result = TempoConfigSchema.safeParse({ token: 42 });
    expect(result.success).toBe(false);
  });
});
