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
}

export interface JiraMyselfResponse {
  displayName: string;
  emailAddress: string;
}

export interface JiraRawProject {
  key: string;
  name: string;
}

export interface JiraProject {
  key: string;
  name: string;
}

export interface JiraIssueFields {
  summary: string;
  status: { name: string };
  issuetype: { name: string };
  priority: { name: string };
  parent?: {
    key: string;
    fields: { summary: string; issuetype?: { name: string } };
  };
  customfield_10014?: string | null;
}

export interface JiraRawIssue {
  key: string;
  fields: JiraIssueFields;
}

export interface JiraIssue {
  key: string;
  summary: string;
  status: string;
  issueType: string;
  priority: string;
  epicKey: string | null;
  epicSummary: string | null;
  parentIssueType: string | null;
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
