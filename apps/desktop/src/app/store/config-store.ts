/**
 * Electron store for persisting app config (Jira credentials, etc.).
 * Uses electron-store - data is saved in config.json under app.getPath('userData').
 * @see https://github.com/sindresorhus/electron-store
 */

import Store from 'electron-store';
import { JiraConfigInputSchema, TempoConfigSchema } from '@time-tracker/schema';
import type { JiraConfigInput, TempoConfig } from '@time-tracker/schema';

const JIRA_CONFIG_KEY = 'jira.config' as const;
const TEMPO_CONFIG_KEY = 'tempo.config' as const;
const APP_THEME_KEY = 'app.theme' as const;

export type AppTheme = 'light' | 'dark';

const schema = {
  [JIRA_CONFIG_KEY]: {
    type: 'object',
    properties: {
      company: { type: 'string' },
      domain: { type: 'string' }, // legacy — migrated to company on read
      email: { type: 'string' },
      token: { type: 'string' },
      accountId: { type: 'string' },
    },
    default: undefined,
  },
  [TEMPO_CONFIG_KEY]: {
    type: 'object',
    properties: {
      token: { type: 'string' },
    },
    default: undefined,
  },
  [APP_THEME_KEY]: {
    type: 'string',
    enum: ['light', 'dark'],
    default: undefined,
  },
} as const;

export const configStore = new Store({
  name: 'config',
  schema,
});

export function getJiraConfig(): JiraConfigInput | undefined {
  const raw = configStore.get(JIRA_CONFIG_KEY) as Record<string, unknown> | undefined;
  if (!raw || typeof raw !== 'object') return undefined;

  // Migrate legacy "domain" → "company"
  const input = raw.company ? raw : { ...raw, company: raw.domain };

  const result = JiraConfigInputSchema.safeParse(input);
  if (!result.success) return undefined;

  // Persist migration so legacy key is replaced
  if (!raw.company && raw.domain) {
    configStore.set(JIRA_CONFIG_KEY, result.data);
  }

  return result.data;
}

export function setJiraConfig(config: JiraConfigInput): void {
  configStore.set(JIRA_CONFIG_KEY, config);
}

export function getTempoConfig(): TempoConfig | undefined {
  const raw = configStore.get(TEMPO_CONFIG_KEY);
  const result = TempoConfigSchema.safeParse(raw);
  return result.success ? result.data : undefined;
}

export function setTempoConfig(config: TempoConfig): void {
  configStore.set(TEMPO_CONFIG_KEY, config);
}

export function getAppTheme(): AppTheme | undefined {
  const raw = configStore.get(APP_THEME_KEY);
  if (raw === 'light' || raw === 'dark') return raw;
  return undefined;
}

export function setAppTheme(theme: AppTheme): void {
  configStore.set(APP_THEME_KEY, theme);
}
