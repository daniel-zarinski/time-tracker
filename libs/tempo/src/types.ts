export type {
  TempoWorklog,
  TempoWorklogsResponse,
  TempoCreateWorklogInput,
  TempoUpdateWorklogInput,
} from '@time-tracker/schema';

export interface TempoClientConfig {
  token: string;
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

export class TempoApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'TempoApiError';
  }
}
