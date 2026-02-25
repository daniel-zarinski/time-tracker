import type { JiraRawProject } from '@time-tracker/schema';

export type {
  JiraConfigInput,
  JiraMyselfResponse,
  JiraRawProject,
  JiraIssueFields,
  JiraRawIssue,
  JiraIssue,
  JiraSearchResponse,
  JiraStatusInfo,
  JiraStatusRaw,
  JiraStatusSearchResponse,
} from '@time-tracker/schema';

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

export type JiraProject = JiraRawProject;

export class JiraApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'JiraApiError';
  }
}
