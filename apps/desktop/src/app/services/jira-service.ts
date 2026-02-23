import {
  getClient,
  PrismaClient,
  upsertJiraIssue,
} from '@time-tracker/database';
import type {
  JiraConfig,
  JiraConfigInput,
  JiraMyselfResponse,
  JiraProject,
  JiraIssue,
  JiraStatusInfo,
  JiraRawProject,
  JiraRawIssue,
  JiraStatusRaw,
} from '@time-tracker/jira';
import { JiraApiError, JiraClient } from '@time-tracker/jira';

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

const ISSUE_FIELDS =
  'summary,status,issuetype,priority,assignee,parent,customfield_10014';

export class JiraService {
  private client: JiraClient;
  private prisma: PrismaClient;

  constructor(config: JiraConfig) {
    const baseUrl = normalizeBaseUrl(config.baseUrl);
    const authHeader = `Basic ${Buffer.from(
      `${config.email}:${config.token}`
    ).toString('base64')}`;
    this.prisma = getClient();

    this.client = new JiraClient({
      baseUrl,
      headers: {
        Authorization: authHeader,
      },
    });
  }

  async testConnection(): Promise<JiraMyselfResponse> {
    return this.client.getMyself();
  }

  async fetchProjects(): Promise<JiraProject[]> {
    const data = await this.client.getProjects();
    const projects = data.map((p: JiraRawProject) => ({
      key: p.key,
      name: p.name,
    }));

    return projects;
  }

  private mapRawIssueToJiraIssue(raw: JiraRawIssue): JiraIssue {
    const parent = raw.fields?.parent;
    const epicLink = raw.fields?.customfield_10014;
    const epicKey =
      parent?.key ?? (typeof epicLink === 'string' ? epicLink : null);
    const epicSummary = parent?.fields?.summary ?? null;
    const parentIssueType = parent?.fields?.issuetype?.name ?? null;
    const assigneeEmail = raw.fields?.assignee?.emailAddress ?? null;
    return {
      key: raw.key,
      summary: raw.fields?.summary ?? '',
      status: raw.fields?.status?.name ?? 'Unknown',
      issueType: raw.fields?.issuetype?.name ?? 'Unknown',
      priority: raw.fields?.priority?.name ?? 'Unknown',
      epicKey,
      epicSummary,
      parentIssueType,
      assigneeEmail,
    };
  }

  async fetchIssue(key: string): Promise<JiraIssue | null> {
    const data = await this.client.getIssue(key, ISSUE_FIELDS);
    const issue = this.mapRawIssueToJiraIssue(data);
    await upsertJiraIssue(this.prisma, issue);
    return issue;
  }

  private buildSearchJql(options?: {
    project?: string;
    assigneeCurrentUser?: boolean;
  }): string {
    let whereClause = '';
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
    const maxResults = '50';
    const MAX_PAGES = 20;
    let nextPageToken: string | undefined;
    let pageCount = 0;
    let issues: JiraRawIssue[] = [];

    do {
      const data = await this.client.searchJql({
        jql,
        fields: ISSUE_FIELDS,
        maxResults,
        ...(nextPageToken && { nextPageToken }),
      });
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
    const jql = this.buildSearchJql(options);
    const allIssues: JiraIssue[] = [];
    for await (const page of this.fetchSearchPages(jql)) {
      for (const raw of page) {
        allIssues.push(this.mapRawIssueToJiraIssue(raw));
      }
    }

    await Promise.all(allIssues.map((i) => upsertJiraIssue(this.prisma, i)));

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
      const data = await this.client.getStatuses({
        startAt: String(startAt),
        maxResults: String(maxResults),
      });
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
    const data = await this.client.searchJql({
      jql,
      fields: 'status',
      maxResults: String(Math.min(unique.length, 100)),
    });

    for (const issue of data.issues ?? []) {
      result[issue.key] = issue.fields?.status?.name ?? 'Unknown';
    }
    return result;
  }
}
