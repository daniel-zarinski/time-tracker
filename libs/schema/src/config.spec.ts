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

  it('rejects empty strings', () => {
    expect(
      JiraConfigInputSchema.safeParse({ domain: '', email: 'a@b.com', token: 'tok' }).success
    ).toBe(false);
    expect(
      JiraConfigInputSchema.safeParse({ domain: 'x', email: '  ', token: 'tok' }).success
    ).toBe(false);
    expect(
      JiraConfigInputSchema.safeParse({ domain: 'x', email: 'a@b.com', token: '' }).success
    ).toBe(false);
  });

  it('trims whitespace from values', () => {
    const result = JiraConfigInputSchema.safeParse({
      domain: '  mycompany  ',
      email: '  user@example.com  ',
      token: '  abc123  ',
      accountId: '  5f9a3b2c1d  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.domain).toBe('mycompany');
      expect(result.data.email).toBe('user@example.com');
      expect(result.data.token).toBe('abc123');
      expect(result.data.accountId).toBe('5f9a3b2c1d');
    }
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

  it('rejects empty token', () => {
    expect(TempoConfigSchema.safeParse({ token: '' }).success).toBe(false);
    expect(TempoConfigSchema.safeParse({ token: '   ' }).success).toBe(false);
  });

  it('trims whitespace from token', () => {
    const result = TempoConfigSchema.safeParse({ token: '  abc  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.token).toBe('abc');
    }
  });
});
