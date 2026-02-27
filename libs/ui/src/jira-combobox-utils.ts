import type { ComboboxSelectItem } from './combobox-select';

export function ensureKey(issue: { key: string | null }): string {
  if (issue.key == null) {
    console.error('Issue key is required', issue);
    return '';
  }
  return issue.key;
}

export function jiraIssuesToComboboxItems(
  issues: Array<{ key: string | null; summary?: string | null }>
): ComboboxSelectItem[] {
  return issues
    .filter((i) => i.key != null)
    .map((i) => ({
      value: ensureKey(i),
      label: ensureKey(i),
      description: i.summary ?? undefined,
    }));
}
