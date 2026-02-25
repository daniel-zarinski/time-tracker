import {
  JiraConfigInputSchema,
  TempoConfigSchema,
  jiraDomain,
  ATLASSIAN_DOMAIN_SUFFIX,
} from './config';

describe('JiraConfigInputSchema', () => {
  it('accepts valid config with all fields', () => {
    const result = JiraConfigInputSchema.safeParse({
      company: 'mycompany',
      email: 'user@example.com',
      token: 'abc123',
      accountId: '5f9a3b2c1d',
    });
    expect(result.success).toBe(true);
  });

  it('accepts config without optional accountId', () => {
    const result = JiraConfigInputSchema.safeParse({
      company: 'mycompany',
      email: 'user@example.com',
      token: 'abc123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing company', () => {
    const result = JiraConfigInputSchema.safeParse({
      email: 'user@example.com',
      token: 'abc123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = JiraConfigInputSchema.safeParse({
      company: 'mycompany',
      token: 'abc123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing token', () => {
    const result = JiraConfigInputSchema.safeParse({
      company: 'mycompany',
      email: 'a@b.com',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-string values', () => {
    const result = JiraConfigInputSchema.safeParse({
      company: 123,
      email: 'a@b.com',
      token: 'tok',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty strings', () => {
    expect(
      JiraConfigInputSchema.safeParse({ company: '', email: 'a@b.com', token: 'tok' }).success
    ).toBe(false);
    expect(
      JiraConfigInputSchema.safeParse({ company: 'x', email: '  ', token: 'tok' }).success
    ).toBe(false);
    expect(
      JiraConfigInputSchema.safeParse({ company: 'x', email: 'a@b.com', token: '' }).success
    ).toBe(false);
  });

  it('trims whitespace from values', () => {
    const result = JiraConfigInputSchema.safeParse({
      company: '  mycompany  ',
      email: '  user@example.com  ',
      token: '  abc123  ',
      accountId: '  5f9a3b2c1d  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company).toBe('mycompany');
      expect(result.data.email).toBe('user@example.com');
      expect(result.data.token).toBe('abc123');
      expect(result.data.accountId).toBe('5f9a3b2c1d');
    }
  });

  describe('company normalization', () => {
    it('strips .atlassian.net suffix and lowercases', () => {
      const result = JiraConfigInputSchema.safeParse({
        company: 'MyCompany.atlassian.net',
        email: 'a@b.com',
        token: 'tok',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.company).toBe('mycompany');
      }
    });

    it('handles uppercase suffix with surrounding whitespace', () => {
      const result = JiraConfigInputSchema.safeParse({
        company: '  ACME.Atlassian.NET  ',
        email: 'a@b.com',
        token: 'tok',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.company).toBe('acme');
      }
    });

    it('passes through already-clean company', () => {
      const result = JiraConfigInputSchema.safeParse({
        company: 'mycompany',
        email: 'a@b.com',
        token: 'tok',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.company).toBe('mycompany');
      }
    });

    it('rejects company that is empty after stripping suffix', () => {
      const result = JiraConfigInputSchema.safeParse({
        company: '.atlassian.net',
        email: 'a@b.com',
        token: 'tok',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('jiraDomain', () => {
  it('appends the Atlassian domain suffix', () => {
    expect(jiraDomain('mycompany')).toBe('mycompany.atlassian.net');
  });

  it('uses the ATLASSIAN_DOMAIN_SUFFIX constant', () => {
    expect(ATLASSIAN_DOMAIN_SUFFIX).toBe('.atlassian.net');
    expect(jiraDomain('acme')).toBe(`acme${ATLASSIAN_DOMAIN_SUFFIX}`);
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
