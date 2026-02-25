import {
  getClient,
  PrismaClient,
  upsertJiraIssue,
  upsertJiraStatuses,
} from '@time-tracker/database';
import type {
  JiraConfigInput,
  JiraMyselfResponse,
  JiraIssue,
  JiraStatusInfo,
  JiraRawProject,
  JiraRawIssue,
  JiraStatusRaw,
} from '@time-tracker/schema';
import type { JiraConfig, JiraProject } from '@time-tracker/jira';
import { JiraApiError, JiraClient } from '@time-tracker/jira';
import { getJiraIssuesUnsynced } from '@time-tracker/database';
import { getJiraConfig } from '../store/config-store';

const CATEGORY_KEY_TO_NAME: Record<string, string> = {
  new: 'To Do',
  indeterminate: 'In Progress',
  done: 'Done',
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

function getCategoryKey(
  cat: string | { key?: string } | undefined
): string | undefined {
  if (!cat) return undefined;
  return typeof cat === 'string' ? cat : cat.key;
}

function parseStatusCategory(
  cat: string | { key?: string; name?: string; colorName?: string } | undefined
) {
  if (!cat) return { key: undefined, name: undefined, colorName: undefined };

  const isObj = typeof cat === 'object';
  const key = isObj ? cat.key : cat;
  const name =
    isObj && cat.name != null ? cat.name : (key && CATEGORY_KEY_TO_NAME[key]);
  const colorName = isObj ? cat.colorName : undefined;

  return { key, name, colorName };
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
    const f = raw.fields;
    const status = f?.status;
    const parent = f?.parent;
    const epicKey =
      parent?.key ??
      (typeof f?.customfield_10014 === 'string' ? f.customfield_10014 : null);

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
      summary: f?.summary ?? '',
      status: status?.name ?? 'Unknown',
      statusId: status?.id ? parseInt(status.id, 10) : null,
      categoryKey: getCategoryKey(status?.statusCategory) ?? null,
      issueType: f?.issuetype?.name ?? 'Unknown',
      priority: f?.priority?.name ?? 'Unknown',
      epicKey,
      epicSummary: parent?.fields?.summary ?? null,
      parentIssueType: parent?.fields?.issuetype?.name ?? null,
      assigneeEmail: f?.assignee?.emailAddress ?? null,
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

  private async searchJiraIssues(jql: string): Promise<JiraIssue[]> {
    const data = await this.client.searchJql({
      jql,
      fields: ISSUE_FIELDS,
      maxResults: '500',
    });
    const rawIssues = data.issues ?? [];
    return rawIssues.map((raw) => this.mapRawIssueToJiraIssue(raw));
  }

  async fetchIssues(options?: {
    project?: string;
    assigneeCurrentUser?: boolean;
  }): Promise<JiraIssue[]> {
    const jql = this.buildSearchJql(options);
    const issues = await this.searchJiraIssues(jql);

    await Promise.all(issues.map((i) => upsertJiraIssue(this.prisma, i)));

    return issues;
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

    const statuses: JiraStatusInfo[] = values
      .filter((s): s is JiraStatusRaw & { id: string } => s.id != null)
      .map((s) => {
        const cat = parseStatusCategory(s.statusCategory);
        return {
          id: parseInt(s.id, 10),
          name: s.name ?? '',
          statusCategory: cat.key,
          statusCategoryName: cat.name,
          colorName: cat.colorName,
        };
      });

    // Persist statuses to DB (with denormalized category fields)
    await upsertJiraStatuses(
      this.prisma,
      statuses.map((s) => ({
        id: s.id,
        name: s.name,
        categoryName: s.statusCategoryName ?? null,
        categoryKey: s.statusCategory ?? null,
        colorName: s.colorName ?? null,
      }))
    );

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
