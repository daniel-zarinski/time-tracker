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

const schema = {
  [JIRA_CONFIG_KEY]: {
    type: 'object',
    properties: {
      domain: { type: 'string' },
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
} as const;

export const configStore = new Store({
  name: 'config',
  schema,
});

function domainFromBaseUrl(baseUrl: string): string {
  try {
    const url = new URL(baseUrl);
    const host = url.hostname;
    return host.replace(/\.atlassian\.net$/, '') || '';
  } catch {
    return '';
  }
}

function resolveDomain(raw: {
  domain?: string;
  baseUrl?: string;
}): string | undefined {
  if (typeof raw.domain === 'string' && raw.domain.trim()) {
    return raw.domain.trim();
  }
  if (typeof raw.baseUrl === 'string' && raw.baseUrl.trim()) {
    const d = domainFromBaseUrl(raw.baseUrl);
    return d || undefined;
  }
  return undefined;
}

export function getJiraConfig(): JiraConfigInput | undefined {
  const raw = configStore.get(JIRA_CONFIG_KEY) as Record<string, unknown> | undefined;
  if (!raw || typeof raw !== 'object') return undefined;

  const domain = resolveDomain(raw as { domain?: string; baseUrl?: string });
  if (!domain) return undefined;

  const result = JiraConfigInputSchema.safeParse({
    domain,
    email: raw.email,
    token: raw.token,
    accountId: raw.accountId || undefined,
  });
  return result.success ? result.data : undefined;
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
