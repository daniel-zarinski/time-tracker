/**
 * Electron store for caching API responses (Jira projects, issues, etc.).
 * Uses electron-store - data is saved in cache.json under app.getPath('userData').
 * @see https://github.com/sindresorhus/electron-store
 */

import Store from 'electron-store';

const cacheStore = new Store({
  name: 'cache',
});

export const CACHE_KEY_JIRA_PROJECTS = 'jira.projects';
export const CACHE_KEY_JIRA_ISSUES = 'jira.issues';
export const CACHE_TTL_JIRA_PROJECTS_MS = 3_600_000; // 1 hour
export const CACHE_TTL_JIRA_ISSUES_MS = 900_000; // 15 minutes

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

function isCacheEntry<T>(raw: unknown): raw is CacheEntry<T> {
  if (!raw || typeof raw !== 'object') return false;
  const obj = raw as Record<string, unknown>;
  return (
    'data' in obj && 'fetchedAt' in obj && typeof obj.fetchedAt === 'number'
  );
}

/**
 * Returns cached data if it exists and is within the TTL window.
 * Otherwise returns undefined.
 */
export function getCached<T>(key: string, ttlMs: number): T | undefined {
  const raw = cacheStore.get(key);
  if (!isCacheEntry<T>(raw)) return undefined;

  const age = Date.now() - raw.fetchedAt;
  if (age > ttlMs) return undefined;

  return raw.data;
}

/**
 * Writes data to the cache with the current timestamp.
 */
export function setCached<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = {
    data,
    fetchedAt: Date.now(),
  };
  cacheStore.set(key, entry);
}

/**
 * Clears all cached data (Jira projects, issues, etc.).
 * Does not affect the config store (credentials).
 */
export function clearCache(): void {
  cacheStore.clear();
}
