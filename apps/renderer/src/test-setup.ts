import { vi } from 'vitest';

Object.assign(globalThis.window, {
  store: {
    getJiraConfig: vi.fn().mockResolvedValue(undefined),
    setJiraConfig: vi.fn().mockResolvedValue(undefined),
  },
  jira: {
    getJiraIssues: vi.fn().mockResolvedValue([]),
    fetchMyIssues: vi.fn().mockResolvedValue([]),
    testConnection: vi.fn().mockResolvedValue({}),
  },
  electron: {
    openExternal: vi.fn().mockResolvedValue(undefined),
    openJiraExternal: vi.fn().mockResolvedValue(undefined),
    showItemInFolder: vi.fn().mockResolvedValue(undefined),
  },
});
