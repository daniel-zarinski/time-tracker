import { ipcMain, net } from 'electron';
import type {
  JiraConfig,
  JiraConfigInput,
  JiraMyselfResponse,
  JiraProject,
  JiraIssue,
  JiraStatusInfo,
  JiraRawProject,
  JiraRawIssue,
  JiraSearchResponse,
  JiraStatusSearchResponse,
  JiraStatusRaw,
} from '@time-tracker/jira';
import { JiraApiError } from '@time-tracker/jira';

function getStatusCategoryKey(
  cat: string | { key?: string } | undefined
): string | undefined {
  if (cat == null) return undefined;
  if (typeof cat === 'string') return cat;
  return cat.key;
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '');
}

export function toJiraConfig(input: JiraConfigInput): JiraConfig {
  const d = input.domain
    .trim()
    .toLowerCase()
    .replace(/\.atlassian\.net$/i, '');
  if (!d) throw new JiraApiError('Jira domain is required');
  const baseUrl = `https://${d}.atlassian.net`;
  return {
    baseUrl,
    email: input.email,
    token: input.token,
  };
}

function validateConfig(config: JiraConfig): void {
  if (!config?.baseUrl?.trim()) {
    throw new JiraApiError('Jira base URL is required');
  }
  if (!config?.email?.trim()) {
    throw new JiraApiError('Jira email is required');
  }
  if (!config?.token?.trim()) {
    throw new JiraApiError('Jira API token is required');
  }
}

class JiraService {
  private baseUrl: string;
  private authHeader: string;

  private static readonly REQUEST_TIMEOUT_MS = 30_000;

  constructor(config: JiraConfig) {
    this.baseUrl = normalizeBaseUrl(config.baseUrl);
    this.authHeader = `Basic ${Buffer.from(
      `${config.email}:${config.token}`
    ).toString('base64')}`;
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
    const timeoutId = setTimeout(
      () => controller.abort(),
      JiraService.REQUEST_TIMEOUT_MS
    );

    let response: Response;
    try {
      response = await net.fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          Authorization: this.authHeader,
          Accept: 'application/json',
        },
      });
    } catch (err) {
      const message =
        (err as Error).name === 'AbortError'
          ? `Request timed out after ${JiraService.REQUEST_TIMEOUT_MS / 1000}s`
          : (err as Error).message;
      throw new JiraApiError(
        `Failed to connect to ${this.baseUrl}: ${message}`
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
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

    return response.json() as Promise<T>;
  }

  async testConnection(): Promise<JiraMyselfResponse> {
    const data = await this.request<JiraMyselfResponse>('/rest/api/3/myself');
    return data;
  }

  async fetchProjects(): Promise<JiraProject[]> {
    const data = await this.request<JiraRawProject[]>('/rest/api/3/project');
    return data.map((p) => ({ key: p.key, name: p.name }));
  }

  private mapRawIssueToJiraIssue(raw: JiraRawIssue): JiraIssue {
    const parent = raw.fields?.parent;
    const epicLink = raw.fields?.customfield_10014;
    const epicKey =
      parent?.key ?? (typeof epicLink === 'string' ? epicLink : null);
    const epicSummary = parent?.fields?.summary ?? null;
    const parentIssueType = parent?.fields?.issuetype?.name ?? null;
    return {
      key: raw.key,
      summary: raw.fields?.summary ?? '',
      status: raw.fields?.status?.name ?? 'Unknown',
      issueType: raw.fields?.issuetype?.name ?? 'Unknown',
      priority: raw.fields?.priority?.name ?? 'Unknown',
      epicKey,
      epicSummary,
      parentIssueType,
    };
  }

  async fetchIssue(key: string): Promise<JiraIssue | null> {
    try {
      const data = await this.request<JiraRawIssue>(
        `/rest/api/3/issue/${encodeURIComponent(key)}`,
        {
          fields: 'summary,status,issuetype,priority,parent,customfield_10014',
        }
      );
      return this.mapRawIssueToJiraIssue(data);
    } catch {
      return null;
    }
  }

  private async buildSearchJql(options?: {
    project?: string;
    assigneeCurrentUser?: boolean;
  }): Promise<string> {
    let whereClause: string;
    if (options?.project) {
      whereClause = `project = ${options.project}`;
    } else {
      const projects = await this.fetchProjects();
      whereClause =
        projects.length > 0
          ? `project in (${projects.map((p) => p.key).join(', ')})`
          : '';
    }
    if (options?.assigneeCurrentUser) {
      whereClause = whereClause
        ? `(${whereClause}) AND assignee = currentUser()`
        : 'assignee = currentUser()';
    }
    return whereClause
      ? `${whereClause} ORDER BY updated DESC`
      : 'ORDER BY updated DESC';
  }

  private async *fetchSearchPages(
    jql: string
  ): AsyncGenerator<JiraRawIssue[], void, unknown> {
    const fields = 'summary,status,issuetype,priority,parent,customfield_10014';
    const maxResults = '50';
    const MAX_PAGES = 20;
    let nextPageToken: string | undefined;
    let pageCount = 0;
    let issues: JiraRawIssue[] = [];

    do {
      const params: Record<string, string> = { jql, fields, maxResults };
      if (nextPageToken) params.nextPageToken = nextPageToken;

      const data = await this.request<JiraSearchResponse>(
        '/rest/api/3/search/jql',
        params
      );
      issues = data.issues ?? [];
      yield issues;

      pageCount++;
      nextPageToken =
        data.isLast === false && data.nextPageToken
          ? data.nextPageToken
          : undefined;
    } while (nextPageToken && pageCount < MAX_PAGES && issues.length > 0);
  }

  async fetchIssues(options?: {
    project?: string;
    assigneeCurrentUser?: boolean;
  }): Promise<JiraIssue[]> {
    const jql = await this.buildSearchJql(options);
    const allIssues: JiraIssue[] = [];
    for await (const page of this.fetchSearchPages(jql)) {
      for (const raw of page) {
        allIssues.push(this.mapRawIssueToJiraIssue(raw));
      }
    }
    return allIssues;
  }

  async fetchMyIssues(project?: string): Promise<JiraIssue[]> {
    return this.fetchIssues({
      project: project === 'all' || !project ? undefined : project,
      assigneeCurrentUser: true,
    });
  }

  async fetchStatuses(): Promise<JiraStatusInfo[]> {
    const all: JiraStatusInfo[] = [];
    let startAt = 0;
    const maxResults = 100;
    let hasMore = true;

    while (hasMore) {
      const data = await this.request<JiraStatusSearchResponse>(
        '/rest/api/3/statuses/search',
        { startAt: String(startAt), maxResults: String(maxResults) }
      );
      const values = data.values ?? [];
      for (const s of values as JiraStatusRaw[]) {
        all.push({
          id: s.id ?? '',
          name: s.name ?? '',
          statusCategory: getStatusCategoryKey(s.statusCategory),
        });
      }
      startAt += values.length;
      hasMore = values.length >= maxResults;
    }

    return all;
  }

  async fetchStatusesForKeys(keys: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const unique = [...new Set(keys)].filter(Boolean);
    if (unique.length === 0) return result;

    const jql = `key in (${unique.map((k) => `"${k}"`).join(', ')})`;
    const data = await this.request<JiraSearchResponse>(
      '/rest/api/3/search/jql',
      {
        jql,
        fields: 'status',
        maxResults: String(Math.min(unique.length, 100)),
      }
    );

    for (const issue of data.issues ?? []) {
      result[issue.key] = issue.fields?.status?.name ?? 'Unknown';
    }
    return result;
  }
}

function serializeError(err: unknown): {
  message: string;
  statusCode?: number;
} {
  if (err instanceof JiraApiError) {
    const e = err;
    return { message: e.message, statusCode: e.statusCode };
  }
  return {
    message: err instanceof Error ? err.message : String(err),
  };
}

export function bootstrapJiraEvents(): void {
  ipcMain.handle(
    'jira:test-connection',
    async (_event, input: JiraConfigInput): Promise<JiraMyselfResponse> => {
      const config = toJiraConfig(input);
      validateConfig(config);
      try {
        const service = new JiraService(config);
        return service.testConnection();
      } catch (err) {
        throw serializeError(err);
      }
    }
  );

  ipcMain.handle(
    'jira:fetch-projects',
    async (_event, input: JiraConfigInput): Promise<JiraProject[]> => {
      const config = toJiraConfig(input);
      validateConfig(config);
      try {
        const service = new JiraService(config);
        return service.fetchProjects();
      } catch (err) {
        throw serializeError(err);
      }
    }
  );

  ipcMain.handle(
    'jira:fetch-issue',
    async (
      _event,
      input: JiraConfigInput,
      key: string
    ): Promise<JiraIssue | null> => {
      const config = toJiraConfig(input);
      validateConfig(config);
      try {
        const service = new JiraService(config);
        return service.fetchIssue(key);
      } catch (err) {
        throw serializeError(err);
      }
    }
  );

  ipcMain.handle(
    'jira:fetch-issues',
    async (
      _event,
      input: JiraConfigInput,
      options?: { project?: string; assigneeCurrentUser?: boolean }
    ): Promise<JiraIssue[]> => {
      const config = toJiraConfig(input);
      validateConfig(config);
      try {
        const service = new JiraService(config);
        return service.fetchIssues(options);
      } catch (err) {
        throw serializeError(err);
      }
    }
  );

  ipcMain.handle(
    'jira:fetch-my-issues',
    async (
      _event,
      input: JiraConfigInput,
      project?: string
    ): Promise<JiraIssue[]> => {
      const config = toJiraConfig(input);
      validateConfig(config);
      try {
        const service = new JiraService(config);
        return service.fetchMyIssues(project);
      } catch (err) {
        throw serializeError(err);
      }
    }
  );

  ipcMain.handle(
    'jira:fetch-statuses',
    async (_event, input: JiraConfigInput): Promise<JiraStatusInfo[]> => {
      const config = toJiraConfig(input);
      validateConfig(config);
      try {
        const service = new JiraService(config);
        return service.fetchStatuses();
      } catch (err) {
        throw serializeError(err);
      }
    }
  );

  ipcMain.handle(
    'jira:fetch-statuses-for-keys',
    async (
      _event,
      input: JiraConfigInput,
      keys: string[]
    ): Promise<Record<string, string>> => {
      const config = toJiraConfig(input);
      validateConfig(config);
      try {
        const service = new JiraService(config);
        return service.fetchStatusesForKeys(keys);
      } catch (err) {
        throw serializeError(err);
      }
    }
  );
}
