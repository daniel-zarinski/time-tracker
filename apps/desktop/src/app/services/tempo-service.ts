import { getClient, upsertWorklogs } from '@time-tracker/database';
import type { WorklogUpsertInput } from '@time-tracker/database';
import type { TempoWorklog } from '@time-tracker/tempo';
import { TempoApiError, TempoClient } from '@time-tracker/tempo';
import { getJiraConfig, getTempoConfig } from '../store/config-store';
import { resolveConfig as resolveJiraConfig } from './jira-service';

function parseTempoDateTime(dateStr: string, timeStr?: string): Date {
  if (timeStr) {
    return new Date(`${dateStr}T${timeStr}Z`);
  }
  return new Date(`${dateStr}T00:00:00Z`);
}

function tempoWorklogToUpsertInput(w: TempoWorklog): WorklogUpsertInput {
  return {
    tempoWorklogId: w.tempoWorklogId,
    jiraWorklogId: w.jiraWorklogId ?? null,
    issueId: w.issue?.id ?? null,
    timeSpentSeconds: w.timeSpentSeconds,
    billableSeconds: w.billableSeconds,
    startedAt: parseTempoDateTime(w.startDate, w.startTime),
    description: w.description ?? '',
    authorAccountId: w.author.accountId,
    authorName: w.author.displayName ?? null,
    tempoCreatedAt: w.createdAt ?? null,
    tempoUpdatedAt: w.updatedAt ?? null,
  };
}

export function resolveTempoConfig(override?: { token: string }): {
  token: string;
} {
  const config = override ?? getTempoConfig();
  if (!config?.token?.trim()) {
    throw new TempoApiError(
      'Tempo is not configured. Add an API token in Settings.'
    );
  }
  return config;
}

const DAYS_BACK = 30;
const LIMIT = 200;

export class TempoService {
  private client: TempoClient;

  constructor(config: { token: string }) {
    this.client = new TempoClient(config);
  }

  async testConnection(): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    await this.client.getWorklogs({ from: today, to: today, limit: '1' });
  }

  /** Syncs latest worklogs from Tempo. Requires Jira for accountId (to filter your worklogs). */
  async syncWorklogs(): Promise<number> {
    try {
      resolveJiraConfig();
    } catch {
      throw new TempoApiError(
        'Jira must be configured to sync worklogs. We need your account ID to filter your worklogs.'
      );
    }

    const to = new Date().toISOString().slice(0, 10);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - DAYS_BACK);
    const from = fromDate.toISOString().slice(0, 10);

    const myAccountId = getJiraConfig()?.accountId;
    if (!myAccountId) {
      throw new TempoApiError(
        'Jira account ID not found. Save your Jira settings to cache it.'
      );
    }

    const response = await this.client.getWorklogsByUser(myAccountId, {
      from,
      to,
      offset: '0',
      limit: String(LIMIT),
    });
    const results = response.results ?? [];

    if (results.length === 0) {
      return 0;
    }

    const inputs: WorklogUpsertInput[] = results.map((w) =>
      tempoWorklogToUpsertInput(w)
    );

    const prisma = getClient();
    await upsertWorklogs(prisma, inputs);
    return inputs.length;
  }
}
