export interface JiraClientConfig {
  baseUrl: string;
  headers: Record<string, string>;
  timeout?: number;
}

export interface JiraConfig {
  baseUrl: string;
  email: string;
  token: string;
}

/** Domain-based config for storage and IPC (baseUrl is inferred in API layer). */
export interface JiraConfigInput {
  domain: string;
  email: string;
  token: string;
  /** Cached from getMyself when saving; used by Tempo to filter worklogs. */
  accountId?: string;
}

export interface JiraMyselfResponse {
  accountId: string;
  displayName: string;
  emailAddress: string;
}

export interface JiraRawProject {
  key: string;
  name: string;
}

export type JiraProject = JiraRawProject;

export interface JiraIssueFields {
  summary: string;
  status: { name: string };
  issuetype: { name: string };
  priority: { name: string };
  assignee?: {
    accountId?: string;
    displayName?: string;
    emailAddress?: string;
  } | null;
  parent?: {
    key: string;
    fields: { summary: string; issuetype?: { name: string } };
  };
  customfield_10014?: string | null;
}

export interface JiraRawIssue {
  id?: string | number;
  key: string;
  fields: JiraIssueFields;
}

export interface JiraIssue {
  key: string | null;
  jiraId: number | null;
  summary: string;
  status: string;
  issueType: string;
  priority: string;
  epicKey: string | null;
  epicSummary: string | null;
  parentIssueType: string | null;
  assigneeEmail: string | null;
}

export interface JiraSearchResponse {
  issues: JiraRawIssue[];
  nextPageToken?: string;
  isLast?: boolean;
}

export interface JiraStatusInfo {
  id: string;
  name: string;
  statusCategory?: string;
  statusCategoryName?: string;
  colorName?: string;
}

interface JiraStatusCategory {
  id?: number;
  key?: string;
  name?: string;
  colorName?: string;
}

export interface JiraStatusRaw {
  id?: string;
  name?: string;
  statusCategory?: string | JiraStatusCategory;
}

export interface JiraStatusSearchResponse {
  values?: JiraStatusRaw[];
  nextPage?: string;
}

export class JiraApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'JiraApiError';
  }
}
