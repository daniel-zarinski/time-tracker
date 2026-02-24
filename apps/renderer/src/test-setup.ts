import { vi } from 'vitest';

Object.assign(globalThis.window, {
  store: {
    getJiraConfig: vi.fn().mockResolvedValue(undefined),
    setJiraConfig: vi.fn().mockResolvedValue(undefined),
    getTempoConfig: vi.fn().mockResolvedValue(undefined),
    setTempoConfig: vi.fn().mockResolvedValue(undefined),
  },
  jira: {
    saveConfig: vi.fn().mockResolvedValue(undefined),
    getJiraIssues: vi.fn().mockResolvedValue([]),
    fetchMyIssues: vi.fn().mockResolvedValue([]),
    testConnection: vi.fn().mockResolvedValue({}),
  },
  tempo: {
    testConnection: vi.fn().mockResolvedValue(undefined),
    syncWorklogs: vi.fn().mockResolvedValue(0),
  },
  electron: {
    openExternal: vi.fn().mockResolvedValue(undefined),
    openJiraExternal: vi.fn().mockResolvedValue(undefined),
    showItemInFolder: vi.fn().mockResolvedValue(undefined),
  },
});
