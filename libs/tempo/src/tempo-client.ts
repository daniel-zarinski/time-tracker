import type {
  TempoClientConfig,
  TempoCreateWorklogInput,
  TempoGetWorklogsParams,
  TempoGetUserWorklogsParams,
  TempoUpdateWorklogInput,
  TempoWorklog,
  TempoWorklogsResponse,
} from './types';
import { TempoApiError } from './types';

const BASE_URL = 'https://api.tempo.io';

async function throwOnTempoError(response: Response): Promise<void> {
  if (response.ok) return;
  let detail = '';
  try {
    const body = (await response.json()) as {
      errorMessages?: string[];
      message?: string;
      error?: string;
    };
    detail =
      body.errorMessages?.join(', ') || body.message || body.error || '';
  } catch {
    /* ignore parse errors */
  }
  throw new TempoApiError(
    detail || `Tempo API error: ${response.status} ${response.statusText}`,
    response.status
  );
}

export class TempoClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: TempoClientConfig) {
    this.baseUrl = BASE_URL;
    this.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.token}`,
    };
  }

  private async request<T>(
    path: string,
    options?: { method?: string; body?: string; params?: Record<string, string> }
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (options?.params) {
      for (const [k, v] of Object.entries(options.params)) {
        url.searchParams.set(k, v);
      }
    }

    try {
      const response = await fetch(url.toString(), {
        method: options?.method ?? 'GET',
        headers: this.headers,
        body: options?.body,
      });
      await throwOnTempoError(response);
      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof TempoApiError) throw err;
      throw new TempoApiError(
        `Failed to connect to ${this.baseUrl}: ${(err as Error).message}`
      );
    }
  }

  getWorklogs(params?: TempoGetWorklogsParams): Promise<TempoWorklogsResponse> {
    const query: Record<string, string> = {};
    if (params?.offset) query.offset = params.offset;
    if (params?.limit) query.limit = params.limit;
    if (params?.project) query.project = params.project;
    if (params?.issue) query.issue = params.issue;
    if (params?.from) query.from = params.from;
    if (params?.to) query.to = params.to;
    if (params?.updatedFrom) query.updatedFrom = params.updatedFrom;
    if (params?.accountId) query.accountId = params.accountId;
    return this.request<TempoWorklogsResponse>('/4/worklogs', {
      params: Object.keys(query).length > 0 ? query : undefined,
    });
  }

  /** Fetches worklogs for a specific user. Use this endpoint for user-scoped worklog retrieval. */
  getWorklogsByUser(
    accountId: string,
    params?: TempoGetUserWorklogsParams
  ): Promise<TempoWorklogsResponse> {
    const query: Record<string, string> = {};
    if (params?.from) query.from = params.from;
    if (params?.to) query.to = params.to;
    if (params?.offset) query.offset = params.offset;
    if (params?.limit) query.limit = params.limit;
    return this.request<TempoWorklogsResponse>(
      `/4/worklogs/user/${encodeURIComponent(accountId)}`,
      { params: Object.keys(query).length > 0 ? query : undefined }
    );
  }

  createWorklog(body: TempoCreateWorklogInput): Promise<TempoWorklog> {
    return this.request<TempoWorklog>('/4/worklogs', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  getWorklogByJiraId(jiraWorklogId: number): Promise<TempoWorklog> {
    return this.request<TempoWorklog>(
      `/4/worklogs/jira/${encodeURIComponent(String(jiraWorklogId))}`
    );
  }

  updateWorklog(
    tempoWorklogId: number,
    body: TempoUpdateWorklogInput
  ): Promise<TempoWorklog> {
    return this.request<TempoWorklog>(
      `/4/worklogs/${encodeURIComponent(String(tempoWorklogId))}`,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      }
    );
  }
}
