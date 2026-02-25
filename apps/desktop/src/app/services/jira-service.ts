import {
  getClient,
  PrismaClient,
  upsertJiraIssue,
  upsertJiraStatusCategories,
  upsertJiraStatuses,
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
import { getJiraIssuesUnsynced } from '@time-tracker/database';
import { getJiraConfig } from '../store/config-store';

function getStatusCategoryKey(
  cat: string | { key?: string } | undefined
): string | undefined {
  if (cat == null) return undefined;
  if (typeof cat === 'string') return cat;
  return cat.key;
}

const STATUS_CATEGORY_KEY_TO_NAME: Record<string, string> = {
  // Object-form keys (older API responses)
  new: 'To Do',
  indeterminate: 'In Progress',
  done: 'Done',
  // String-form values (current API responses)
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const STATUS_CATEGORY_TO_KEY: Record<string, string> = {
  TODO: 'new',
  IN_PROGRESS: 'indeterminate',
  DONE: 'done',
};

function getStatusCategoryInfo(
  cat: string | { key?: string; name?: string; colorName?: string } | undefined
): { key?: string; name?: string; colorName?: string } {
  if (cat == null) return {};
  if (typeof cat === 'string') {
    return {
      key: STATUS_CATEGORY_TO_KEY[cat] ?? cat,
      name: STATUS_CATEGORY_KEY_TO_NAME[cat],
    };
  }
  return {
    key: cat.key,
    name: cat.name ?? (cat.key ? STATUS_CATEGORY_KEY_TO_NAME[cat.key] : undefined),
    colorName: cat.colorName,
  };
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

export function validateConfig(config: JiraConfig): void {
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

export function resolveConfig(input?: JiraConfigInput): JiraConfig {
  const raw = input ?? getJiraConfig();
  if (!raw) throw new JiraApiError('Jira is not configured');
  const config = toJiraConfig(raw);
  validateConfig(config);
  return config;
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
    const jiraId =
      raw.id != null
        ? typeof raw.id === 'string'
          ? parseInt(raw.id, 10)
          : raw.id
        : null;
    const jiraIdValid =
      typeof jiraId === 'number' && !Number.isNaN(jiraId) ? jiraId : null;
    return {
      key: raw.key,
      jiraId: jiraIdValid,
      summary: raw.fields?.summary ?? '',
      status: raw.fields?.status?.name ?? 'Unknown',
      statusId: raw.fields?.status?.id ?? null,
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
    await upsertJiraIssue(this.prisma, issue); // TODO: Remove this
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

  private async fetchAndUpsertPages(jql: string): Promise<JiraIssue[]> {
    const maxResults = '50';
    const MAX_PAGES = 20;
    let nextPageToken: string | undefined;
    let pageCount = 0;
    const allIssues: JiraIssue[] = [];

    do {
      const data = await this.client.searchJql({
        jql,
        fields: ISSUE_FIELDS,
        maxResults,
        ...(nextPageToken && { nextPageToken }),
      });
      const rawIssues = data.issues ?? [];
      const mapped = rawIssues.map((raw) => this.mapRawIssueToJiraIssue(raw));

      await Promise.all(mapped.map((i) => upsertJiraIssue(this.prisma, i)));
      allIssues.push(...mapped);

      pageCount++;
      nextPageToken =
        data.isLast === false && data.nextPageToken
          ? data.nextPageToken
          : undefined;
    } while (nextPageToken && pageCount < MAX_PAGES);

    return allIssues;
  }

  async fetchIssues(options?: {
    project?: string;
    assigneeCurrentUser?: boolean;
  }): Promise<JiraIssue[]> {
    const jql = this.buildSearchJql(options);
    return this.fetchAndUpsertPages(jql);
  }

  async fetchMyIssues(project?: string): Promise<JiraIssue[]> {
    return this.fetchIssues({
      project: project === 'all' || !project ? undefined : project,
      assigneeCurrentUser: true,
    });
  }

  async fetchStatuses(): Promise<JiraStatusInfo[]> {
    const data = await this.client.getStatuses({ maxResults: '200' });
    const values = (data.values ?? []) as JiraStatusRaw[];

    const categoryMap = new Map<string, { name: string; key: string; colorName?: string }>();
    const statuses: JiraStatusInfo[] = values.map((s) => {
      const catInfo = getStatusCategoryInfo(s.statusCategory);
      if (catInfo.name && catInfo.key) {
        categoryMap.set(catInfo.name, {
          name: catInfo.name,
          key: catInfo.key,
          colorName: catInfo.colorName,
        });
      }
      return {
        id: s.id ?? '',
        name: s.name ?? '',
        statusCategory: getStatusCategoryKey(s.statusCategory),
        statusCategoryName: catInfo.name,
        colorName: catInfo.colorName,
      };
    });

    // Persist categories and statuses to DB
    const categories = Array.from(categoryMap.values());
    if (categories.length > 0) {
      await upsertJiraStatusCategories(this.prisma, categories);
    }
    if (statuses.length > 0) {
      await upsertJiraStatuses(
        this.prisma,
        statuses.map((s) => ({
          id: s.id,
          name: s.name,
          categoryName: s.statusCategoryName ?? null,
        }))
      );
    }

    return statuses;
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

  async syncMyIssues(): Promise<{ synced: number; missing: number }> {
    const synced = await this.fetchMyIssues();
    let totalMissing = 0;

    for (let round = 0; round < 10; round++) {
      const unsynced = await getJiraIssuesUnsynced(this.prisma);
      if (unsynced.length === 0) break;
      totalMissing += unsynced.length;
      await this.fetchMissingIssues();
    }

    return { synced: synced.length, missing: totalMissing };
  }

  async fetchMissingIssues() {
    console.log('Fetching missing issues');
    const issues = await getJiraIssuesUnsynced(this.prisma);
    console.log(`Found ${issues.length} missing issues`);

    for (const issue of issues) {
      const identifier =
        issue.key ?? (issue.jiraId != null ? String(issue.jiraId) : null);
      console.log(`Fetching issue ${issue.key ?? issue.jiraId}`);
      if (identifier) {
        await this.fetchIssue(identifier).catch((err) => {
          console.error(`Error fetching issue ${identifier}: ${err}`);
        });
      } else {
        console.error(`Issue has neither key nor jiraId`);
      }
    }
    console.log('Done fetching missing issues');
  }
}
