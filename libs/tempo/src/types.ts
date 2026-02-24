export interface TempoClientConfig {
  token: string;
}

/** Tempo API v4 returns issue.id and issue.self only; v3 included issue.key */
export interface TempoWorklogIssue {
  self?: string;
  key?: string;
  id?: number;
}

export interface TempoWorklogAuthor {
  self?: string;
  accountId: string;
  displayName?: string;
}

export interface TempoWorklog {
  self?: string;
  tempoWorklogId: number;
  jiraWorklogId?: number;
  issue: TempoWorklogIssue;
  timeSpentSeconds: number;
  billableSeconds: number;
  startDate: string;
  startTime?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  author: TempoWorklogAuthor;
  attributes?: { self?: string; values?: unknown[] };
}

export interface TempoWorklogsResponse {
  self: string;
  metadata: {
    count: number;
    next?: string;
  };
  results: TempoWorklog[];
}

export interface TempoCreateWorklogInput {
  originTaskId: string;
  timeSpentSeconds: number;
  billableSeconds?: number;
  started: string;
  workerId?: string;
  authorAccountId?: string;
  comment?: string;
  remainingEstimate?: number;
  attributes?: Record<string, { value: string }>;
}

export interface TempoGetWorklogsParams {
  offset?: string;
  limit?: string;
  project?: string;
  issue?: string;
  from?: string;
  to?: string;
  updatedFrom?: string;
  /** Jira accountId to filter worklogs by author (for /4/worklogs). */
  accountId?: string;
}

/** Params for /4/worklogs/user/{accountId} - no accountId in params. */
export interface TempoGetUserWorklogsParams {
  from?: string;
  to?: string;
  offset?: string;
  limit?: string;
}

export interface TempoUpdateWorklogInput {
  issueKey: string;
  timeSpentSeconds: number;
  billableSeconds?: number;
  startDate: string;
  startTime?: string;
  authorAccountId: string;
  attributes?: Array<{ key: string; value: string }>;
}

export class TempoApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'TempoApiError';
  }
}
