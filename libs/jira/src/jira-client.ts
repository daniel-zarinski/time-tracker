import type {
  JiraClientConfig,
  JiraMyselfResponse,
  JiraRawProject,
  JiraRawIssue,
  JiraSearchResponse,
  JiraStatusSearchResponse,
} from './types';
import { JiraApiError } from './types';

const DEFAULT_TIMEOUT_MS = 30_000;

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '');
}

async function throwOnJiraError(response: Response): Promise<void> {
  if (response.ok) return;
  let detail = '';
  try {
    const body = (await response.json()) as {
      errorMessages?: string[];
      message?: string;
    };
    detail = body.errorMessages?.join(', ') || body.message || '';
  } catch {
    /* ignore parse errors */
  }
  throw new JiraApiError(
    detail || `Jira API error: ${response.status} ${response.statusText}`,
    response.status
  );
}

export class JiraClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private timeoutMs: number;

  constructor(config: JiraClientConfig) {
    this.baseUrl = normalizeBaseUrl(config.baseUrl);
    this.headers = {
      Accept: 'application/json',
      ...config.headers,
    };
    this.timeoutMs = config.timeout ?? DEFAULT_TIMEOUT_MS;
  }

  private async request<T>(
    path: string,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: this.headers,
      });
      await throwOnJiraError(response);
      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof JiraApiError) throw err;
      const message =
        (err as Error).name === 'AbortError'
          ? `Request timed out after ${this.timeoutMs / 1000}s`
          : (err as Error).message;
      throw new JiraApiError(
        `Failed to connect to ${this.baseUrl}: ${message}`
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  getMyself(): Promise<JiraMyselfResponse> {
    return this.request<JiraMyselfResponse>('/rest/api/3/myself');
  }

  getProjects(): Promise<JiraRawProject[]> {
    return this.request<JiraRawProject[]>('/rest/api/3/project');
  }

  getIssue(
    key: string,
    fields?: string
  ): Promise<JiraRawIssue> {
    const params = fields ? { fields } : undefined;
    return this.request<JiraRawIssue>(
      `/rest/api/3/issue/${encodeURIComponent(key)}`,
      params
    );
  }

  searchJql(params: {
    jql: string;
    fields?: string;
    maxResults?: string;
    nextPageToken?: string;
  }): Promise<JiraSearchResponse> {
    const query: Record<string, string> = { jql: params.jql };
    if (params.fields) query.fields = params.fields;
    if (params.maxResults) query.maxResults = params.maxResults;
    if (params.nextPageToken) query.nextPageToken = params.nextPageToken;
    return this.request<JiraSearchResponse>('/rest/api/3/search/jql', query);
  }

  getStatuses(params?: {
    startAt?: string;
    maxResults?: string;
  }): Promise<JiraStatusSearchResponse> {
    return this.request<JiraStatusSearchResponse>(
      '/rest/api/3/statuses/search',
      params
    );
  }
}
