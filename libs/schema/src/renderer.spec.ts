import { TabValueSchema, PersistedStateSchema } from './renderer';

describe('TabValueSchema', () => {
  const validTabs = ['home', 'tasks', 'timeline', 'jira-issues', 'settings'];

  it.each(validTabs)('accepts "%s"', (tab) => {
    const result = TabValueSchema.safeParse(tab);
    expect(result.success).toBe(true);
  });

  it('rejects invalid tab', () => {
    const result = TabValueSchema.safeParse('dashboard');
    expect(result.success).toBe(false);
  });

  it('rejects empty string', () => {
    const result = TabValueSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});

describe('PersistedStateSchema', () => {
  it('accepts valid state', () => {
    const result = PersistedStateSchema.safeParse({
      elapsed: 120,
      activeTab: 'home',
    });
    expect(result.success).toBe(true);
  });

  it('accepts zero elapsed', () => {
    const result = PersistedStateSchema.safeParse({
      elapsed: 0,
      activeTab: 'tasks',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing elapsed', () => {
    const result = PersistedStateSchema.safeParse({ activeTab: 'home' });
    expect(result.success).toBe(false);
  });

  it('rejects missing activeTab', () => {
    const result = PersistedStateSchema.safeParse({ elapsed: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid activeTab value', () => {
    const result = PersistedStateSchema.safeParse({
      elapsed: 0,
      activeTab: 'invalid-tab',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-number elapsed', () => {
    const result = PersistedStateSchema.safeParse({
      elapsed: '120',
      activeTab: 'home',
    });
    expect(result.success).toBe(false);
  });
});
