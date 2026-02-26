export { startOfDay, endOfDay } from 'date-fns';
import {
  format,
  parse,
  startOfDay,
  addMinutes,
  addSeconds,
  differenceInMinutes,
} from 'date-fns';

export function toTimeString(date: Date): string {
  return format(date, 'HH:mm');
}

export function timeStringToMinutes(time: string): number {
  const ref = new Date(0);
  const parsed = parse(time.trim(), 'H:mm', ref);
  if (isNaN(parsed.getTime())) return 0;
  return differenceInMinutes(parsed, startOfDay(parsed));
}

export function minutesToTimeString(totalMinutes: number): string {
  const ref = new Date(0);
  const clamped = Math.max(0, Math.min(1439, Math.floor(totalMinutes)));
  const date = addMinutes(startOfDay(ref), clamped);
  return format(date, 'HH:mm');
}

export function combineDateAndTime(date: Date, time: string): Date {
  return parse(time.trim(), 'H:mm', date);
}

export function formatDurationHHMM(seconds: number): string {
  const ref = new Date(0);
  const total = Math.max(0, Math.floor(seconds));
  const date = addSeconds(startOfDay(ref), total);
  return format(date, 'HH:mm');
}

export const HOURS_PER_DAY = 7;
export const SECONDS_PER_WORKDAY = HOURS_PER_DAY * 3600;

export function parseDurationHHMM(value: string): number | null {
  const ref = new Date(0);
  const parsed = parse(value.trim(), 'H:mm', ref);
  if (isNaN(parsed.getTime())) return null;
  if (parsed.getMinutes() >= 60) return null;
  return parsed.getHours() * 3600 + parsed.getMinutes() * 60;
}
