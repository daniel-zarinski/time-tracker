import {
  toTimeString,
  timeStringToMinutes,
  minutesToTimeString,
  combineDateAndTime,
  formatDurationHHMM,
  parseDurationHHMM,
  startOfDay,
  endOfDay,
} from './date-time';

/**
 * Context: TimeEntryFormSchema (Zod) validates startTime/endTime as /^\d{2}:\d{2}$/ (HH:mm).
 * So combineDateAndTime, timeStringToMinutes receive validated HH:mm from the form.
 * parseDurationHHMM gets raw input from the duration field (no Zod) — user can type "2:30" or invalid strings.
 */
describe('toTimeString', () => {
  it('formats date as HH:mm', () => {
    expect(toTimeString(new Date(2025, 0, 15, 14, 30))).toBe('14:30');
  });

  it('formats midnight as 00:00', () => {
    expect(toTimeString(new Date(2025, 0, 15, 0, 0))).toBe('00:00');
  });

  it('formats 23:59 correctly', () => {
    expect(toTimeString(new Date(2025, 0, 15, 23, 59))).toBe('23:59');
  });
});

describe('timeStringToMinutes', () => {
  it('parses HH:mm (form schema format)', () => {
    expect(timeStringToMinutes('09:00')).toBe(540);
    expect(timeStringToMinutes('00:00')).toBe(0);
    expect(timeStringToMinutes('23:59')).toBe(1439);
  });

  it('parses H:mm (1-digit hours, duration input)', () => {
    expect(timeStringToMinutes('9:30')).toBe(570);
  });

  it('returns 0 for invalid input', () => {
    expect(timeStringToMinutes('')).toBe(0);
    expect(timeStringToMinutes('abc')).toBe(0);
    expect(timeStringToMinutes('invalid')).toBe(0);
  });

  it('returns 0 for hours > 23 (date-fns H:mm rejects)', () => {
    expect(timeStringToMinutes('25:00')).toBe(0);
  });

  it('trims whitespace', () => {
    expect(timeStringToMinutes('  09:00  ')).toBe(540);
  });
});

describe('minutesToTimeString', () => {
  it('formats minutes as HH:mm', () => {
    expect(minutesToTimeString(0)).toBe('00:00');
    expect(minutesToTimeString(90)).toBe('01:30');
    expect(minutesToTimeString(1439)).toBe('23:59');
  });

  it('clamps to 0-1439', () => {
    expect(minutesToTimeString(-5)).toBe('00:00');
    expect(minutesToTimeString(1440)).toBe('23:59');
  });

  it('floors fractional minutes', () => {
    expect(minutesToTimeString(90.7)).toBe('01:30');
  });
});

describe('combineDateAndTime', () => {
  it('combines date with time string', () => {
    const date = new Date(2025, 5, 15); // June 15
    const result = combineDateAndTime(date, '09:30');
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(30);
  });

  it('accepts H:mm format', () => {
    const date = new Date(2025, 0, 1);
    const result = combineDateAndTime(date, '9:00');
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(0);
  });

  it('trims whitespace', () => {
    const date = new Date(2025, 0, 1);
    const result = combineDateAndTime(date, '  14:00  ');
    expect(result.getHours()).toBe(14);
  });
});

describe('formatDurationHHMM', () => {
  it('formats seconds as HH:mm', () => {
    expect(formatDurationHHMM(0)).toBe('00:00');
    expect(formatDurationHHMM(3600)).toBe('01:00');
    expect(formatDurationHHMM(9000)).toBe('02:30');
  });

  it('clamps negative to 00:00', () => {
    expect(formatDurationHHMM(-100)).toBe('00:00');
  });

  it('floors fractional seconds', () => {
    expect(formatDurationHHMM(90.9)).toBe('00:01');
  });
});

describe('parseDurationHHMM', () => {
  it('parses H:mm and H:mm formats', () => {
    expect(parseDurationHHMM('2:30')).toBe(9000);
    expect(parseDurationHHMM('02:30')).toBe(9000);
    expect(parseDurationHHMM('0:00')).toBe(0);
  });

  it('returns null for invalid input', () => {
    expect(parseDurationHHMM('')).toBeNull();
    expect(parseDurationHHMM('abc')).toBeNull();
    expect(parseDurationHHMM('invalid')).toBeNull();
  });

  it('returns null for hours > 23', () => {
    expect(parseDurationHHMM('25:00')).toBeNull();
  });

  it('returns null for minutes >= 60', () => {
    expect(parseDurationHHMM('2:60')).toBeNull();
    expect(parseDurationHHMM('2:99')).toBeNull();
  });

  it('parses valid edge cases', () => {
    expect(parseDurationHHMM('23:59')).toBe(23 * 3600 + 59 * 60);
    expect(parseDurationHHMM('0:01')).toBe(60);
  });

  it('trims whitespace', () => {
    expect(parseDurationHHMM('  2:30  ')).toBe(9000);
  });
});

describe('startOfDay / endOfDay (re-exports)', () => {
  it('startOfDay returns midnight', () => {
    const d = new Date(2025, 5, 15, 14, 30, 45);
    const result = startOfDay(d);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });

  it('endOfDay returns 23:59:59.999', () => {
    const d = new Date(2025, 5, 15);
    const result = endOfDay(d);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
  });
});
