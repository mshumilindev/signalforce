import type { Weekday } from './types.js';

export interface ZonedDateTimeFields {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
}

const weekdayFromShort: Record<string, Weekday> = {
  Mon: 'monday',
  Tue: 'tuesday',
  Wed: 'wednesday',
  Thu: 'thursday',
  Fri: 'friday',
  Sat: 'saturday',
  Sun: 'sunday',
};

const jsDayToWeekday: readonly Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export function weekdayToJsDay(weekday: Weekday): number {
  return jsDayToWeekday.indexOf(weekday);
}

export function getZonedFields(instant: Date, timezone: string): ZonedDateTimeFields & { weekday: Weekday } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  });

  const parts = formatter.formatToParts(instant);
  const values: Record<string, string> = {};

  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = part.value;
    }
  }

  const weekday = weekdayFromShort[values.weekday ?? ''];

  if (!weekday) {
    throw new Error(`Unable to resolve weekday for timezone ${timezone}.`);
  }

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    weekday,
  };
}

export function createDateInTimezone(timezone: string, fields: ZonedDateTimeFields): Date {
  const targetMs = Date.UTC(fields.year, fields.month - 1, fields.day, fields.hour, fields.minute);
  let utcGuess = new Date(targetMs);

  for (let iteration = 0; iteration < 4; iteration++) {
    const zoned = getZonedFields(utcGuess, timezone);
    const shownMs = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute);
    const targetFromShown = Date.UTC(fields.year, fields.month - 1, fields.day, fields.hour, fields.minute);
    const deltaMs = targetFromShown - shownMs;

    if (deltaMs === 0) {
      return utcGuess;
    }

    utcGuess = new Date(utcGuess.getTime() + deltaMs);
  }

  return utcGuess;
}

export function addDaysInTimezone(
  timezone: string,
  fields: ZonedDateTimeFields,
  days: number,
): ZonedDateTimeFields {
  const anchor = createDateInTimezone(timezone, fields);
  const shifted = new Date(anchor.getTime() + days * 24 * 60 * 60 * 1000);
  const zoned = getZonedFields(shifted, timezone);

  return {
    year: zoned.year,
    month: zoned.month,
    day: zoned.day,
    hour: zoned.hour,
    minute: zoned.minute,
  };
}

export function addMonthsInTimezone(
  _timezone: string,
  fields: ZonedDateTimeFields,
  months: number,
): ZonedDateTimeFields {
  let year = fields.year;
  let month = fields.month + months;

  while (month > 12) {
    month -= 12;
    year += 1;
  }

  while (month < 1) {
    month += 12;
    year -= 1;
  }

  const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    year,
    month,
    day: Math.min(fields.day, maxDay),
    hour: fields.hour,
    minute: fields.minute,
  };
}

export function parsePreferredTime(preferredTime: string): { hour: number; minute: number } {
  const [hourPart, minutePart] = preferredTime.split(':');

  if (!hourPart || !minutePart) {
    throw new Error(`Invalid preferred time: ${preferredTime}`);
  }

  return {
    hour: Number(hourPart),
    minute: Number(minutePart),
  };
}

export function toIsoString(date: Date): string {
  return date.toISOString();
}
