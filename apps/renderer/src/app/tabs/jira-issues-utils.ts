const OTHER_STATUSES = [
  'DEV COMPLETED',
  'Done',
  'Inactive',
  'Cancelled',
] as const;

export const OTHER_STATUS_SET = new Set(OTHER_STATUSES);

const STATUS_ORDER = [
  'In Progress',
  'To Do',
  'New',
  'Code Review',
  'In Test',
  'To Test',
  'Other',
] as const;

export function toTabValue(status: string | undefined | null): string {
  if (status == null || typeof status !== 'string') return '';
  return status
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function sortStatuses(statuses: string[]): string[] {
  const normalized = (s: string) => s.toLowerCase().trim();
  const orderMap = new Map(STATUS_ORDER.map((s, i) => [normalized(s), i]));
  return [...statuses].sort((a, b) => {
    const aNorm = normalized(a);
    const bNorm = normalized(b);
    const aIdx = orderMap.get(aNorm) ?? STATUS_ORDER.length;
    const bIdx = orderMap.get(bNorm) ?? STATUS_ORDER.length;
    if (aIdx !== bIdx) return aIdx - bIdx;
    return a.localeCompare(b);
  });
}
